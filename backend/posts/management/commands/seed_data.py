"""
Django management command to seed the database with sample data
Place this file in: backend/posts/management/commands/seed_data.py
Run with: python manage.py seed_data
"""

import random

from bookmarks.models import Bookmark
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from notifications.models import Notification
from posts.models import Follow, Like, Post
from usermessages.models import Message
from users.models import UserProfile


class Command(BaseCommand):
    help = "Seeds the database with sample data"

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing existing data...")

        # Clear existing data (be careful in production!)
        Like.objects.all().delete()
        Follow.objects.all().delete()
        Bookmark.objects.all().delete()
        Notification.objects.all().delete()
        Message.objects.all().delete()
        Post.objects.all().delete()
        UserProfile.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

        self.stdout.write("Creating users...")

        # Create sample users
        users_data = [
            {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "password123",
            },
            {
                "username": "jane_smith",
                "email": "jane@example.com",
                "password": "password123",
            },
            {
                "username": "tech_guru",
                "email": "tech@example.com",
                "password": "password123",
            },
            {
                "username": "foodie_life",
                "email": "foodie@example.com",
                "password": "password123",
            },
            {
                "username": "travel_bug",
                "email": "travel@example.com",
                "password": "password123",
            },
            {
                "username": "sports_fan",
                "email": "sports@example.com",
                "password": "password123",
            },
            {
                "username": "book_worm",
                "email": "books@example.com",
                "password": "password123",
            },
            {
                "username": "music_lover",
                "email": "music@example.com",
                "password": "password123",
            },
            {
                "username": "fitness_coach",
                "email": "fitness@example.com",
                "password": "password123",
            },
            {
                "username": "art_enthusiast",
                "email": "art@example.com",
                "password": "password123",
            },
        ]

        users = []
        for user_data in users_data:
            user = User.objects.create_user(
                username=user_data["username"],
                email=user_data["email"],
                password=user_data["password"],
            )
            # Create UserProfile with accepted legal policies
            UserProfile.objects.create(user=user, accepted_legal_policies=True)
            users.append(user)
            self.stdout.write(f"  Created user: {user.username}")

        self.stdout.write("\nCreating posts...")

        # Sample post content
        post_contents = [
            "Just finished reading an amazing book! 📚 Highly recommend it.",
            "Beautiful sunset today! Nature never fails to amaze me. 🌅",
            "Started learning Python today. Any tips for beginners?",
            "Coffee is my fuel ☕ What's yours?",
            "Working on a new project. Excited to share soon! 💻",
            "Weekend vibes! Time to relax and recharge. 😊",
            (
                "Does anyone else think mornings are the best time "
                "for productivity?"
            ),
            "Just tried a new recipe and it turned out great! 🍳",
            "Motivation Monday: You got this! 💪",
            "Traveling to a new city next week. Any recommendations?",
            "Music is the universal language of mankind. 🎵",
            "Finished my morning run. Feeling energized! 🏃",
            "Technology is changing the world in amazing ways.",
            "Reading is dreaming with your eyes open. 📖",
            "Life is short, make every moment count!",
            "Just launched my new website! Check it out!",
            "Coding all night, debugging all day. Developer life! 👨‍💻",
            "Never stop learning, never stop growing.",
            "Found a great new coffee shop downtown ☕",
            "Watching the stars tonight. Universe is incredible! ✨",
            "Productivity tip: Take breaks! Your brain needs rest.",
            "Just hit a new personal record at the gym! 🏋️",
            "Art is not what you see, but what you make others see.",
            "Food is love made edible. 🍕",
            "Every expert was once a beginner. Keep going!",
            "Sunset chaser and adventure seeker. 🌄",
            "Innovation distinguishes between a leader and a follower.",
            "Books are uniquely portable magic.",
            "Music can change the world because it can change people.",
            "The only way to do great work is to love what you do.",
        ]

        posts = []
        for i, user in enumerate(users):
            # Each user creates 3-5 posts
            num_posts = random.randint(3, 5)
            for _ in range(num_posts):
                content = random.choice(post_contents)
                post = Post.objects.create(user=user, content=content)
                posts.append(post)

        self.stdout.write(f"  Created {len(posts)} posts")

        self.stdout.write("\nCreating follows...")

        # Create follow relationships
        follow_count = 0
        for user in users:
            # Each user follows 3-7 random other users
            num_follows = random.randint(3, 7)
            potential_follows = [u for u in users if u != user]
            follows_to_create = random.sample(
                potential_follows, min(num_follows, len(potential_follows))
            )

            for following_user in follows_to_create:
                if not Follow.objects.filter(
                    follower=user, following=following_user
                ).exists():
                    Follow.objects.create(
                        follower=user, following=following_user
                    )
                    follow_count += 1

                    # Create notification
                    Notification.objects.create(
                        user=following_user,
                        actor=user,
                        verb="started following you",
                        target_type="user",
                        target_id=following_user.id,
                    )

        self.stdout.write(f"  Created {follow_count} follow relationships")

        self.stdout.write("\nCreating likes...")

        # Create likes
        like_count = 0
        for user in users:
            # Each user likes 5-10 random posts (not their own)
            num_likes = random.randint(5, 10)
            potential_posts = [p for p in posts if p.user != user]
            posts_to_like = random.sample(
                potential_posts, min(num_likes, len(potential_posts))
            )

            for post in posts_to_like:
                if not Like.objects.filter(user=user, post=post).exists():
                    Like.objects.create(user=user, post=post)
                    like_count += 1

                    # Create notification
                    Notification.objects.create(
                        user=post.user,
                        actor=user,
                        verb="liked your post",
                        target_type="post",
                        target_id=post.id,
                    )

        self.stdout.write(f"  Created {like_count} likes")

        self.stdout.write("\nCreating bookmarks...")

        # Create bookmarks
        bookmark_count = 0
        for user in users:
            # Each user bookmarks 2-5 random posts
            num_bookmarks = random.randint(2, 5)
            posts_to_bookmark = random.sample(
                posts, min(num_bookmarks, len(posts))
            )

            for post in posts_to_bookmark:
                if not Bookmark.objects.filter(user=user, post=post).exists():
                    Bookmark.objects.create(user=user, post=post)
                    bookmark_count += 1

        self.stdout.write(f"  Created {bookmark_count} bookmarks")

        self.stdout.write("\nCreating messages...")

        # Create some messages between users
        message_count = 0
        message_templates = [
            "Hey! How are you doing?",
            "Thanks for following me!",
            "I loved your recent post!",
            "Want to collaborate on something?",
            "Hope you're having a great day!",
        ]

        for user in users[:5]:  # First 5 users send messages
            # Each sends messages to 2-3 other users
            num_conversations = random.randint(2, 3)
            receivers = random.sample(
                [u for u in users if u != user], num_conversations
            )

            for receiver in receivers:
                # Send 1-2 messages in each conversation
                for _ in range(random.randint(1, 2)):
                    Message.objects.create(
                        sender=user,
                        receiver=receiver,
                        content=random.choice(message_templates),
                    )
                    message_count += 1

        self.stdout.write(f"  Created {message_count} messages")

        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))
        self.stdout.write("=" * 50)
        self.stdout.write("\nSummary:")
        self.stdout.write(f"  Users: {len(users)}")
        self.stdout.write(f"  Posts: {len(posts)}")
        self.stdout.write(f"  Follows: {follow_count}")
        self.stdout.write(f"  Likes: {like_count}")
        self.stdout.write(f"  Bookmarks: {bookmark_count}")
        self.stdout.write(f"  Messages: {message_count}")
        self.stdout.write(f"  Notifications: {Notification.objects.count()}")
        self.stdout.write("\nTest credentials:")
        self.stdout.write("  Username: john_doe (or any from the list)")
        self.stdout.write("  Password: password123")
