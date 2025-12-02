from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from users.serializers import UserSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .serializers import (
    CustomLoginSerializer,
    CustomRegisterSerializer,
    PasswordResetRequestSerializer,
    CustomPasswordResetConfirmSerializer,
    EmailVerificationSerializer,
    ResendVerificationSerializer,
    SocialAuthCodeSerializer,
    AuthResponseSerializer,
)

from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from urllib.parse import urlencode
import requests
import os


@extend_schema(tags=["auth"])
class RegisterView(generics.CreateAPIView):
    serializer_class = CustomRegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        # Create UserProfile with accepted_legal_policies True
        from users.models import UserProfile

        UserProfile.objects.create(user=user, accepted_legal_policies=True)


@extend_schema(tags=["auth"], responses={200: AuthResponseSerializer})
class LoginView(generics.GenericAPIView):
    serializer_class = CustomLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data,
        }
        return Response(data, status=status.HTTP_200_OK)


# Social OAuth login initiation views
@extend_schema(tags=["auth"], responses={200: {"type": "object", "properties": {"auth_url": {"type": "string"}}}})
class GoogleLoginInitView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = None  # No request body needed for GET

    def get(self, request):
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        # Get client_id from SOCIALACCOUNT_PROVIDERS or environment
        client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth/callback/google")
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "online",
            "prompt": "select_account",
        }
        url = f"{base_url}?{urlencode(params)}"
        return Response({"auth_url": url})


@extend_schema(tags=["auth"], responses={200: {"type": "object", "properties": {"auth_url": {"type": "string"}}}})
class GitHubLoginInitView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = None  # No request body needed for GET

    def get(self, request):
        base_url = "https://github.com/login/oauth/authorize"
        client_id = os.getenv("GITHUB_CLIENT_ID", "")
        redirect_uri = os.getenv("GITHUB_REDIRECT_URI", f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth/callback/github")
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": "user user:email",
        }
        url = f"{base_url}?{urlencode(params)}"
        return Response({"auth_url": url})


# Social OAuth callback - exchange code for JWT
@extend_schema(tags=["auth"], request=SocialAuthCodeSerializer, responses={200: AuthResponseSerializer})
class GoogleCallbackView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = SocialAuthCodeSerializer

    def post(self, request):
        code = request.data.get("code")
        if not code:
            return Response({"error": "Authorization code is required."}, status=400)

        # Exchange code for access token
        token_url = "https://oauth2.googleapis.com/token"
        client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth/callback/google")

        token_data = {
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }

        try:
            token_response = requests.post(token_url, data=token_data)
            token_json = token_response.json()

            if "error" in token_json:
                return Response({"error": token_json.get("error_description", "Token exchange failed.")}, status=400)

            access_token = token_json.get("access_token")

            # Get user info from Google
            userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            userinfo_response = requests.get(userinfo_url, headers={"Authorization": f"Bearer {access_token}"})
            userinfo = userinfo_response.json()

            email = userinfo.get("email")
            name = userinfo.get("name", "")
            google_id = userinfo.get("id")

            if not email:
                return Response({"error": "Could not retrieve email from Google."}, status=400)

            # Get or create user
            from django.contrib.auth.models import User
            from users.models import UserProfile

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email.split("@")[0] + "_" + google_id[:6],
                    "first_name": name.split()[0] if name else "",
                    "last_name": " ".join(name.split()[1:]) if name and len(name.split()) > 1 else "",
                }
            )

            if created:
                user.set_unusable_password()
                user.save()
                UserProfile.objects.get_or_create(user=user, defaults={"accepted_legal_policies": True, "is_verified": True})
            else:
                # Mark as verified if logging in via social
                profile, _ = UserProfile.objects.get_or_create(user=user)
                if not profile.is_verified:
                    profile.is_verified = True
                    profile.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data,
            })

        except requests.RequestException as e:
            return Response({"error": f"Failed to communicate with Google: {str(e)}"}, status=500)


@extend_schema(tags=["auth"], request=SocialAuthCodeSerializer, responses={200: AuthResponseSerializer})
class GitHubCallbackView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = SocialAuthCodeSerializer

    def post(self, request):
        code = request.data.get("code")
        if not code:
            return Response({"error": "Authorization code is required."}, status=400)

        # Exchange code for access token
        token_url = "https://github.com/login/oauth/access_token"
        client_id = os.getenv("GITHUB_CLIENT_ID", "")
        client_secret = os.getenv("GITHUB_CLIENT_SECRET", "")
        redirect_uri = os.getenv("GITHUB_REDIRECT_URI", f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth/callback/github")

        token_data = {
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
        }

        try:
            token_response = requests.post(token_url, data=token_data, headers={"Accept": "application/json"})
            token_json = token_response.json()

            if "error" in token_json:
                return Response({"error": token_json.get("error_description", "Token exchange failed.")}, status=400)

            access_token = token_json.get("access_token")

            # Get user info from GitHub
            userinfo_url = "https://api.github.com/user"
            userinfo_response = requests.get(userinfo_url, headers={"Authorization": f"Bearer {access_token}"})
            userinfo = userinfo_response.json()

            # Get email (might be private, need to fetch from /user/emails)
            email = userinfo.get("email")
            if not email:
                emails_response = requests.get(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                emails = emails_response.json()
                primary_email = next((e for e in emails if e.get("primary")), None)
                email = primary_email.get("email") if primary_email else None

            if not email:
                return Response({"error": "Could not retrieve email from GitHub."}, status=400)

            github_id = str(userinfo.get("id"))
            name = userinfo.get("name") or userinfo.get("login", "")
            username = userinfo.get("login", email.split("@")[0])

            # Get or create user
            from django.contrib.auth.models import User
            from users.models import UserProfile

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": username + "_gh" + github_id[:4],
                    "first_name": name.split()[0] if name else "",
                    "last_name": " ".join(name.split()[1:]) if name and len(name.split()) > 1 else "",
                }
            )

            if created:
                user.set_unusable_password()
                user.save()
                UserProfile.objects.get_or_create(user=user, defaults={"accepted_legal_policies": True, "is_verified": True})
            else:
                # Mark as verified if logging in via social
                profile, _ = UserProfile.objects.get_or_create(user=user)
                if not profile.is_verified:
                    profile.is_verified = True
                    profile.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data,
            })

        except requests.RequestException as e:
            return Response({"error": f"Failed to communicate with GitHub: {str(e)}"}, status=500)


# Password Reset Request
@extend_schema(tags=["auth"], request=PasswordResetRequestSerializer)
class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "If the email exists, a reset link will be sent."}, status=200)
        # Generate a reset token (for demo, use random string)
        token = get_random_string(32)
        user.profile.reset_token = token
        user.profile.save()
        reset_url = f"{settings.FRONTEND_URL}/auth/password/reset/confirm/?token={token}&email={email}"
        send_mail(
            "Password Reset Request",
            f"Reset your password: {reset_url}",
            settings.DEFAULT_FROM_EMAIL,
            [email],
        )
        return Response({"detail": "If the email exists, a reset link will be sent."}, status=200)


# Password Reset Confirm
@extend_schema(tags=["auth"], request=CustomPasswordResetConfirmSerializer)
class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = CustomPasswordResetConfirmSerializer

    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("new_password")
        if not (token and new_password):
            return Response({"error": "Missing required fields."}, status=400)
        from users.models import UserProfile
        try:
            profile = UserProfile.objects.get(reset_token=token)
            user = profile.user
            user.set_password(new_password)
            profile.reset_token = ""
            profile.save()
            user.save()
            return Response({"detail": "Password reset successful."})
        except UserProfile.DoesNotExist:
            # Do not reveal whether the token is valid
            return Response({"error": "Invalid token."}, status=400)


# Email Verification
@extend_schema(tags=["auth"], request=EmailVerificationSerializer)
class EmailVerificationView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = EmailVerificationSerializer

    def post(self, request):
        email = request.data.get("email")
        key = request.data.get("key")
        if not (email and key):
            return Response({"error": "Missing required fields."}, status=400)
        try:
            user = User.objects.get(email=email)
            if user.profile.email_verification_key != key:
                return Response({"error": "Invalid verification key."}, status=400)
            user.profile.is_verified = True
            user.profile.email_verification_key = ""
            user.profile.save()
            return Response({"detail": "Email verified successfully."})
        except User.DoesNotExist:
            return Response({"error": "Invalid email or key."}, status=400)


# Resend Verification Email
@extend_schema(tags=["auth"], request=ResendVerificationSerializer)
class ResendVerificationEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResendVerificationSerializer

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=400)
        try:
            user = User.objects.get(email=email)
            if user.profile.is_verified:
                return Response({"detail": "Email already verified."}, status=200)
            key = get_random_string(32)
            user.profile.email_verification_key = key
            user.profile.save()
            verify_url = f"{settings.FRONTEND_URL}/auth/verify-email/?key={key}&email={email}"
            send_mail(
                "Verify your email",
                f"Verify your email: {verify_url}",
                settings.DEFAULT_FROM_EMAIL,
                [email],
            )
            return Response({"detail": "Verification email sent."}, status=200)
        except User.DoesNotExist:
            return Response({"detail": "If the email exists, a verification link will be sent."}, status=200)


# Verification Status
@extend_schema(
    tags=["auth"],
    parameters=[OpenApiParameter(name="email", type=str, required=True)],
    responses={200: {"type": "object", "properties": {"is_verified": {"type": "boolean"}}}}
)
class EmailVerificationStatusView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = None  # GET request with query param

    def get(self, request):
        email = request.query_params.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=400)
        try:
            user = User.objects.get(email=email)
            return Response({"is_verified": getattr(user.profile, "is_verified", False)})
        except User.DoesNotExist:
            return Response({"is_verified": False})
