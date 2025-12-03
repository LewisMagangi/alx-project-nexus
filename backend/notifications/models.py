from django.contrib.auth.models import User
from django.db import models


# Create your models here.
class Notification(models.Model):
    class Meta:
        ordering = ["-created_at"]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="actor_notifications",
    )
    verb = models.CharField(max_length=255)  # "liked your post" / "followed you"
    target_id = models.IntegerField(null=True, blank=True)
    target_type = models.CharField(max_length=50, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
