from rest_framework import serializers

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source="sender.username")
    receiver = serializers.PrimaryKeyRelatedField(read_only=True)

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
        extra_kwargs = {"receiver": {"write_only": True, "required": False}}
