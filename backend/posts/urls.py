from rest_framework import routers

from .models import FollowViewSet, LikeViewSet, PostViewSet

router = routers.DefaultRouter()
router.register(r"posts", PostViewSet)
router.register(r"likes", LikeViewSet)
router.register(r"follows", FollowViewSet)

urlpatterns = router.urls
