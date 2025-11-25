from posts.models import PostSerializer
from rest_framework import serializers

from .models import Bookmark


class BookmarkSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)
    post_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Bookmark
        fields = ["id", "post", "post_id", "created_at"]
        read_only_fields = ["user"]

    def validate_post_id(self, value):
        """Ensure post exists"""
        from posts.models import Post

        if not Post.objects.filter(id=value).exists():
            raise serializers.ValidationError("Post not found.")
        return value

    def validate(self, data):
        """Prevent duplicate bookmarks"""
        request = self.context.get("request")
        user = getattr(request, "user", None)
        post_id = data.get("post_id")

        if user and post_id:
            if Bookmark.objects.filter(user=user, post_id=post_id).exists():
                raise serializers.ValidationError(
                    {
                        "non_field_errors": [
                            "You have already bookmarked this post."
                        ]
                    }
                )
        return data
