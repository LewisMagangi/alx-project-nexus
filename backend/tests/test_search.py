import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from posts.models import Post
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def user():
    return User.objects.create_user(username="searchuser", password="searchpass")


@pytest.fixture
def client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def post(user):
    return Post.objects.create(user=user, content="searchable content")


def test_search_authenticated(client, user, post):
    url = reverse("search")
    response = client.get(url, {"q": "search"})
    assert response.status_code == 200
    assert any(u["username"] == "searchuser" for u in response.data["users"])
    assert any(p["content"] == "searchable content" for p in response.data["posts"])


def test_search_unauthenticated():
    client = APIClient()
    url = reverse("search")
    response = client.get(url, {"q": "search"})
    assert response.status_code == 401
