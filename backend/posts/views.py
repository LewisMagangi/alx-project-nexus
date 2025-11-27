from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Follow, Like, Post
from .serializers import FollowSerializer, LikeSerializer, PostSerializer


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(is_deleted=False).select_related("user")
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["content", "user__username"]

    def perform_destroy(self, instance):
        # soft delete
        instance.is_deleted = True
        instance.save()

    @action(detail=False, methods=["get"], url_path="user/(?P<user_id>[^/.]+)")
    def user_timeline(self, request, user_id=None):
        qs = Post.objects.filter(user_id=user_id, is_deleted=False).order_by(
            "-created_at"
        )
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=["get"], url_path="home")
    def home_feed(self, request):
        # optimized: fetch posts from followings
        user = request.user
        following_ids = user.following_set.values_list(
            "following_id", flat=True
        )
        qs = Post.objects.filter(
            user_id__in=following_ids, is_deleted=False
        ).order_by("-created_at")
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(follower=self.request.user)
