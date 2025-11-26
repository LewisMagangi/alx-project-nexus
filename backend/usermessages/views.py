from mailbox import Message

from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import MessageSerializer


# Create your views here.
class MessageListSendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        msgs = Message.objects.filter(
            Q(sender=request.user, receiver_id=user_id)
            | Q(receiver=request.user, sender_id=user_id)
        ).order_by("created_at")

        return Response(MessageSerializer(msgs, many=True).data)

    def post(self, request, user_id):
        serializer = MessageSerializer(
            data={"receiver": user_id, "content": request.data.get("content")}
        )
        if serializer.is_valid():
            serializer.save(sender=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
