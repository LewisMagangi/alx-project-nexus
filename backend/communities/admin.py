from django.contrib import admin

from .models import Community, CommunityMember, CommunityPost


@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description", "created_at")


@admin.register(CommunityMember)
class CommunityMemberAdmin(admin.ModelAdmin):
    list_display = ("id", "community", "user", "joined_at")


@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ("id", "community", "user", "created_at")
