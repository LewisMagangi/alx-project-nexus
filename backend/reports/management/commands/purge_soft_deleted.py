from django.core.management.base import BaseCommand
from posts.models import Post


class Command(BaseCommand):
    help = "Permanently delete all posts marked as soft-deleted."

    def handle(self, *args, **options):
        deleted_count, _ = Post.objects.filter(is_deleted=True).delete()
        self.stdout.write(
            self.style.SUCCESS(
                f"Permanently deleted {deleted_count} soft-deleted posts."
            )
        )
