from django.urls import path

from .views import (
    CommunityJoinView,
    CommunityListCreateView,
    CommunityPostsView,
)

urlpatterns = [
    path("", CommunityListCreateView.as_view(), name="community-list-create"),
    path(
        "<int:community_id>/join/",
        CommunityJoinView.as_view(),
        name="community-join",
    ),
    path(
        "<int:community_id>/posts/",
        CommunityPostsView.as_view(),
        name="community-posts",
    ),
]
