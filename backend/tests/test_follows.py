import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_follow_user():
    follower = User.objects.create(username="follower", password="pass")
    following = User.objects.create(username="following", password="pass")
    client = APIClient()
    client.force_authenticate(user=follower)
    url = reverse("follow-list")
    data = {"follower": follower.id, "following": following.id}
    response = client.post(url, data, format="json")
    assert response.status_code == 201
    assert response.data["follower"] == follower.id
    assert response.data["following"] == following.id
