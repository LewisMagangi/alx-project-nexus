from django.contrib.auth.models import User
from django.db import models
from posts.models import Post


class Bookmark(models.Model):
    """User bookmarks for posts"""

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="bookmarks"
    )
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="bookmarked_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} bookmarked Post {self.post.id}"
