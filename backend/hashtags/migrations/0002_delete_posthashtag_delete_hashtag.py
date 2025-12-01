# Generated migration to remove duplicate models

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("hashtags", "0001_initial"),
    ]

    operations = [
        migrations.DeleteModel(
            name="PostHashtag",
        ),
        migrations.DeleteModel(
            name="Hashtag",
        ),
    ]
