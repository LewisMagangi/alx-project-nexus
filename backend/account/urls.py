from django.urls import path

from .views import AccountDeleteView, AccountUpdateView, PasswordChangeView

urlpatterns = [
    path(
        "account/update/", AccountUpdateView.as_view(), name="account-update"
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
