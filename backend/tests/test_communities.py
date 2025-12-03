import pytest
from communities.models import Community, CommunityMember
from django.contrib.auth.models import User
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def user():
    return User.objects.create_user(username="testuser", password="testpass")


@pytest.fixture
def client(user):
    client = APIClient()
    # Obtain JWT token using the correct endpoint
    response = client.post(
        "/api/auth/jwt/create/",
        {"username": "testuser", "password": "testpass"},
    )
    assert response.status_code == 200
    token = response.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


def test_create_community(client, user):
    url = "/api/communities/"
    data = {"name": "Test Community", "description": "A test community."}
    response = client.post(url, data)
    print(response.data)  # Add this line
    assert response.status_code == 201
    assert response.data["name"] == "Test Community"


def test_join_community(client, user):
    community = Community.objects.create(
        name="Joinable", description="Joinable community", owner=user
    )
    url = f"/api/communities/{community.id}/join/"
    response = client.post(url)
    assert response.status_code == 200
    assert CommunityMember.objects.filter(
        user=user, community=community
    ).exists()


def test_community_posts(authenticated_client, user):
    community = Community.objects.create(
        name="Postable", description="Postable community", owner=user
    )
    url = f"/api/communities/{community.id}/posts/"
    # Create post
    response = authenticated_client.post(url, {"content": "Hello Community!"})
    assert response.status_code == 201
    assert response.data["content"] == "Hello Community!"
    # List posts
    response = authenticated_client.get(url)
    assert response.status_code == 200
    data = response.data
    # Handle paginated or non-paginated response
    if isinstance(data, dict) and "results" in data:
        posts = data["results"]
    else:
        posts = data
    assert any(p["content"] == "Hello Community!" for p in posts)
