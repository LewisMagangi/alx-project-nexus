from django.urls import path

from .views import LegalView

urlpatterns = [
    path("<str:page>/", LegalView.as_view(), name="legal-page"),
]
