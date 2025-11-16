import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from posts.models import Post
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_like_post():
    user = User.objects.create(username="likeuser", password="likepass")
    post = Post.objects.create(user=user, content="Like this!")
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("like-list")
    data = {"user": user.id, "post": post.id}
    response = client.post(url, data, format="json")
    assert response.status_code == 201
    assert response.data["post"] == post.id
