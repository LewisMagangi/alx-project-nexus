from rest_framework import routers
from .models import PostViewSet, LikeViewSet, FollowViewSet

router = routers.DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'likes', LikeViewSet)
router.register(r'follows', FollowViewSet)

urlpatterns = router.urls
