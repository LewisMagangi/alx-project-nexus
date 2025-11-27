from rest_framework import generics, permissions

from .models import Block
from .serializers import BlockSerializer


class BlockCreateView(generics.CreateAPIView):
    serializer_class = BlockSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(blocker=self.request.user)
