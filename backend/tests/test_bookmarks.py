import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from posts.models import Post
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestBookmarks:

    def setup_method(self):
        """Setup test data"""
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.other_user = User.objects.create_user(
            username="otheruser", password="testpass123"
        )
        self.post = Post.objects.create(user=self.user, content="Test post")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_bookmark(self):
        """Test bookmarking a post"""
        url = reverse("bookmark-list")
        data = {"post_id": self.post.id}
        response = self.client.post(url, data, format="json")

        print("RESPONSE DATA:", response.data)
        assert response.status_code == 201
        # Adjust assertion after inspecting response structure
        assert response.data["post"]["id"] == self.post.id

    def test_duplicate_bookmark_fails(self):
        """Test that duplicate bookmarks are prevented"""
        url = reverse("bookmark-list")
        data = {"post_id": self.post.id}

        # First bookmark succeeds
        response1 = self.client.post(url, data, format="json")
        assert response1.status_code == 201

        # Second bookmark fails
        response2 = self.client.post(url, data, format="json")
        assert response2.status_code == 400

    def test_list_bookmarks(self):
        """Test listing user's bookmarks"""
        # Create bookmark
        from bookmarks.models import Bookmark

        Bookmark.objects.create(user=self.user, post=self.post)

        url = reverse("bookmark-list")
        response = self.client.get(url)

        assert response.status_code == 200
        bookmarks = (
            response.data["results"] if "results" in response.data else response.data
        )
        assert len(bookmarks) == 1
        assert bookmarks[0]["post"]["id"] == self.post.id

    def test_delete_bookmark(self):
        """Test removing a bookmark"""
        from bookmarks.models import Bookmark

        bookmark = Bookmark.objects.create(user=self.user, post=self.post)

        url = reverse("bookmark-detail", args=[bookmark.id])
        response = self.client.delete(url)

        assert response.status_code == 204
        assert Bookmark.objects.count() == 0

    def test_cannot_see_others_bookmarks(self):
        """Test that users can only see their own bookmarks"""
        from bookmarks.models import Bookmark

        # Other user creates bookmark
        Bookmark.objects.create(user=self.other_user, post=self.post)

        # Current user shouldn't see it
        url = reverse("bookmark-list")
        response = self.client.get(url)

        assert response.status_code == 200
        bookmarks = (
            response.data["results"] if "results" in response.data else response.data
        )
        assert len(bookmarks) == 0

    def test_unauthenticated_fails(self):
        """Test that unauthenticated requests fail"""
        self.client.force_authenticate(user=None)

        url = reverse("bookmark-list")
        response = self.client.get(url)

        assert response.status_code == 401
