import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from usermessages.models import Message

pytestmark = pytest.mark.django_db


@pytest.fixture
def user1():
    return User.objects.create_user(username="alice", password="alicepass")


@pytest.fixture
def user2():
    return User.objects.create_user(username="bob", password="bobpass")


@pytest.fixture
def client(user1):
    client = APIClient()
    client.force_authenticate(user=user1)
    return client


def test_send_message(client, user1, user2):
    url = f"/api/messages/{user2.id}/"
    data = {"content": "Hello Bob!"}
    response = client.post(url, data)
    assert response.status_code == 200
    assert response.data["content"] == "Hello Bob!"
    assert response.data["receiver"] == user2.id
    assert response.data["sender_username"] == user1.username


def test_get_messages(client, user1, user2):
    # Create a message from user1 to user2
    Message.objects.create(sender=user1, receiver=user2, content="Hi Bob!")
    url = f"/api/messages/{user2.id}/"
    response = client.get(url)
    assert response.status_code == 200
    assert any(m["content"] == "Hi Bob!" for m in response.data)


def test_unauthenticated_cannot_send():
    user = User.objects.create_user(username="charlie", password="charliepass")
    client = APIClient()
    url = f"/api/messages/{user.id}/"
    response = client.post(url, {"content": "Hey!"})
    assert response.status_code == 401
