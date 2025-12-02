# Serializers for account views
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]
        read_only_fields = ["id"]


class CustomPasswordChangeSerializer(serializers.Serializer):
    """Custom serializer for password change to avoid name clash with dj-rest-auth."""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)


class EmptySerializer(serializers.Serializer):
    pass
