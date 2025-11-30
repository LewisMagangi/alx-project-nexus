# Add missing import
from rest_framework import serializers


# Used for endpoints with no request body to document schema
class EmptySerializer(serializers.Serializer):
    pass


from rest_framework import serializers

from .models import Community, CommunityPost


class CommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = ["id", "name", "description", "owner", "created_at"]
        read_only_fields = ["owner", "created_at"]

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)


class CommunityPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityPost
        fields = ["id", "community", "user", "content", "created_at"]
        read_only_fields = ["community", "user", "created_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
