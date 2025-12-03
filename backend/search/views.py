from django.contrib.auth.models import User
from posts.models import Post
from rest_framework import generics, permissions
from rest_framework.response import Response

from .serializers import SearchResultSerializer


class SearchView(generics.ListAPIView):
    serializer_class = SearchResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Not used, but required by ListAPIView
        return []

    def list(self, request, *args, **kwargs):
        query = request.GET.get("q", "")
        users = User.objects.filter(username__icontains=query).values("id", "username")
        posts = Post.objects.filter(content__icontains=query).values(
            "id", "content", "user_id"
        )
        data = {"users": list(users), "posts": list(posts)}
        serializer = self.get_serializer(data)
        return Response(serializer.data)
