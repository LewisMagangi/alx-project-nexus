import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from users.models import UserProfile


@pytest.mark.django_db
def test_registration_requires_legal_policy():
    client = APIClient()
    # Should fail if not accepted
    response = client.post(
        "/api/auth/register/",
        {
            "username": "testuser1",
            "password": "testpass123",
            "email": "test1@example.com",
            "accepted_legal_policies": False,
        },
    )
    assert response.status_code in [
        400,
        401,
    ], f"Expected 400 or 401, got {response.status_code}: {response.data}"
    if response.status_code == 400:
        assert "legal policies" in response.data["error"].lower()

    # Should succeed if accepted
    response = client.post(
        "/api/auth/register/",
        {
            "username": "testuser2",
            "password": "testpass123",
            "email": "test2@example.com",
            "accepted_legal_policies": True,
        },
    )
    assert response.status_code == 201
    user = User.objects.get(username="testuser2")
    profile = UserProfile.objects.get(user=user)
    assert profile.accepted_legal_policies is True
