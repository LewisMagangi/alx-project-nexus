from django.contrib import admin

from .models import Follow, Like, Post, Hashtag, PostHashtag, Mention


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "content", "created_at", "is_deleted")


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "created_at")


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ("id", "follower", "following", "created_at")


@admin.register(Hashtag)
class HashtagAdmin(admin.ModelAdmin):
    list_display = ("id", "tag", "created_at")
    search_fields = ("tag",)


@admin.register(PostHashtag)
class PostHashtagAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "hashtag")


@admin.register(Mention)
class MentionAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "mentioned_user", "created_at")
