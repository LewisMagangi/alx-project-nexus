from django.urls import path

from .views import UserDetailByUsernameView, UserListView

urlpatterns = [
    path("", UserListView.as_view(), name="user-list"),
    path(
        "<str:username>/",
        UserDetailByUsernameView.as_view(),
        name="user-detail-by-username",
    ),
]
