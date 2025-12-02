from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    LoginView,
    RegisterView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    EmailVerificationView,
    ResendVerificationEmailView,
    EmailVerificationStatusView,
    GoogleLoginInitView,
    GitHubLoginInitView,
    GoogleCallbackView,
    GitHubCallbackView,
)
from .views_auth_home import auth_home

urlpatterns = [
    # Homepage
    path("", auth_home, name="auth-home"),
    # Original endpoints
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("jwt/create/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("jwt/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Password reset
    path("password/reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    # Email verification
    path("verify-email/", EmailVerificationView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationEmailView.as_view(), name="resend-verification"),
    path("verification-status/", EmailVerificationStatusView.as_view(), name="verification-status"),
    # Social OAuth login endpoints
    path("social/google/login/", GoogleLoginInitView.as_view(), name="social-google-login"),
    path("social/github/login/", GitHubLoginInitView.as_view(), name="social-github-login"),
    # Social OAuth callback endpoints (for frontend-driven flow)
    path("social/google/callback/", GoogleCallbackView.as_view(), name="social-google-callback"),
    path("social/github/callback/", GitHubCallbackView.as_view(), name="social-github-callback"),
    # Social authentication (dj-rest-auth)
    path("social/", include("dj_rest_auth.urls")),
    path("social/registration/", include("dj_rest_auth.registration.urls")),
    # Allauth (for social login callbacks)
    path("accounts/", include("allauth.urls")),
]
