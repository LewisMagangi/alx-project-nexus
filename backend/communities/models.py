from django.contrib.auth.models import User
from django.db import models


class Community(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="owned_communities"
    )
    created_at = models.DateTimeField(auto_now_add=True)


class CommunityMember(models.Model):
    community = models.ForeignKey(
        Community, on_delete=models.CASCADE, related_name="members"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="communities"
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("community", "user")


class CommunityPost(models.Model):
    community = models.ForeignKey(
        Community, on_delete=models.CASCADE, related_name="posts"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
