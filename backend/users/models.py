from django.contrib.auth.models import User
from django.db import models


# Extend User model via a profile for legal policy acceptance
class UserProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile"
    )
    accepted_legal_policies = models.BooleanField(default=False)
    
    # Profile information
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    website = models.URLField(max_length=255, blank=True, null=True)
    
    # Profile images (stored as URLs)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    header_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Denormalized counts for profile display
    followers_count = models.IntegerField(default=0)
    following_count = models.IntegerField(default=0)
    posts_count = models.IntegerField(default=0)
    
    # Account status
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Profile for {self.user.username}"
