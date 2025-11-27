from django.contrib import admin

from .models import PostReport


@admin.register(PostReport)
class PostReportAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "reporter", "reason", "created_at")
