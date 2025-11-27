import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from posts.models import Post
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

# -----------------------------
# Fixtures
# -----------------------------


@pytest.fixture
def user(db):
    return User.objects.create_user(username="u1", password="pass")


@pytest.fixture
def auth_client(user):
    client = APIClient()
    token = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
    return client


# -----------------------------
# Tests
# -----------------------------


@pytest.mark.django_db
def test_create_post(auth_client):
    """Ensure a user can create a post."""
    url = reverse("post-list")  # DRF router name
    res = auth_client.post(url, {"content": "hello"})

    assert res.status_code == 201
    assert res.data["content"] == "hello"
    assert "id" in res.data


@pytest.mark.django_db
def test_list_posts(auth_client, user):
    """Ensure posts are listed correctly."""
    Post.objects.create(user=user, content="First post")

    url = reverse("post-list")
    res = auth_client.get(url)

    assert res.status_code == 200
    # Handle paginated or non-paginated response
    posts = res.data["results"] if "results" in res.data else res.data
    assert len(posts) >= 1
    assert any(post["content"] == "First post" for post in posts)
