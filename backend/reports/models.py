from django.contrib.auth.models import User
from django.db import models
from posts.models import Post


class PostReport(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    reporter = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
