from rest_framework import generics, permissions

from .models import PostReport
from .serializers import PostReportSerializer


class PostReportCreateView(generics.CreateAPIView):
    serializer_class = PostReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
