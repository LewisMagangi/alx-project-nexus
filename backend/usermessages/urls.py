from django.urls import path

from .views import MessageListSendView
from .views_messages_home import messages_home

urlpatterns = [
    path("", messages_home, name="messages-home"),
    path(
        "<int:user_id>/",
        MessageListSendView.as_view(),
        name="message-list-send",
    ),
]
