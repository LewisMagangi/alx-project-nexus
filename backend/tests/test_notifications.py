import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from notifications.models import Notification
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def user():
    return User.objects.create_user(username="testuser", password="testpass")


@pytest.fixture
def client(user):
    client = APIClient()
    # Obtain JWT token for the user
    response = client.post(
        "/api/auth/jwt/create/",
        {"username": "testuser", "password": "testpass"},
    )
    assert (
        response.status_code == 200
    ), f"JWT obtain failed: {response.content}"
    token = response.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


@pytest.fixture
def notification(user):
    return Notification.objects.create(user=user, verb="liked your post")


def test_list_notifications_authenticated(client, user, notification):
    url = reverse("notification-list")
    response = client.get(url)
    assert response.status_code == 200
    assert any(n["verb"] == "liked your post" for n in response.data)


def test_list_notifications_unauthenticated():
    client = APIClient()
    url = reverse("notification-list")
    response = client.get(url)
    assert response.status_code == 401


def test_mark_notification_as_read(client, user, notification):
    url = reverse("notification-mark-read", kwargs={"pk": notification.pk})
    response = client.post(url)
    assert response.status_code == 200
    notification.refresh_from_db()
    assert notification.is_read is True


def test_mark_notification_as_read_unauthenticated(notification):
    client = APIClient()
    url = reverse("notification-mark-read", kwargs={"pk": notification.pk})
    response = client.post(url)
    assert response.status_code == 401
