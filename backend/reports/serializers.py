from rest_framework import serializers

from .models import PostReport


class PostReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostReport
        fields = ["id", "post", "reporter", "reason", "created_at"]
        read_only_fields = ["reporter", "created_at"]
