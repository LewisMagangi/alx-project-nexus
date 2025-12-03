from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Community, CommunityMember, CommunityPost
from .serializers import (
    CommunityPostSerializer,
    CommunitySerializer,
    EmptySerializer,
)


class CommunityListCreateView(generics.ListCreateAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CommunityJoinView(generics.GenericAPIView):
    serializer_class = EmptySerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, community_id):
        CommunityMember.objects.get_or_create(
            user=request.user, community_id=community_id
        )
        return Response({"message": "Joined"}, status=status.HTTP_200_OK)


class CommunityPostsView(generics.ListCreateAPIView):
    serializer_class = CommunityPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CommunityPost.objects.filter(community_id=self.kwargs["community_id"])

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user, community_id=self.kwargs["community_id"]
        )
