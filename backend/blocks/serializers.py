from rest_framework import serializers

from .models import Block


class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = ["id", "blocker", "blocked", "created_at"]
        read_only_fields = ["blocker", "created_at"]
