"""
Posts models with support for:
- Regular posts
- Replies (threaded)
- Retweets
- Quote tweets
- Hashtags
- Mentions
"""

import re

from django.contrib.auth.models import User
from django.db import models
from django.db.models import F
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver


class Post(models.Model):
    """
    Unified Post model supporting:
    - Regular tweets
    - Replies (parent_post set)
    - Threads (root_post tracks thread root)
    - Retweets (retweet_of set, no content)
    - Quote tweets (retweet_of set + content)
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.CharField(max_length=280, blank=True, default="")

    # Reply/Thread support
    parent_post = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="replies",
    )
    root_post = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="thread_posts",
    )

    # Retweet/Quote support
    retweet_of = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="retweets",
    )
    is_quote_tweet = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    # Denormalized counts for performance (updated via signals)
    reply_count = models.IntegerField(default=0)
    retweet_count = models.IntegerField(default=0)
    like_count = models.IntegerField(default=0)
    quote_count = models.IntegerField(default=0)
    bookmark_count = models.IntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=["user", "created_at"]),
            models.Index(fields=["parent_post"]),
            models.Index(fields=["root_post"]),
            models.Index(fields=["retweet_of"]),
            models.Index(fields=["retweet_of", "user"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["is_deleted", "created_at"]),
            models.Index(fields=["root_post", "created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        if self.is_retweet:
            return f"{self.user.username} retweeted Post {self.retweet_of_id}"
        if self.is_quote_tweet:
            return f"{self.user.username} quoted Post {self.retweet_of_id}"
        return f"{self.user.username}: {self.content[:30]}"

    @property
    def is_retweet(self):
        """True if this is a pure retweet (no content)"""
        return (
            self.retweet_of_id is not None
            and not self.is_quote_tweet
            and not self.content
        )

    @property
    def is_reply(self):
        """True if this is a reply to another post"""
        return self.parent_post_id is not None

    def save(self, *args, **kwargs):
        # Set root_post for thread tracking
        if self.parent_post_id and not self.root_post_id:
            parent = Post.objects.get(pk=self.parent_post_id)
            self.root_post = parent.root_post or parent

        # Set is_quote_tweet flag
        if self.retweet_of_id and self.content:
            self.is_quote_tweet = True

        super().save(*args, **kwargs)


class Hashtag(models.Model):
    """Normalized hashtag storage for 3NF compliance"""

    tag = models.CharField(max_length=100, unique=True, db_index=True)

    # Trending support (denormalized)
    use_count = models.IntegerField(default=0)
    last_used_at = models.DateTimeField(auto_now=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["tag"]),
            models.Index(fields=["use_count", "last_used_at"]),
            models.Index(fields=["last_used_at"]),
        ]

    def __str__(self):
        return f"#{self.tag}"

    @classmethod
    def normalize_tag(cls, tag):
        """Normalize hashtag (lowercase, remove #, strip whitespace)"""
        # First strip whitespace, then remove leading #, then strip again, then lowercase
        return tag.strip().lstrip("#").strip().lower()

    @classmethod
    def extract_from_content(cls, content):
        """Extract hashtag strings from post content"""
        pattern = r"#(\w+)"
        return re.findall(pattern, content)


class PostHashtag(models.Model):
    """Many-to-many relationship between posts and hashtags (3NF)"""

    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="post_hashtags"
    )
    hashtag = models.ForeignKey(
        Hashtag, on_delete=models.CASCADE, related_name="hashtag_posts"
    )
    position = models.IntegerField(default=0)  # Order of appearance

    class Meta:
        unique_together = ("post", "hashtag")
        indexes = [
            models.Index(fields=["post", "hashtag"]),
            models.Index(fields=["hashtag"]),
        ]

    def __str__(self):
        return f"{self.post_id} - #{self.hashtag.tag}"


class Mention(models.Model):
    """User mentions in posts (@username) - 3NF compliant"""

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="mentions")
    mentioned_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="mentioned_in"
    )
    mentioner_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="has_mentioned"
    )
    position = models.IntegerField(default=0)  # Order of appearance
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("post", "mentioned_user")
        indexes = [
            models.Index(fields=["mentioned_user"]),
            models.Index(fields=["post"]),
            models.Index(fields=["mentioned_user", "created_at"]),
        ]

    def __str__(self):
        return (
            f"@{self.mentioned_user.username} mentioned "
            f"by @{self.mentioner_user.username}"
        )

    @classmethod
    def extract_from_content(cls, content):
        """Extract username strings from post content"""
        pattern = r"@(\w+)"
        return re.findall(pattern, content)


class Like(models.Model):
    """User likes on posts"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")
        indexes = [
            models.Index(fields=["post", "created_at"]),
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"{self.user.username} likes Post {self.post.id}"


class Follow(models.Model):
    """User follow relationships"""

    follower = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="following"
    )
    following = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="followers"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "following")
        indexes = [
            models.Index(fields=["follower"]),
            models.Index(fields=["following"]),
            models.Index(fields=["following", "created_at"]),
        ]

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"


# =============================================================================
# SIGNALS FOR DENORMALIZED COUNT UPDATES
# =============================================================================


@receiver(post_save, sender=Post)
def update_reply_count_on_create(sender, instance, created, **kwargs):
    """Update parent post's reply_count when a reply is created"""
    if created and instance.parent_post_id:
        Post.objects.filter(pk=instance.parent_post_id).update(
            reply_count=F("reply_count") + 1
        )


@receiver(post_delete, sender=Post)
def update_reply_count_on_delete(sender, instance, **kwargs):
    """Update parent post's reply_count when a reply is deleted"""
    if instance.parent_post_id:
        Post.objects.filter(pk=instance.parent_post_id).update(
            reply_count=F("reply_count") - 1
        )


@receiver(post_save, sender=Post)
def update_retweet_quote_count_on_create(sender, instance, created, **kwargs):
    """Update original post's retweet/quote count"""
    if created and instance.retweet_of_id:
        if instance.is_quote_tweet:
            Post.objects.filter(pk=instance.retweet_of_id).update(
                quote_count=F("quote_count") + 1
            )
        else:
            Post.objects.filter(pk=instance.retweet_of_id).update(
                retweet_count=F("retweet_count") + 1
            )


@receiver(post_delete, sender=Post)
def update_retweet_quote_count_on_delete(sender, instance, **kwargs):
    """Update original post's retweet/quote count on delete"""
    if instance.retweet_of_id:
        if instance.is_quote_tweet:
            Post.objects.filter(pk=instance.retweet_of_id).update(
                quote_count=F("quote_count") - 1
            )
        else:
            Post.objects.filter(pk=instance.retweet_of_id).update(
                retweet_count=F("retweet_count") - 1
            )


@receiver(post_save, sender=Like)
def update_like_count_on_create(sender, instance, created, **kwargs):
    """Update post's like_count when a like is created"""
    if created:
        Post.objects.filter(pk=instance.post_id).update(like_count=F("like_count") + 1)


@receiver(post_delete, sender=Like)
def update_like_count_on_delete(sender, instance, **kwargs):
    """Update post's like_count when a like is deleted"""
    Post.objects.filter(pk=instance.post_id).update(like_count=F("like_count") - 1)
