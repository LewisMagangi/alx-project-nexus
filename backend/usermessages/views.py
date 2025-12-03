from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import Message
from .serializers import MessageSerializer


class MessageListSendView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        other_id = self.kwargs["user_id"]
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user, receiver_id=other_id)
            | Q(receiver=user, sender_id=other_id)
        ).order_by("created_at")

    def create(self, request, *args, **kwargs):
        receiver_id = self.kwargs["user_id"]
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save(
            sender=self.request.user, receiver_id=receiver_id
        )
        output_serializer = self.get_serializer(message)
        return Response(output_serializer.data, status=200)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
