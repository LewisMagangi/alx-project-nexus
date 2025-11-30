from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from .models import Follow, Like, Post


class PostSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "username",
            "content",
            "parent_post",
            "replies_count",
            "created_at",
            "is_deleted",
        ]
        read_only_fields = [
            "user",
            "username",
            "replies_count",
            "created_at",
            "is_deleted",
        ]

    @extend_schema_field(serializers.IntegerField())
    def get_replies_count(self, obj):
        return obj.replies.filter(is_deleted=False).count()

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user
        return super().create(validated_data)


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["id", "user", "post", "created_at"]
        read_only_fields = ["user"]

    def validate(self, data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        post = data.get("post")
        if (
            user
            and post
            and Like.objects.filter(user=user, post=post).exists()
        ):
            raise serializers.ValidationError(
                {"non_field_errors": ["You have already liked this post."]}
            )
        return data


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ["id", "follower", "following", "created_at"]
