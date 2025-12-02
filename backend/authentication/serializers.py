from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers


class CustomRegisterSerializer(serializers.ModelSerializer):
    accepted_legal_policies = serializers.BooleanField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "accepted_legal_policies"]
        extra_kwargs = {
            "password": {"write_only": True},
            "accepted_legal_policies": {"write_only": True},
        }

    def create(self, validated_data):
        accepted_legal_policies = validated_data.pop(
            "accepted_legal_policies", False
        )
        if not accepted_legal_policies:
            raise serializers.ValidationError(
                {"error": "You must accept the legal policies to register."}
            )
        user = User.objects.create_user(**validated_data)
        return user


class CustomLoginSerializer(serializers.Serializer):
    """Custom login serializer supporting username or email authentication."""
    username = serializers.CharField(help_text="Username or email address")
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username_or_email = data.get("username")
        password = data.get("password")

        # Try to authenticate with username first
        user = authenticate(username=username_or_email, password=password)

        # If that fails, try to find user by email and authenticate
        if not user:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        data["user"] = user
        return data


class AuthResponseSerializer(serializers.Serializer):
    """Serializer for authentication response with JWT tokens."""
    refresh = serializers.CharField()
    access = serializers.CharField()
    user = serializers.DictField()


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    email = serializers.EmailField()


class CustomPasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    email = serializers.EmailField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification."""
    email = serializers.EmailField()
    key = serializers.CharField()


class ResendVerificationSerializer(serializers.Serializer):
    """Serializer for resending verification email."""
    email = serializers.EmailField()


class SocialAuthCodeSerializer(serializers.Serializer):
    """Serializer for social auth callback code."""
    code = serializers.CharField()
