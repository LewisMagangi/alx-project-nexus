import hashlib
import hmac
import os
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.utils import timezone
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from users.serializers import UserSerializer

from .serializers import (
    AuthResponseSerializer,
    CustomLoginSerializer,
    CustomPasswordResetConfirmSerializer,
    CustomRegisterSerializer,
    EmailVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetVerificationSerializer,
    ResendVerificationSerializer,
    SocialAuthCodeSerializer,
)


def get_client_ip(request):
    """Get the client IP address from the request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def hash_token(token: str) -> str:
    """
    Hash a token using SHA-256 for secure storage.
    Tokens should never be stored in plaintext to prevent
    account takeover if the database is compromised.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def verify_token(provided_token: str, stored_hash: str) -> bool:
    """
    Securely compare a provided token against a stored hash.
    Uses constant-time comparison to prevent timing attacks.
    """
    if not provided_token or not stored_hash:
        return False
    provided_hash = hash_token(provided_token)
    return hmac.compare_digest(provided_hash, stored_hash)


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


@extend_schema(
    tags=["auth"],
    request=None,
    responses={
        200: {"type": "object", "properties": {"detail": {"type": "string"}}}
    },
)
class LogoutView(generics.GenericAPIView):
    """
    Logout endpoint that blacklists the refresh token.
    For JWT auth, this invalidates the refresh token so it can't be used
    to get new access tokens.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(
                {"detail": "Successfully logged out."},
                status=status.HTTP_200_OK,
            )
        except Exception:
            # Even if token is invalid or missing, we return success
            # The client will clear their local storage anyway
            return Response(
                {"detail": "Successfully logged out."},
                status=status.HTTP_200_OK,
            )


# Social OAuth login initiation views
@extend_schema(
    tags=["auth"],
    responses={
        200: {"type": "object", "properties": {"auth_url": {"type": "string"}}}
    },
)
class GoogleLoginInitView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = None  # No request body needed for GET

    def get(self, request):
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        # Get client_id from SOCIALACCOUNT_PROVIDERS or environment
        client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        redirect_uri = os.getenv(
            "GOOGLE_REDIRECT_URI",
            (
                f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}"
                "/auth/callback/google"
            ),
        )
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


@extend_schema(
    tags=["auth"],
    responses={
        200: {"type": "object", "properties": {"auth_url": {"type": "string"}}}
    },
)
class GitHubLoginInitView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = None  # No request body needed for GET

    def get(self, request):
        base_url = "https://github.com/login/oauth/authorize"
        client_id = os.getenv("GITHUB_CLIENT_ID", "")
        redirect_uri = os.getenv(
            "GITHUB_REDIRECT_URI",
            (
                f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}"
                "/auth/callback/github"
            ),
        )
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": "user user:email",
        }
        url = f"{base_url}?{urlencode(params)}"
        return Response({"auth_url": url})


# Social OAuth callback - exchange code for JWT
@extend_schema(
    tags=["auth"],
    request=SocialAuthCodeSerializer,
    responses={200: AuthResponseSerializer},
)
class GoogleCallbackView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = SocialAuthCodeSerializer

    def post(self, request):
        code = request.data.get("code")
        if not code:
            return Response(
                {"error": "Authorization code is required."}, status=400
            )

        # Exchange code for access token
        token_url = "https://oauth2.googleapis.com/token"
        client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
        redirect_uri = os.getenv(
            "GOOGLE_REDIRECT_URI",
            (
                f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}"
                "/auth/callback/google"
            ),
        )

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
                return Response(
                    {
                        "error": token_json.get(
                            "error_description", "Token exchange failed."
                        )
                    },
                    status=400,
                )

            access_token = token_json.get("access_token")

            # Get user info from Google
            userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            userinfo_response = requests.get(
                userinfo_url,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            userinfo = userinfo_response.json()

            email = userinfo.get("email")
            name = userinfo.get("name", "")
            google_id = userinfo.get("id")

            if not email:
                return Response(
                    {"error": "Could not retrieve email from Google."},
                    status=400,
                )

            # Get or create user
            from django.contrib.auth.models import User
            from users.models import UserProfile

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email.split("@")[0] + "_" + google_id[:6],
                    "first_name": name.split()[0] if name else "",
                    "last_name": (
                        " ".join(name.split()[1:])
                        if name and len(name.split()) > 1
                        else ""
                    ),
                },
            )

            if created:
                user.set_unusable_password()
                user.save()
                UserProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        "accepted_legal_policies": True,
                        "is_verified": True,
                    },
                )
            else:
                # Mark as verified if logging in via social
                profile, _ = UserProfile.objects.get_or_create(user=user)
                if not profile.is_verified:
                    profile.is_verified = True
                    profile.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": UserSerializer(user).data,
                }
            )

        except requests.RequestException as e:
            return Response(
                {"error": f"Failed to communicate with Google: {str(e)}"},
                status=500,
            )


@extend_schema(
    tags=["auth"],
    request=SocialAuthCodeSerializer,
    responses={200: AuthResponseSerializer},
)
class GitHubCallbackView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = SocialAuthCodeSerializer

    def post(self, request):
        code = request.data.get("code")
        if not code:
            return Response(
                {"error": "Authorization code is required."}, status=400
            )

        # Exchange code for access token
        token_url = "https://github.com/login/oauth/access_token"
        client_id = os.getenv("GITHUB_CLIENT_ID", "")
        client_secret = os.getenv("GITHUB_CLIENT_SECRET", "")
        redirect_uri = os.getenv(
            "GITHUB_REDIRECT_URI",
            (
                f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}"
                "/auth/callback/github"
            ),
        )

        token_data = {
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
        }

        try:
            token_response = requests.post(
                token_url,
                data=token_data,
                headers={"Accept": "application/json"},
            )
            token_json = token_response.json()

            if "error" in token_json:
                return Response(
                    {
                        "error": token_json.get(
                            "error_description", "Token exchange failed."
                        )
                    },
                    status=400,
                )

            access_token = token_json.get("access_token")

            # Get user info from GitHub
            userinfo_url = "https://api.github.com/user"
            userinfo_response = requests.get(
                userinfo_url,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            userinfo = userinfo_response.json()

            # Get email (might be private, need to fetch from /user/emails)
            email = userinfo.get("email")
            if not email:
                emails_response = requests.get(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                emails = emails_response.json()
                primary_email = next(
                    (e for e in emails if e.get("primary")), None
                )
                email = primary_email.get("email") if primary_email else None

            if not email:
                return Response(
                    {"error": "Could not retrieve email from GitHub."},
                    status=400,
                )

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
                    "last_name": (
                        " ".join(name.split()[1:])
                        if name and len(name.split()) > 1
                        else ""
                    ),
                },
            )

            if created:
                user.set_unusable_password()
                user.save()
                UserProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        "accepted_legal_policies": True,
                        "is_verified": True,
                    },
                )
            else:
                # Mark as verified if logging in via social
                profile, _ = UserProfile.objects.get_or_create(user=user)
                if not profile.is_verified:
                    profile.is_verified = True
                    profile.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": UserSerializer(user).data,
                }
            )

        except requests.RequestException as e:
            return Response(
                {"error": f"Failed to communicate with GitHub: {str(e)}"},
                status=500,
            )


# Password Reset Request
@extend_schema(tags=["auth"], request=PasswordResetRequestSerializer)
class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        from datetime import timedelta
        from django.utils import timezone
        from users.models import EmailVerificationLog

        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {
                    "detail": "If email exists, a verification link will be "
                    "sent.",
                },
                status=200,
            )
        # Generate a secure reset token
        token = get_random_string(32)
        # Store hashed token with expiry timestamp
        user.profile.reset_token = hash_token(token)
        user.profile.reset_token_expires = timezone.now() + timedelta(hours=1)
        user.profile.save()

        # Log verification email sent
        EmailVerificationLog.objects.create(
            user=user,
            email=email,
            status='sent',
            # ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        # Build verification URL (two-step process)
        from urllib.parse import quote
        verification_url = (
            f"{settings.FRONTEND_URL}/auth/password/verify?"
            f"token={token}&email={quote(email)}"
        )

        html_message = render_to_string('password_reset_email.html', {
            'verification_url': verification_url,
            'user': user,
        })
        plain_message = strip_tags(html_message).replace('&amp;', '&')
        send_mail(
            subject='Password Reset Request - Nexus',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        return Response(
            {
                "detail": (
                    "If the email exists, a verification link will be sent."
                )
            },
            status=200,
        )


# Password Reset Confirm
@extend_schema(tags=["auth"], request=CustomPasswordResetConfirmSerializer)
class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = CustomPasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data.get("token")
        new_password = serializer.validated_data.get("new_password")
        email = serializer.validated_data.get("email")

        try:
            user = User.objects.get(email=email)
            profile = user.profile
            # Check expiry
            if (
                profile.reset_token_expires
                and timezone.now() > profile.reset_token_expires
            ):
                return Response(
                    {
                        "error": (
                            "Reset link has expired. Please request a new one."
                        )
                    },
                    status=400,
                )
            # Verify token
            if not verify_token(token, profile.reset_token):
                return Response(
                    {"error": "Invalid or expired reset link."},
                    status=400,
                )
            # Update password
            user.set_password(new_password)
            # Clear reset token and expiry
            profile.reset_token = ""
            profile.reset_token_expires = None
            profile.save()
            user.save()
            return Response({"detail": "Password reset successful."})
        except User.DoesNotExist:
            return Response({"error": "Invalid reset link."}, status=400)


# Password Reset Email Verification
@extend_schema(tags=["auth"], request=PasswordResetVerificationSerializer)
class PasswordResetVerifyEmailView(generics.GenericAPIView):
    """
    Verify email for password reset before allowing password change.
    This prevents unauthorized password resets.
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetVerificationSerializer

    def post(self, request):
        from django.utils import timezone
        from users.models import EmailVerificationLog
        import threading

        email = request.data.get("email")
        token = request.data.get("token")
        if not (email and token):
            return Response(
                {"error": "Email and token are required."},
                status=400
            )
        try:
            user = User.objects.get(email=email)
            profile = user.profile

            # Verify token hasn't expired
            if (
                profile.reset_token_expires
                and timezone.now() > profile.reset_token_expires
            ):
                # Log expired attempt asynchronously
                threading.Thread(
                    target=lambda: EmailVerificationLog.objects.create(
                        user=user,
                        email=email,
                        status='expired',
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    ),
                    daemon=True
                ).start()
                return Response(
                    {"error": "Reset link has expired. "
                              "Please request a new one."},
                    status=400
                )

            # Verify token matches
            if not verify_token(token, profile.reset_token):
                # Log failed attempt asynchronously
                threading.Thread(
                    target=lambda: EmailVerificationLog.objects.create(
                        user=user,
                        email=email,
                        status='failed',
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    ),
                    daemon=True
                ).start()
                return Response(
                    {"error": "Invalid or expired reset link."},
                    status=400
                )

            # Verification successful - handle everything asynchronously
            def handle_successful_verification():
                # Send password reset email
                reset_url = (
                    f"{settings.FRONTEND_URL}/auth/password/reset/confirm?"
                    f"token={token}&email={email}"
                )

                html_message = render_to_string('password_reset_email.html', {
                    'verification_url': reset_url,
                    'user': user,
                })
                plain_message = strip_tags(html_message).replace('&amp;', '&')
                send_mail(
                    subject='Password Reset - Nexus',
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    html_message=html_message,
                    fail_silently=True,  # Don't crash if email fails
                )
                # Log successful verification
                EmailVerificationLog.objects.create(
                    user=user,
                    email=email,
                    status='verified',
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    verified_at=timezone.now()
                )

            # Start background thread for email and logging
            success_thread = threading.Thread(
                target=handle_successful_verification,
                daemon=True
            )
            success_thread.start()

            # Return response immediately
            return Response({
                "detail": "Email verified. Password reset link sent.",
                "next_action": "check_email_for_reset_link"
            })

        except User.DoesNotExist:
            return Response({"error": "Invalid reset link."}, status=400)


# Email Verification
@extend_schema(tags=["auth"], request=EmailVerificationSerializer)
class EmailVerificationView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = EmailVerificationSerializer

    def post(self, request):
        from django.utils import timezone
        from users.models import EmailVerificationLog

        email = request.data.get("email")
        key = request.data.get("key")
        if not (email and key):
            return Response({"error": "Missing required fields."}, status=400)

        try:
            user = User.objects.get(email=email)
            profile = user.profile

            # Verify using secure hash comparison
            if not verify_token(key, profile.email_verification_key):
                # Log failed verification attempt
                EmailVerificationLog.objects.create(
                    user=user,
                    email=email,
                    status='failed',
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
                return Response(
                    {"error": "Invalid verification key."}, status=400
                )

            # Check if verification key has expired
            if (profile.email_verification_key_expires and
                    timezone.now() > profile.email_verification_key_expires):
                # Log expired verification attempt
                EmailVerificationLog.objects.create(
                    user=user,
                    email=email,
                    status='expired',
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
                return Response(
                    {"error": "Verification link has expired."}, status=400
                )

            # Verification successful - determine next action based on context
            profile.is_verified = True
            profile.email_verified_at = timezone.now()
            profile.email_verification_key = ""
            profile.email_verification_key_expires = None
            profile.email_verification_attempts = 0  # Reset on success
            profile.last_verification_attempt_at = None

            # Log successful verification
            EmailVerificationLog.objects.create(
                user=user,
                email=email,
                status='verified',
                # ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                verified_at=timezone.now()
            )

            # Determine verification purpose and take appropriate action
            if (profile.reset_token and profile.reset_token_expires and
                    timezone.now() <= profile.reset_token_expires):
                # Password reset verification - send actual reset email
                reset_url = (
                    f"{settings.FRONTEND_URL}/auth/password/reset?"
                    f"token={profile.reset_token}&email={email}"
                )

                html_message = render_to_string('password_reset_email.html', {
                    'reset_url': reset_url,
                    'user': user,
                })
                plain_message = strip_tags(html_message)
                send_mail(
                    subject='Password Reset - Nexus',
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    html_message=html_message,
                    fail_silently=False,
                )

                profile.save()
                return Response({
                    "detail": "Email verified. Password reset link sent.",
                    "next_action": "password_reset_email_sent"
                })

            else:
                # Account verification - just mark as verified
                profile.save()
                return Response({
                    "detail": "Email verified. Your account is now active.",
                    "next_action": "account_activated"
                })

        except User.DoesNotExist:
            return Response({"error": "Invalid email or key."}, status=400)


# Resend Verification Email
@extend_schema(tags=["auth"], request=ResendVerificationSerializer)
class ResendVerificationEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResendVerificationSerializer

    def post(self, request):
        from users.models import EmailVerificationLog
        from django.utils import timezone

        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=400)
        try:
            user = User.objects.get(email=email)
            profile = user.profile

            if profile.is_verified:
                return Response(
                    {"detail": "Email already verified."}, status=200
                )

            # Rate limiting: Check attempts in last hour
            one_hour_ago = timezone.now() - timezone.timedelta(hours=1)
            recent_attempts = profile.email_verification_attempts
            if (profile.last_verification_attempt_at and
                    profile.last_verification_attempt_at > one_hour_ago):
                recent_attempts += 1

            if recent_attempts >= 3:  # Max 3 attempts per hour
                return Response(
                    {"error": "Too many verification attempts. "
                     "Try again later."},
                    status=429
                )

            # Update attempt tracking
            profile.email_verification_attempts = recent_attempts + 1
            profile.last_verification_attempt_at = timezone.now()

            # Generate verification key
            key = get_random_string(32)
            # Store the hashed key, not the plaintext
            profile.email_verification_key = hash_token(key)
            profile.email_verification_key_expires = (
                timezone.now() + timezone.timedelta(hours=24)
            )
            profile.save()

            # Log verification email sent
            EmailVerificationLog.objects.create(
                user=user,
                email=email,
                status='sent',
                # ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

            # Send the plaintext key to the user via email
            verify_url = (
                f"{settings.FRONTEND_URL}/auth/verify-email/{key}/"
                f"?email={email}"
            )
            send_mail(
                "Verify your email",
                f"Verify your email: {verify_url}",
                settings.DEFAULT_FROM_EMAIL,
                [email],
            )
            return Response({"detail": "Verification email sent."}, status=200)
        except User.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "If the email exists, a verification link will be "
                        "sent."
                    )
                },
                status=200,
            )


# Verification Status
@extend_schema(
    tags=["auth"],
    parameters=[OpenApiParameter(name="email", type=str, required=True)],
    responses={
        200: {
            "type": "object",
            "properties": {"is_verified": {"type": "boolean"}},
        }
    },
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
            return Response(
                {"is_verified": getattr(user.profile, "is_verified", False)}
            )
        except User.DoesNotExist:
            return Response({"is_verified": False})
