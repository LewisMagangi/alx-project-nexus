from rest_framework import serializers

from .models import Hashtag, PostHashtag


class HashtagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hashtag
        fields = ["id", "tag"]


class PostHashtagSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostHashtag
        fields = ["id", "post", "hashtag"]
