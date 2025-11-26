from rest_framework import serializers

from .models import Community, CommunityPost


class CommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = [
            "id",
            "name",
            "description",
            "owner",
        ]  # include all fields you want to return
        read_only_fields = ["owner"]  # add owner here


class CommunityPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityPost
        fields = ["id", "community", "user", "content", "created_at"]
        read_only_fields = ["user", "created_at"]
