from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import BookmarkViewSet

urlpatterns = [
    path(
        "bookmarks/<int:id>/",
        BookmarkViewSet.as_view({"get": "retrieve", "delete": "destroy"}),
        name="bookmark-detail",
    ),
    path(
        "bookmarks/",
        BookmarkViewSet.as_view({"get": "list", "post": "create"}),
        name="bookmark-list",
    ),
]
