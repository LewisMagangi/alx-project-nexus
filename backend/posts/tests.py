"""
Comprehensive tests for posts app including:
- Retweets and quote tweets
- Threaded replies
- Hashtags
- Mentions
- API endpoints
"""

import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient

from .models import Follow, Hashtag, Like, Mention, Post, PostHashtag


@pytest.fixture
def api_client():
    """Create an API client"""
    return APIClient()


@pytest.fixture
def user(db):
    """Create a test user"""
    return User.objects.create_user(
        username="testuser", email="test@example.com", password="testpass123"
    )


@pytest.fixture
def other_user(db):
    """Create another test user"""
    return User.objects.create_user(
        username="otheruser",
        email="other@example.com",
        password="otherpass123",
    )


@pytest.fixture
def authenticated_client(api_client, user):
    """Create an authenticated API client"""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def post(db, user):
    """Create a test post"""
    return Post.objects.create(user=user, content="Test post content")


@pytest.fixture
def post_with_hashtag(db, user):
    """Create a post with a hashtag"""
    post = Post.objects.create(user=user, content="Test post #python #django")
    # Create hashtags
    for tag in ["python", "django"]:
        hashtag, _ = Hashtag.objects.get_or_create(tag=tag)
        PostHashtag.objects.create(post=post, hashtag=hashtag)
    return post


# =============================================================================
# POST MODEL TESTS
# =============================================================================


class TestPostModel:
    """Tests for the Post model"""

    def test_create_post(self, db, user):
        """Test creating a regular post"""
        post = Post.objects.create(user=user, content="Hello world")
        assert post.content == "Hello world"
        assert post.user == user
        assert not post.is_retweet
        assert not post.is_reply
        assert not post.is_quote_tweet

    def test_create_reply(self, db, user, post):
        """Test creating a reply"""
        reply = Post.objects.create(
            user=user, content="This is a reply", parent_post=post
        )
        assert reply.is_reply
        assert reply.parent_post == post
        assert reply.root_post == post

    def test_nested_replies_set_root(self, db, user, post):
        """Test that nested replies correctly set root_post"""
        reply1 = Post.objects.create(
            user=user, content="First reply", parent_post=post
        )
        reply2 = Post.objects.create(
            user=user, content="Reply to reply", parent_post=reply1
        )
        assert reply2.root_post == post

    def test_retweet_properties(self, db, user, other_user, post):
        """Test retweet is_retweet property"""
        retweet = Post.objects.create(
            user=other_user, content="", retweet_of=post
        )
        assert retweet.is_retweet
        assert not retweet.is_quote_tweet

    def test_quote_tweet_properties(self, db, user, other_user, post):
        """Test quote tweet is_quote_tweet property"""
        quote = Post.objects.create(
            user=other_user, content="Great post!", retweet_of=post
        )
        assert quote.is_quote_tweet
        assert not quote.is_retweet


# =============================================================================
# HASHTAG TESTS
# =============================================================================


class TestHashtag:
    """Tests for hashtag functionality"""

    def test_normalize_tag(self, db):
        """Test hashtag normalization"""
        assert Hashtag.normalize_tag("#Python") == "python"
        assert Hashtag.normalize_tag("DJANGO") == "django"
        assert Hashtag.normalize_tag("  #Flask  ") == "flask"

    def test_extract_hashtags(self, db):
        """Test extracting hashtags from content"""
        content = "Learning #Python and #Django today!"
        tags = Hashtag.extract_from_content(content)
        assert "Python" in tags
        assert "Django" in tags
        assert len(tags) == 2

    def test_hashtag_unique(self, db):
        """Test hashtag uniqueness"""
        Hashtag.objects.create(tag="python")
        with pytest.raises(Exception):
            Hashtag.objects.create(tag="python")


# =============================================================================
# MENTION TESTS
# =============================================================================


class TestMention:
    """Tests for mention functionality"""

    def test_extract_mentions(self, db):
        """Test extracting mentions from content"""
        content = "Hello @testuser and @otheruser!"
        usernames = Mention.extract_from_content(content)
        assert "testuser" in usernames
        assert "otheruser" in usernames
        assert len(usernames) == 2

    def test_create_mention(self, db, user, other_user, post):
        """Test creating a mention"""
        mention = Mention.objects.create(
            post=post, mentioned_user=other_user, mentioner_user=user
        )
        assert mention.mentioned_user == other_user
        assert mention.mentioner_user == user


# =============================================================================
# SIGNAL TESTS
# =============================================================================


class TestSignals:
    """Tests for model signals"""

    def test_reply_count_increments(self, db, user, post):
        """Test that reply_count increments on reply creation"""
        initial_count = post.reply_count
        Post.objects.create(user=user, content="Reply", parent_post=post)
        post.refresh_from_db()
        assert post.reply_count == initial_count + 1

    def test_reply_count_decrements(self, db, user, post):
        """Test that reply_count decrements on reply deletion"""
        reply = Post.objects.create(
            user=user, content="Reply", parent_post=post
        )
        post.refresh_from_db()
        initial_count = post.reply_count
        reply.delete()
        post.refresh_from_db()
        assert post.reply_count == initial_count - 1

    def test_like_count_increments(self, db, user, other_user, post):
        """Test that like_count increments on like creation"""
        initial_count = post.like_count
        Like.objects.create(user=other_user, post=post)
        post.refresh_from_db()
        assert post.like_count == initial_count + 1

    def test_like_count_decrements(self, db, user, other_user, post):
        """Test that like_count decrements on like deletion"""
        like = Like.objects.create(user=other_user, post=post)
        post.refresh_from_db()
        initial_count = post.like_count
        like.delete()
        post.refresh_from_db()
        assert post.like_count == initial_count - 1


# =============================================================================
# API ENDPOINT TESTS
# =============================================================================


class TestPostAPI:
    """Tests for post API endpoints"""

    def test_list_posts(self, authenticated_client, post):
        """Test listing posts"""
        response = authenticated_client.get("/api/posts/")
        assert response.status_code == status.HTTP_200_OK

    def test_create_post(self, authenticated_client):
        """Test creating a post via API"""
        response = authenticated_client.post(
            "/api/posts/", {"content": "New post from API"}
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["content"] == "New post from API"

    def test_create_post_with_hashtags(self, authenticated_client):
        """Test creating a post with hashtags"""
        response = authenticated_client.post(
            "/api/posts/", {"content": "Testing #api #rest"}
        )
        assert response.status_code == status.HTTP_201_CREATED
        # Check hashtags were created
        assert Hashtag.objects.filter(tag="api").exists()
        assert Hashtag.objects.filter(tag="rest").exists()

    def test_create_reply(self, authenticated_client, post):
        """Test creating a reply via API"""
        response = authenticated_client.post(
            "/api/posts/",
            {"content": "This is a reply", "parent_post": post.id},
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["parent_post"] == post.id

    def test_get_post_detail(self, authenticated_client, post):
        """Test retrieving a single post"""
        response = authenticated_client.get(f"/api/posts/{post.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == post.id

    def test_delete_post(self, authenticated_client, user, post):
        """Test soft deleting a post"""
        response = authenticated_client.delete(f"/api/posts/{post.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        post.refresh_from_db()
        assert post.is_deleted


class TestRetweetAPI:
    """Tests for retweet API endpoints"""

    def test_retweet_post(self, authenticated_client, post, user):
        """Test retweeting a post"""
        response = authenticated_client.post(f"/api/posts/{post.id}/retweet/")
        assert response.status_code == status.HTTP_201_CREATED
        # Check retweet was created
        retweet = Post.objects.filter(user=user, retweet_of=post).first()
        assert retweet is not None
        assert retweet.is_retweet

    def test_cannot_retweet_twice(self, authenticated_client, post, user):
        """Test that retweeting twice fails"""
        authenticated_client.post(f"/api/posts/{post.id}/retweet/")
        response = authenticated_client.post(f"/api/posts/{post.id}/retweet/")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_unretweet(self, authenticated_client, post, user):
        """Test unretweeting a post"""
        authenticated_client.post(f"/api/posts/{post.id}/retweet/")
        response = authenticated_client.post(
            f"/api/posts/{post.id}/unretweet/"
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_unretweet_not_retweeted(self, authenticated_client, post):
        """Test unretweeting when not retweeted fails"""
        response = authenticated_client.post(
            f"/api/posts/{post.id}/unretweet/"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestThreadAPI:
    """Tests for thread API endpoints"""

    def test_get_thread(self, authenticated_client, post, user):
        """Test getting a thread"""
        # Create replies
        reply1 = Post.objects.create(
            user=user, content="Reply 1", parent_post=post
        )
        reply2 = Post.objects.create(
            user=user, content="Reply 2", parent_post=reply1
        )

        response = authenticated_client.get(f"/api/posts/{post.id}/thread/")
        assert response.status_code == status.HTTP_200_OK
        # Should include original post and all replies
        assert len(response.data) >= 3

    def test_get_replies(self, authenticated_client, post, user):
        """Test getting direct replies"""
        Post.objects.create(user=user, content="Reply 1", parent_post=post)
        response = authenticated_client.get(f"/api/posts/{post.id}/replies/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1


class TestHashtagAPI:
    """Tests for hashtag API endpoints"""

    def test_trending_hashtags(self, authenticated_client, post_with_hashtag):
        """Test getting trending hashtags"""
        response = authenticated_client.get("/api/posts/trending_hashtags/")
        assert response.status_code == status.HTTP_200_OK
        tags = [h["tag"] for h in response.data]
        assert "python" in tags or "django" in tags

    def test_filter_by_hashtag(self, authenticated_client, post_with_hashtag):
        """Test filtering posts by hashtag"""
        response = authenticated_client.get("/api/posts/hashtag/python/")
        assert response.status_code == status.HTTP_200_OK


class TestMentionAPI:
    """Tests for mention API endpoints"""

    def test_create_post_with_mention(self, authenticated_client, other_user):
        """Test creating a post with mentions"""
        response = authenticated_client.post(
            "/api/posts/", {"content": f"Hello @{other_user.username}!"}
        )
        assert response.status_code == status.HTTP_201_CREATED
        # Check mention was created
        assert Mention.objects.filter(mentioned_user=other_user).exists()

    def test_filter_by_mention(
        self, authenticated_client, user, other_user, db
    ):
        """Test filtering posts by mention"""
        # Create a post mentioning other_user
        post = Post.objects.create(
            user=user, content=f"Hello @{other_user.username}!"
        )
        Mention.objects.create(
            post=post, mentioned_user=other_user, mentioner_user=user
        )

        response = authenticated_client.get(
            f"/api/posts/mentions/{other_user.username}/"
        )
        assert response.status_code == status.HTTP_200_OK


class TestLikeAPI:
    """Tests for like API endpoints"""

    def test_like_post(self, authenticated_client, post):
        """Test liking a post"""
        response = authenticated_client.post("/api/likes/", {"post": post.id})
        assert response.status_code == status.HTTP_201_CREATED

    def test_unlike_post(self, authenticated_client, post, user):
        """Test unliking a post"""
        like = Like.objects.create(user=user, post=post)
        response = authenticated_client.delete(f"/api/likes/{like.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT


class TestFollowAPI:
    """Tests for follow API endpoints"""

    def test_follow_user(self, authenticated_client, other_user):
        """Test following a user"""
        response = authenticated_client.post(
            "/api/follows/", {"following": other_user.id}
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_unfollow_user(self, authenticated_client, user, other_user):
        """Test unfollowing a user"""
        follow = Follow.objects.create(follower=user, following=other_user)
        response = authenticated_client.delete(f"/api/follows/{follow.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_get_followers(self, authenticated_client, user, other_user):
        """Test getting followers list"""
        Follow.objects.create(follower=other_user, following=user)
        response = authenticated_client.get("/api/follows/followers/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_get_following(self, authenticated_client, user, other_user):
        """Test getting following list"""
        Follow.objects.create(follower=user, following=other_user)
        response = authenticated_client.get("/api/follows/following/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1


class TestHomeFeedAPI:
    """Tests for home feed API endpoint"""

    def test_home_feed_shows_followed_users_posts(
        self, authenticated_client, user, other_user, db
    ):
        """Test that home feed shows posts from followed users"""
        # Follow other_user
        Follow.objects.create(follower=user, following=other_user)
        # Create post by other_user
        Post.objects.create(user=other_user, content="Other user's post")

        response = authenticated_client.get("/api/posts/home/")
        assert response.status_code == status.HTTP_200_OK
        # Should include posts from followed users
        contents = [p["content"] for p in response.data]
        assert "Other user's post" in contents

    def test_home_feed_shows_own_posts(self, authenticated_client, user, db):
        """Test that home feed shows user's own posts"""
        Post.objects.create(user=user, content="My own post")
        response = authenticated_client.get("/api/posts/home/")
        assert response.status_code == status.HTTP_200_OK
        contents = [p["content"] for p in response.data]
        assert "My own post" in contents
