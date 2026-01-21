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
    email_verified_at = models.DateTimeField(null=True, blank=True)

    # Password reset and email verification tokens
    reset_token = models.CharField(max_length=64, blank=True, default="")
    reset_token_expires = models.DateTimeField(null=True, blank=True)
    email_verification_key = models.CharField(
        max_length=64, blank=True, default=""
    )
    email_verification_key_expires = models.DateTimeField(
        null=True, blank=True
    )

    # Verification attempt tracking
    email_verification_attempts = models.IntegerField(default=0)
    last_verification_attempt_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Profile for {self.user.username}"


# Email verification audit trail
class EmailVerificationLog(models.Model):
    STATUS_CHOICES = [
        ('sent', 'Email Sent'),
        ('verified', 'Successfully Verified'),
        ('expired', 'Link Expired'),
        ('failed', 'Verification Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    email = models.EmailField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['email', 'status', 'created_at']),
        ]

    def __str__(self):
        return f"{self.email} - {self.status}"
