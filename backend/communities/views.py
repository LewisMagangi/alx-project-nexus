from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Community, CommunityMember, CommunityPost
from .serializers import CommunityPostSerializer, CommunitySerializer


# Create your views here.
class CommunityListCreateView(generics.ListCreateAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CommunityJoinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, community_id):
        CommunityMember.objects.get_or_create(
            user=request.user, community_id=community_id
        )
        return Response({"message": "Joined"})


class CommunityPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, community_id):
        posts = CommunityPost.objects.filter(community_id=community_id)
        return Response(CommunityPostSerializer(posts, many=True).data)

    def post(self, request, community_id):
        serializer = CommunityPostSerializer(
            data={
                "community": community_id,
                "content": request.data.get("content"),
            }
        )
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
