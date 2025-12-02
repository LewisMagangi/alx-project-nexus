"""
Post views with support for retweets, quotes, threads, hashtags, mentions.
Uses drf-spectacular for OpenAPI documentation.
"""
from datetime import timedelta

from django.db.models import Count, F
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Follow, Hashtag, Like, Post
from .serializers import (
    FollowSerializer,
    HashtagSerializer,
    LikeSerializer,
    PostMiniSerializer,
    PostSerializer,
    TrendingHashtagSerializer,
)


@extend_schema_view(
    list=extend_schema(
        summary="List all posts",
        description="Get all posts with optional filtering by hashtag or mention",
        parameters=[
            OpenApiParameter(
                name="hashtag",
                description="Filter posts by hashtag (without #)",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="mention",
                description="Filter posts mentioning a specific username",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="user_id",
                description="Filter posts by user ID",
                required=False,
                type=int,
            ),
        ],
    ),
    retrieve=extend_schema(
        summary="Get a single post",
        description="Retrieve a post by its ID",
    ),
    create=extend_schema(
        summary="Create a new post",
        description="Create a regular post, reply, or quote tweet",
    ),
    update=extend_schema(
        summary="Update a post",
        description="Update the content of a post",
    ),
    partial_update=extend_schema(
        summary="Partially update a post",
        description="Partially update the content of a post",
    ),
    destroy=extend_schema(
        summary="Delete a post",
        description="Soft delete a post",
    ),
)
class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing posts with support for:
    - Regular posts
    - Replies and threads
    - Retweets and quote tweets
    - Hashtag and mention filtering
    """

    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["content", "user__username"]
    ordering_fields = ["created_at", "like_count", "retweet_count"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Get posts with optional filtering"""
        queryset = Post.objects.filter(is_deleted=False).select_related(
            "user", "retweet_of__user", "parent_post__user"
        ).prefetch_related(
            "post_hashtags__hashtag", "mentions__mentioned_user"
        )

        # Filter by hashtag
        hashtag = self.request.query_params.get("hashtag")
        if hashtag:
            hashtag_normalized = Hashtag.normalize_tag(hashtag)
            queryset = queryset.filter(
                post_hashtags__hashtag__tag=hashtag_normalized
            )

        # Filter by mention
        mention = self.request.query_params.get("mention")
        if mention:
            queryset = queryset.filter(
                mentions__mentioned_user__username=mention
            )

        # Filter by user
        user_id = self.request.query_params.get("user_id")
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        return queryset.distinct()

    def perform_destroy(self, instance):
        """Soft delete posts"""
        instance.is_deleted = True
        instance.save(update_fields=["is_deleted"])

    @extend_schema(
        summary="Retweet a post",
        description="Create a retweet of an existing post",
        responses={
            201: PostSerializer,
            400: OpenApiResponse(description="Already retweeted"),
        },
    )
    @action(detail=True, methods=["post"])
    def retweet(self, request, pk=None):
        """Retweet a post"""
        original_post = self.get_object()

        # Check if already retweeted
        existing = Post.objects.filter(
            user=request.user,
            retweet_of=original_post,
            is_deleted=False,
            is_quote_tweet=False
        ).first()

        if existing:
            return Response(
                {"detail": "Already retweeted"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create retweet
        retweet = Post.objects.create(
            user=request.user,
            content="",
            retweet_of=original_post
        )

        # Create notification (count update handled by signal)
        from notifications.models import Notification
        if original_post.user != request.user:
            Notification.objects.create(
                user=original_post.user,
                actor=request.user,
                verb="retweeted your post",
                target_type="post",
                target_id=original_post.id
            )

        serializer = self.get_serializer(retweet)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Undo retweet",
        description="Remove a retweet of a post",
        responses={
            204: OpenApiResponse(description="Retweet removed"),
            400: OpenApiResponse(description="Not retweeted"),
        },
    )
    @action(detail=True, methods=["post"])
    def unretweet(self, request, pk=None):
        """Undo retweet"""
        original_post = self.get_object()

        retweet = Post.objects.filter(
            user=request.user,
            retweet_of=original_post,
            is_deleted=False,
            is_quote_tweet=False
        ).first()

        if not retweet:
            return Response(
                {"detail": "Not retweeted"},
                status=status.HTTP_400_BAD_REQUEST
            )

        retweet.delete()  # Signal handles count update

        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Get thread",
        description="Get all posts in a thread, starting from the root",
        responses={200: PostSerializer(many=True)},
    )
    @action(detail=True, methods=["get"])
    def thread(self, request, pk=None):
        """Get all posts in a thread"""
        post = self.get_object()
        root = post.root_post or post

        # Get the root post and all replies
        thread_posts = [root]
        thread_posts.extend(
            Post.objects.filter(
                root_post=root,
                is_deleted=False
            ).select_related("user").order_by("created_at")
        )

        serializer = self.get_serializer(thread_posts, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Get replies to a post",
        description="Get direct replies to a specific post",
        responses={200: PostSerializer(many=True)},
    )
    @action(detail=True, methods=["get"])
    def replies(self, request, pk=None):
        """Get replies to a post"""
        post = self.get_object()

        replies = Post.objects.filter(
            parent_post=post,
            is_deleted=False
        ).select_related("user").order_by("created_at")

        serializer = self.get_serializer(replies, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Get trending hashtags",
        description="Get the top 20 trending hashtags from the last 7 days",
        responses={200: TrendingHashtagSerializer(many=True)},
    )
    @action(detail=False, methods=["get"])
    def trending_hashtags(self, request):
        """Get trending hashtags from the last 7 days"""
        week_ago = timezone.now() - timedelta(days=7)

        hashtags = Hashtag.objects.filter(
            last_used_at__gte=week_ago
        ).annotate(
            post_count=Count("hashtag_posts")
        ).order_by("-use_count")[:20]

        return Response([
            {
                "id": h.id,
                "tag": h.tag,
                "use_count": h.use_count,
                "post_count": h.post_count
            }
            for h in hashtags
        ])

    @extend_schema(
        summary="Get home feed",
        description="Get posts from users the current user follows",
        responses={200: PostSerializer(many=True)},
    )
    @action(detail=False, methods=["get"])
    def home(self, request):
        """Get home feed - posts from followed users"""
        following_ids = Follow.objects.filter(
            follower=request.user
        ).values_list("following_id", flat=True)

        # Include user's own posts and posts from followed users
        posts = Post.objects.filter(
            user_id__in=list(following_ids) + [request.user.id],
            is_deleted=False
        ).select_related(
            "user", "retweet_of__user"
        ).prefetch_related(
            "post_hashtags__hashtag", "mentions__mentioned_user"
        ).order_by("-created_at")[:50]

        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Get user posts",
        description="Get all posts by a specific user",
        parameters=[OpenApiParameter(name="user_id", type=OpenApiTypes.INT, location=OpenApiParameter.PATH)],
        responses={200: PostSerializer(many=True)},
    )
    @action(detail=False, methods=["get"], url_path="user/(?P<user_id>[^/.]+)")
    def user_posts(self, request, user_id=None):
        """Get posts by a specific user"""
        posts = Post.objects.filter(
            user_id=user_id,
            is_deleted=False
        ).select_related(
            "user", "retweet_of__user"
        ).prefetch_related(
            "post_hashtags__hashtag", "mentions__mentioned_user"
        ).order_by("-created_at")

        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Get posts by hashtag",
        description="Get all posts containing a specific hashtag",
        parameters=[OpenApiParameter(name="tag", type=OpenApiTypes.STR, location=OpenApiParameter.PATH)],
        responses={200: PostSerializer(many=True)},
    )
    @action(detail=False, methods=["get"], url_path="hashtag/(?P<tag>[^/.]+)")
    def by_hashtag(self, request, tag=None):
        """Get posts by hashtag"""
        tag_normalized = Hashtag.normalize_tag(tag)

        posts = Post.objects.filter(
            post_hashtags__hashtag__tag=tag_normalized,
            is_deleted=False
        ).select_related(
            "user", "retweet_of__user"
        ).prefetch_related(
            "post_hashtags__hashtag", "mentions__mentioned_user"
        ).distinct().order_by("-created_at")

        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Get posts mentioning a user",
        description="Get all posts mentioning a specific username",
        parameters=[OpenApiParameter(name="username", type=OpenApiTypes.STR, location=OpenApiParameter.PATH)],
        responses={200: PostSerializer(many=True)},
    )
    @action(
        detail=False,
        methods=["get"],
        url_path="mentions/(?P<username>[^/.]+)"
    )
    def by_mention(self, request, username=None):
        """Get posts mentioning a specific user"""
        posts = Post.objects.filter(
            mentions__mentioned_user__username=username,
            is_deleted=False
        ).select_related(
            "user", "retweet_of__user"
        ).prefetch_related(
            "post_hashtags__hashtag", "mentions__mentioned_user"
        ).distinct().order_by("-created_at")

        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(
        summary="List likes",
        description="Get all likes by the current user",
    ),
    create=extend_schema(
        summary="Like a post",
        description="Create a like on a post",
    ),
    retrieve=extend_schema(
        summary="Get a like",
        description="Get a specific like by ID",
        parameters=[OpenApiParameter(name="id", type=OpenApiTypes.INT, location=OpenApiParameter.PATH)],
    ),
    update=extend_schema(
        summary="Update a like",
        description="Update a specific like",
        parameters=[OpenApiParameter(name="id", type=OpenApiTypes.INT, location=OpenApiParameter.PATH)],
    ),
    partial_update=extend_schema(
        summary="Partial update a like",
        description="Partially update a specific like",
        parameters=[OpenApiParameter(name="id", type=OpenApiTypes.INT, location=OpenApiParameter.PATH)],
    ),
    destroy=extend_schema(
        summary="Unlike a post",
        description="Remove a like from a post",
        parameters=[OpenApiParameter(name="id", type=OpenApiTypes.INT, location=OpenApiParameter.PATH)],
    ),
)
class LikeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing likes"""

    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Like.objects.filter(user=self.request.user).select_related(
            "post", "user"
        )

    def perform_create(self, serializer):
        post = serializer.validated_data["post"]

        # Check if already liked
        if Like.objects.filter(user=self.request.user, post=post).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Already liked"})

        serializer.save(user=self.request.user)

        # Create notification (count update handled by signal)
        from notifications.models import Notification
        if post.user != self.request.user:
            Notification.objects.create(
                user=post.user,
                actor=self.request.user,
                verb="liked your post",
                target_type="post",
                target_id=post.id
            )


@extend_schema_view(
    list=extend_schema(
        summary="List follows",
        description="Get all follow relationships for the current user",
    ),
    create=extend_schema(
        summary="Follow a user",
        description="Create a follow relationship",
    ),
    retrieve=extend_schema(
        summary="Get a follow",
        description="Get a specific follow relationship by ID",
        parameters=[OpenApiParameter(name="id", type=OpenApiTypes.INT, location=OpenApiParameter.PATH)],
    ),
    update=extend_schema(
        summary="Update a follow",
        description="Update a specific follow relationship",
        parameters=[OpenApiParameter(name="id", type=OpenApiTypes.INT, location=OpenApiParameter.PATH)],
    ),
    partial_update=extend_schema(
        summary="Partial update a follow",
        description="Partially update a specific follow relationship",
        parameters=[OpenApiParameter(name="id", type=OpenApiTypes.INT, location=OpenApiParameter.PATH)],
    ),
    destroy=extend_schema(
        summary="Unfollow a user",
        description="Remove a follow relationship",
        parameters=[OpenApiParameter(name="id", type=OpenApiTypes.INT, location=OpenApiParameter.PATH)],
    ),
)
class FollowViewSet(viewsets.ModelViewSet):
    """ViewSet for managing follows"""

    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(
            follower=self.request.user
        ).select_related("follower", "following") | Follow.objects.filter(
            following=self.request.user
        ).select_related("follower", "following")

    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Follow create - request.data: {request.data}")
        logger.info(f"Follow create - request.user: {request.user}")
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Follow create attempt - validated_data: {serializer.validated_data}")
        
        following_user = serializer.validated_data["following"]
        logger.info(f"Following user: {following_user}, Current user: {self.request.user}")

        # Prevent self-follow
        if following_user == self.request.user:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Cannot follow yourself"})

        # Check if already following
        if Follow.objects.filter(
            follower=self.request.user,
            following=following_user
        ).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Already following"})

        serializer.save(follower=self.request.user)
        logger.info(f"Follow created successfully")

        # Create notification (non-critical, silently fail if error)
        try:
            from notifications.models import Notification
            Notification.objects.create(
                user=following_user,
                actor=self.request.user,
                verb="followed you",
                target_type="user",
                target_id=following_user.id
            )
        except Exception as e:
            # Log but don't fail the follow action
            logger.warning(f"Failed to create notification for follow: {e}")

    @extend_schema(
        summary="Get followers",
        description="Get all users following the current user",
    )
    @action(detail=False, methods=["get"])
    def followers(self, request):
        """Get users following the current user"""
        followers = Follow.objects.filter(
            following=request.user
        ).select_related("follower")

        serializer = self.get_serializer(followers, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Get following",
        description="Get all users the current user is following",
    )
    @action(detail=False, methods=["get"])
    def following(self, request):
        """Get users the current user is following"""
        following = Follow.objects.filter(
            follower=request.user
        ).select_related("following")

        serializer = self.get_serializer(following, many=True)
        return Response(serializer.data)
