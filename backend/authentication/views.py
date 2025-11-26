from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from users.serializers import UserSerializer


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": UserSerializer(user).data,
                }
            )
        return Response(
            {"detail": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


class RegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")
        accepted_legal_policies = request.data.get("accepted_legal_policies")
        if not username or not password:
            return Response(
                {"error": "Username and password required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Accept True, 'true', or 'True' as valid acceptance
        if not (
            accepted_legal_policies is True
            or str(accepted_legal_policies).lower() == "true"
        ):
            return Response(
                {"error": "You must accept the legal policies to register."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = User.objects.create_user(
            username=username, password=password, email=email
        )
        # Create UserProfile with accepted_legal_policies True
        from users.models import UserProfile

        UserProfile.objects.create(user=user, accepted_legal_policies=True)
        return Response(
            {
                "user": UserSerializer(user).data,
                "message": "User registered successfully.",
            },
            status=status.HTTP_201_CREATED,
        )
