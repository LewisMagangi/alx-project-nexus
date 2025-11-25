from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Bookmark
from .serializers import BookmarkSerializer


@extend_schema_view(
    list=extend_schema(
        summary="List user's bookmarks",
        description="Retrieve all posts bookmarked by the authenticated user",
        tags=["Bookmarks"],
    ),
    create=extend_schema(
        summary="Bookmark a post",
        description="Add a post to user's bookmarks",
        tags=["Bookmarks"],
    ),
    destroy=extend_schema(
        summary="Remove bookmark",
        description="Remove a post from user's bookmarks",
        tags=["Bookmarks"],
    ),
)
class BookmarkViewSet(viewsets.ModelViewSet):
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "delete"]  # No PUT/PATCH

    def get_queryset(self):
        """Return only current user's bookmarks"""
        return Bookmark.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create bookmark with current user and return the created bookmark data"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        bookmark = Bookmark.objects.create(
            user=request.user, post_id=serializer.validated_data["post_id"]
        )
        # Re-serialize to include the post field in the response
        response_serializer = self.get_serializer(bookmark)
        headers = self.get_success_headers(response_serializer.data)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )
