from django.urls import path

from .views import MessageListSendView

urlpatterns = [
    path(
        "<int:user_id>/",
        MessageListSendView.as_view(),
        name="message-list-send",
    ),
]
