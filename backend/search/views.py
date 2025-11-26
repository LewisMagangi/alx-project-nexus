from django.contrib.auth.models import User
from posts.models import Post
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get("q", "")

        users = User.objects.filter(username__icontains=query).values(
            "id", "username"
        )
        posts = Post.objects.filter(content__icontains=query).values(
            "id", "content", "user_id"
        )

        return Response(
            {
                "users": list(users),
                "posts": list(posts),
            }
        )
