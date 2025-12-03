from django.urls import path

from .views import (
    AccountDeleteView,
    AccountUpdateView,
    PasswordChangeView,
    ProfileUpdateView,
)
from .views_account_home import account_home

urlpatterns = [
    path("account/", account_home, name="account-home"),
    path(
        "account/update/", AccountUpdateView.as_view(), name="account-update"
    ),
    path(
        "account/profile/", ProfileUpdateView.as_view(), name="profile-update"
    ),
    path(
        "account/password/",
        PasswordChangeView.as_view(),
        name="account-password-change",
    ),
    path(
        "account/delete/", AccountDeleteView.as_view(), name="account-delete"
    ),
]
