import pytest
from users.models import User

@pytest.fixture
def test_user(db):
    return User.objects.create(username='fixtureuser', password='fixturepass')
