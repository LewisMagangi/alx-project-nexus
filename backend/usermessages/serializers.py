from rest_framework import serializers

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source="sender.username")

    class Meta:
        model = Message
        fields = [
            "id",
            "sender_username",
            "receiver",
            "content",
            "created_at",
            "is_read",
        ]
        read_only_fields = ["sender_username", "created_at", "is_read"]
