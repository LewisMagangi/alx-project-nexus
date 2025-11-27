from rest_framework import generics, permissions

from .models import Hashtag
from .serializers import HashtagSerializer


# Create your views here.
class HashtagListView(generics.ListAPIView):
    queryset = Hashtag.objects.all()
    serializer_class = HashtagSerializer
    permission_classes = [permissions.AllowAny]
