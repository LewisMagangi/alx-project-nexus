from rest_framework import serializers


class SearchResultSerializer(serializers.Serializer):
    users = serializers.ListField(child=serializers.DictField())
    posts = serializers.ListField(child=serializers.DictField())
