from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import FollowViewSet, LikeViewSet, PostViewSet

router = DefaultRouter()
router.register(r"posts", PostViewSet, basename="post")
router.register(r"likes", LikeViewSet, basename="like")
router.register(r"follows", FollowViewSet, basename="follow")

urlpatterns = [
    path("", include(router.urls)),
]
