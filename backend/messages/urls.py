from django.urls import path

from .views_messages_home import messages_home

urlpatterns = [
    path("", messages_home, name="messages-home"),
]
