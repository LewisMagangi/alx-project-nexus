# Serializers for account views
from django.contrib.auth import get_user_model
from rest_framework import serializers
from users.models import UserProfile

User = get_user_model()


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]
        read_only_fields = ["id"]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating profile information"""
    class Meta:
        model = UserProfile
        fields = ["bio", "location", "website", "avatar_url", "header_url"]
    
    def validate_website(self, value):
        """Ensure website is a valid URL or empty"""
        if value and not value.startswith(('http://', 'https://')):
            value = 'https://' + value
        return value


class CustomPasswordChangeSerializer(serializers.Serializer):
    """Custom serializer for password change to avoid name clash with dj-rest-auth."""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)


class EmptySerializer(serializers.Serializer):
    pass
