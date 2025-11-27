from django.contrib.auth.models import User
from django.db import models


class Block(models.Model):
    blocker = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="blocks_out"
    )
    blocked = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="blocks_in"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("blocker", "blocked")
