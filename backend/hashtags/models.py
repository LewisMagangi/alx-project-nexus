from django.db import models


# Create your models here.
class Hashtag(models.Model):
    tag = models.CharField(max_length=100, unique=True)


from posts.models import Post


class PostHashtag(models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="post_hashtags"
    )
    hashtag = models.ForeignKey(
        Hashtag, on_delete=models.CASCADE, related_name="hashtag_posts"
    )

    class Meta:
        unique_together = ("post", "hashtag")
