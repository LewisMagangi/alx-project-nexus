import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from users.models import User


@pytest.mark.django_db
def test_follow_user():
    follower = User.objects.create(username="follower", password="pass")
    following = User.objects.create(username="following", password="pass")
    client = APIClient()
    url = reverse("follow-list")
    data = {"follower": follower.id, "following": following.id}
    response = client.post(url, data, format="json")
    assert response.status_code == 201
    assert response.data["follower"] == follower.id
    assert response.data["following"] == following.id
