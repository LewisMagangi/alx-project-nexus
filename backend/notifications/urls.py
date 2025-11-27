from django.urls import path

from .views import NotificationListView, NotificationMarkReadView

urlpatterns = [
    path(
        "notifications/",
        NotificationListView.as_view(),
        name="notification-list",
    ),
    path(
        "notifications/mark-read/<int:pk>/",
        NotificationMarkReadView.as_view(),
        name="notification-mark-read",
    ),
]
