from drf_spectacular.utils import extend_schema_field
from posts.models import Post
from rest_framework import serializers

from .models import Bookmark


class BookmarkSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and listing bookmarks.
    Uses PostSerializer for read operations and post_id for write operations.
    """

    post = serializers.SerializerMethodField(read_only=True)
    post_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Bookmark
        fields = ["id", "post", "post_id", "created_at"]
        read_only_fields = ["id", "created_at"]

    # -----------------------------------
    # Post serializer
    # -----------------------------------

    @extend_schema_field("posts.PostSerializer")
    def get_post(self, obj):
        """Return nested PostSerializer response."""
        from posts.serializers import (  # lazy import to avoid circular import
            PostSerializer,
        )

        return PostSerializer(obj.post, context=self.context).data

    # -----------------------------------
    # Validation
    # -----------------------------------

    def validate_post_id(self, value):
        """Check if referenced post exists."""
        if not Post.objects.filter(id=value).exists():
            raise serializers.ValidationError("Post not found.")
        return value

    def validate(self, data):
        """Prevent duplicate bookmarks."""
        user = self.context["request"].user
        post_id = data.get("post_id")

        if Bookmark.objects.filter(user=user, post_id=post_id).exists():
            raise serializers.ValidationError(
                {"detail": "You have already bookmarked this post."}
            )

        return data

    # -----------------------------------
    # Create override
    # -----------------------------------

    def create(self, validated_data):
        """Attach authenticated user automatically."""
        user = self.context["request"].user
        post_id = validated_data.pop("post_id")

        validated_data["user"] = user
        validated_data["post"] = Post.objects.get(id=post_id)

        return super().create(validated_data)
