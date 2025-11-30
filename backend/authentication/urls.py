from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import LoginView, RegisterView
from .views_auth_home import auth_home

urlpatterns = [
    path("", auth_home, name="auth-home"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path(
        "jwt/create/", TokenObtainPairView.as_view(), name="token_obtain_pair"
    ),
    path("jwt/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
