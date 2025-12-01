"""
Post serializers with support for retweets, quotes, threads, hashtags, mentions.
Uses drf-spectacular for OpenAPI documentation.
"""
import re

from django.contrib.auth import get_user_model
from django.db.models import F
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from .models import Follow, Hashtag, Like, Mention, Post, PostHashtag

User = get_user_model()


class HashtagSerializer(serializers.ModelSerializer):
    """Serializer for hashtag data"""

    class Meta:
        model = Hashtag
        fields = ["id", "tag", "use_count", "last_used_at"]
        read_only_fields = ["id", "use_count", "last_used_at"]


class MentionSerializer(serializers.ModelSerializer):
    """Serializer for mention data"""
    username = serializers.CharField(source="mentioned_user.username")

    class Meta:
        model = Mention
        fields = ["id", "username", "mentioned_user"]
        read_only_fields = ["id", "mentioned_user"]


class UserMiniSerializer(serializers.ModelSerializer):
    """Minimal user serializer for nested representations"""

    class Meta:
        model = User
        fields = ["id", "username"]
        read_only_fields = ["id", "username"]


class PostSerializer(serializers.ModelSerializer):
    """
    Full post serializer with support for:
    - Regular posts
    - Replies and threads
    - Retweets and quote tweets
    - Hashtags and mentions
    """
    username = serializers.ReadOnlyField(source="user.username")
    user_data = UserMiniSerializer(source="user", read_only=True)
    hashtags = serializers.SerializerMethodField()
    mentions = serializers.SerializerMethodField()
    retweet_of_data = serializers.SerializerMethodField()
    is_retweeted_by_user = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    is_bookmarked_by_user = serializers.SerializerMethodField()

    # Input fields for creating quote tweets
    quote_of = serializers.PrimaryKeyRelatedField(
        queryset=Post.objects.filter(is_deleted=False),
        write_only=True,
        required=False,
        allow_null=True,
        help_text="Post ID to quote tweet"
    )

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "username",
            "user_data",
            "content",
            "parent_post",
            "root_post",
            "retweet_of",
            "retweet_of_data",
            "is_quote_tweet",
            "is_retweet",
            "is_reply",
            "reply_count",
            "retweet_count",
            "like_count",
            "quote_count",
            "bookmark_count",
            "hashtags",
            "mentions",
            "is_retweeted_by_user",
            "is_liked_by_user",
            "is_bookmarked_by_user",
            "created_at",
            "updated_at",
            "is_deleted",
            "quote_of",
        ]
        read_only_fields = [
            "user",
            "is_retweet",
            "is_reply",
            "reply_count",
            "retweet_count",
            "like_count",
            "quote_count",
            "bookmark_count",
            "created_at",
            "updated_at",
            "is_deleted",
        ]

    @extend_schema_field(serializers.ListField(child=HashtagSerializer()))
    def get_hashtags(self, obj):
        """Get hashtags associated with this post"""
        return [
            {"id": ph.hashtag.id, "tag": ph.hashtag.tag}
            for ph in obj.post_hashtags.select_related("hashtag")
        ]

    @extend_schema_field(serializers.ListField(child=MentionSerializer()))
    def get_mentions(self, obj):
        """Get mentions in this post"""
        return [
            {"id": m.mentioned_user.id, "username": m.mentioned_user.username}
            for m in obj.mentions.select_related("mentioned_user")
        ]

    @extend_schema_field(serializers.DictField(allow_null=True))
    def get_retweet_of_data(self, obj):
        """Get the original post data for retweets/quotes"""
        if obj.retweet_of:
            return PostMiniSerializer(obj.retweet_of, context=self.context).data
        return None

    @extend_schema_field(serializers.BooleanField())
    def get_is_retweeted_by_user(self, obj):
        """Check if current user has retweeted this post"""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Post.objects.filter(
                user=request.user,
                retweet_of=obj,
                is_deleted=False,
                is_quote_tweet=False
            ).exists()
        return False

    @extend_schema_field(serializers.BooleanField())
    def get_is_liked_by_user(self, obj):
        """Check if current user has liked this post"""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False

    @extend_schema_field(serializers.BooleanField())
    def get_is_bookmarked_by_user(self, obj):
        """Check if current user has bookmarked this post"""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            from bookmarks.models import Bookmark
            return Bookmark.objects.filter(user=request.user, post=obj).exists()
        return False

    def create(self, validated_data):
        """Create a post with automatic hashtag and mention extraction"""
        user = self.context["request"].user
        content = validated_data.get("content", "")
        quote_of = validated_data.pop("quote_of", None)

        # Handle quote tweet
        if quote_of:
            validated_data["retweet_of"] = quote_of
            validated_data["is_quote_tweet"] = True

        # Create post
        post = Post.objects.create(user=user, **validated_data)

        # Extract and create hashtags
        self._process_hashtags(post, content)

        # Extract and create mentions
        self._process_mentions(post, content, user)

        return post

    def _process_hashtags(self, post, content):
        """Extract hashtags from content and create associations"""
        hashtag_matches = Hashtag.extract_from_content(content)

        for position, tag_text in enumerate(hashtag_matches):
            tag_normalized = Hashtag.normalize_tag(tag_text)
            if not tag_normalized:
                continue

            hashtag, _ = Hashtag.objects.get_or_create(tag=tag_normalized)
            PostHashtag.objects.create(
                post=post,
                hashtag=hashtag,
                position=position
            )
            # Update hashtag use_count
            Hashtag.objects.filter(pk=hashtag.pk).update(
                use_count=F("use_count") + 1
            )

    def _process_mentions(self, post, content, user):
        """Extract mentions from content and create associations"""
        mention_matches = Mention.extract_from_content(content)

        for position, username in enumerate(mention_matches):
            try:
                mentioned = User.objects.get(username=username)
                Mention.objects.create(
                    post=post,
                    mentioned_user=mentioned,
                    mentioner_user=user,
                    position=position
                )
                # Create notification for mentioned user
                from notifications.models import Notification
                Notification.objects.create(
                    user=mentioned,
                    actor=user,
                    verb="mentioned you in a post",
                    target_type="post",
                    target_id=post.id
                )
            except User.DoesNotExist:
                pass  # Invalid mention, skip


class PostMiniSerializer(serializers.ModelSerializer):
    """
    Minimal post serializer for nested representations.
    Used in retweet_of_data to avoid infinite recursion.
    """
    username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "username",
            "content",
            "created_at",
            "like_count",
            "retweet_count",
            "reply_count",
        ]
        read_only_fields = fields


class LikeSerializer(serializers.ModelSerializer):
    """Serializer for likes"""
    username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Like
        fields = ["id", "user", "username", "post", "created_at"]
        read_only_fields = ["user", "created_at"]


class FollowSerializer(serializers.ModelSerializer):
    """Serializer for follows"""
    follower_username = serializers.ReadOnlyField(source="follower.username")
    following_username = serializers.ReadOnlyField(source="following.username")

    class Meta:
        model = Follow
        fields = [
            "id",
            "follower",
            "following",
            "follower_username",
            "following_username",
            "created_at"
        ]
        read_only_fields = ["follower", "created_at"]


class TrendingHashtagSerializer(serializers.Serializer):
    """Serializer for trending hashtag response"""
    id = serializers.IntegerField()
    tag = serializers.CharField()
    use_count = serializers.IntegerField()
    post_count = serializers.IntegerField(required=False)