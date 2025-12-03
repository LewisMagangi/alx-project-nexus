from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )


class NotificationMarkReadView(generics.UpdateAPIView):

    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"

    def post(self, request, *args, **kwargs):
        return self.patch(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj.user != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        obj.is_read = True
        obj.save()
        return Response({"message": "Marked as read"}, status=status.HTTP_200_OK)
