from django.contrib.auth.models import User
from django.db import models


# Extend User model via a profile for legal policy acceptance
class UserProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile"
    )
    accepted_legal_policies = models.BooleanField(default=False)

    def __str__(self):
        return f"Profile for {self.user.username}"
