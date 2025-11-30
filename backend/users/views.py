from django.contrib.auth.models import User
from rest_framework import generics, permissions

from .serializers import PublicUserSerializer


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.IsAuthenticated]
