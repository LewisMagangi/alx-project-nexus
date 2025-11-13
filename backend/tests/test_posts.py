import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from users.models import User
from posts.models import Post

@pytest.mark.django_db
def test_create_post():
    user = User.objects.create(username='testuser', password='testpass')
    client = APIClient()
    url = reverse('post-list')
    data = {'user': user.id, 'content': 'Hello, world!'}
    response = client.post(url, data, format='json')
    assert response.status_code == 201
    assert response.data['content'] == 'Hello, world!'

@pytest.mark.django_db
def test_list_posts():
    user = User.objects.create(username='testuser', password='testpass')
    Post.objects.create(user=user, content='First post')
    client = APIClient()
    url = reverse('post-list')
    response = client.get(url)
    assert response.status_code == 200
    assert len(response.data) >= 1
