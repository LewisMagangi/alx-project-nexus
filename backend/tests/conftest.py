"""
Pytest configuration for Django tests.
Handles PYTHONPATH setup for both local and CI environments.
"""

import os
import sys
from pathlib import Path

import django
import pytest

# Add backend directory to Python path (for CI)
backend_dir = Path(__file__).parent.parent  # Go up from tests/ to backend/
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Set Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# Setup Django

django.setup()


# Your existing fixtures below
@pytest.fixture
def api_client():
    """Return Django REST framework API client."""
    from rest_framework.test import APIClient

    return APIClient()


@pytest.fixture
def user(db):
    """Create and return a test user."""
    from django.contrib.auth import get_user_model

    User = get_user_model()
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123",
    )


@pytest.fixture
def authenticated_client(api_client, user):
    """Return authenticated API client."""
    api_client.force_authenticate(user=user)
    return api_client
