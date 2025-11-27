from django.contrib import admin

from .models import Hashtag, PostHashtag


@admin.register(Hashtag)
class HashtagAdmin(admin.ModelAdmin):
    list_display = ("id", "tag")


@admin.register(PostHashtag)
class PostHashtagAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "hashtag")
