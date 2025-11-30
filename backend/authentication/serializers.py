from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
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


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        data["user"] = user
        return data


class AuthResponseSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    access = serializers.CharField()
    user = serializers.DictField()
