import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_account_update_and_password_change():
    user = User.objects.create_user(
        username="testuser", password="oldpass", email="old@example.com"
    )
    client = APIClient()
    client.force_authenticate(user=user)

    # Update account
    response = client.put(
        "/api/account/update/",
        {"username": "newuser", "email": "new@example.com"},
        format="json",
    )
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.username == "newuser"
    assert user.email == "new@example.com"

    # Change password
    response = client.post(
        "/api/account/password/",
        {"old_password": "oldpass", "new_password": "newpass"},
        format="json",
    )
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.check_password("newpass")


@pytest.mark.django_db
def test_account_deactivate():
    user = User.objects.create_user(
        username="testuser2", password="pass", email="user2@example.com"
    )
    client = APIClient()
    client.force_authenticate(user=user)

    # Deactivate account
    response = client.delete("/api/account/delete/")
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.is_active is False

    # Try to use POST (should not allow)
    response = client.post("/api/account/delete/")
    assert response.status_code == 405
