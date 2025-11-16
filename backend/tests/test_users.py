import pytest
from django.contrib.auth.models import User


@pytest.mark.django_db
def test_create_user():
    user = User.objects.create(username="newuser", password="newpass")
    assert user.username == "newuser"
    assert User.objects.count() == 1
