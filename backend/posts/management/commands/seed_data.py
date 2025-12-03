"""
Django management command to seed the database with comprehensive sample data.

Handles posts, replies, threads, retweets, quote tweets, hashtags, and
mentions.
Place this file in: backend/posts/management/commands/seed_data.py
Run with: python manage.py seed_data
"""

import random
import re
from datetime import timedelta

from bookmarks.models import Bookmark
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone
from notifications.models import Notification
from posts.models import Follow, Hashtag, Like, Mention, Post, PostHashtag
from usermessages.models import Message
from users.models import UserProfile


class Command(BaseCommand):
    """Management command to seed the database with comprehensive test data."""

    help = (
        "Seeds the database with comprehensive sample data including all edge "
        "cases"
    )

    def add_arguments(self, parser):
        """Add command line arguments."""
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear all existing data before seeding",
        )

    def handle(self, *args, **options):
        """Main command handler."""
        if options["clear"]:
            self.stdout.write(self.style.WARNING("Clearing existing data..."))
            self._clear_data()

        self.stdout.write(
            self.style.SUCCESS("Starting comprehensive data seeding...")
        )

        # Step 1: Create users with profiles
        users = self._create_users()
        self.stdout.write(f"✓ Created {len(users)} users with profiles")

        # Step 2: Create follow relationships
        follows = self._create_follows(users)
        self.stdout.write(f"✓ Created {len(follows)} follow relationships")

        # Step 3: Create regular posts with hashtags and mentions
        regular_posts = self._create_regular_posts(users)
        self.stdout.write(f"✓ Created {len(regular_posts)} regular posts")

        # Step 4: Create threaded replies (conversations)
        thread_posts = self._create_threaded_replies(users, regular_posts)
        self.stdout.write(f"✓ Created {len(thread_posts)} threaded replies")

        # Step 5: Create retweets (pure retweets)
        retweets = self._create_retweets(users, regular_posts)
        self.stdout.write(f"✓ Created {len(retweets)} retweets")

        # Step 6: Create quote tweets
        quote_tweets = self._create_quote_tweets(users, regular_posts)
        self.stdout.write(f"✓ Created {len(quote_tweets)} quote tweets")

        # Step 7: Create likes
        likes = self._create_likes(users, regular_posts + thread_posts)
        self.stdout.write(f"✓ Created {len(likes)} likes")

        # Step 8: Create bookmarks
        bookmarks = self._create_bookmarks(users, regular_posts + thread_posts)
        self.stdout.write(f"✓ Created {len(bookmarks)} bookmarks")

        # Step 9: Create direct messages
        messages = self._create_messages(users)
        self.stdout.write(f"✓ Created {len(messages)} direct messages")

        # Step 10: Display summary
        self._display_summary()

    def _clear_data(self):
        """Clear all existing data."""
        Like.objects.all().delete()
        Follow.objects.all().delete()
        Bookmark.objects.all().delete()
        Notification.objects.all().delete()
        Message.objects.all().delete()
        PostHashtag.objects.all().delete()
        Mention.objects.all().delete()
        Hashtag.objects.all().delete()
        Post.objects.all().delete()
        UserProfile.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

    def _create_users(self):
        """Create diverse users with rich profiles."""
        users = []
        users_data = [
            {
                "username": "tech_guru",
                "email": "tech@example.com",
                "password": "password123",
                "profile": {
                    "bio": (
                        "Software engineer passionate about AI, web dev, "
                        "and open source. Building the future one commit "
                        "at a time 🚀"
                    ),
                    "location": "San Francisco, CA",
                    "website": "https://techguru.dev",
                },
            },
            {
                "username": "foodie_adventures",
                "email": "foodie@example.com",
                "password": "password123",
                "profile": {
                    "bio": (
                        "Food blogger 🍕 Exploring cuisines worldwide. "
                        "Restaurant reviews & recipes. #FoodieLife"
                    ),
                    "location": "New York, NY",
                    "website": "https://foodieadventures.blog",
                },
            },
            {
                "username": "fitness_coach",
                "email": "fitness@example.com",
                "password": "password123",
                "profile": {
                    "bio": (
                        "Certified personal trainer 💪 Helping you achieve "
                        "your fitness goals. DM for coaching!"
                    ),
                    "location": "Los Angeles, CA",
                    "website": "https://fitcoach.com",
                },
            },
            {
                "username": "travel_nomad",
                "email": "travel@example.com",
                "password": "password123",
                "profile": {
                    "bio": (
                        "Digital nomad 🌍 Visiting 50 countries before 30. "
                        "Travel tips & photography."
                    ),
                    "location": "Currently in Bali",
                    "website": "https://travelnomad.world",
                },
            },
            {
                "username": "book_worm",
                "email": "books@example.com",
                "password": "password123",
                "profile": {
                    "bio": (
                        "Avid reader 📚 Book reviews, recommendations, "
                        "and literary discussions. Currently reading sci-fi."
                    ),
                    "location": "London, UK",
                },
            },
            {
                "username": "music_maven",
                "email": "music@example.com",
                "password": "password123",
                "profile": {
                    "bio": (
                        "Music producer 🎵 Electronic & lo-fi beats. "
                        "Sharing tracks and music theory."
                    ),
                    "location": "Berlin, Germany",
                    "website": "https://soundcloud.com/musicmaven",
                },
            },
            {
                "username": "art_creator",
                "email": "art@example.com",
                "password": "password123",
                "profile": {
                    "bio": (
                        "Digital artist 🎨 Creating NFTs and illustrations. "
                        "Commission work open!"
                    ),
                    "location": "Tokyo, Japan",
                    "website": "https://artstation.com/artcreator",
                },
            },
            {
                "username": "news_reporter",
                "email": "news@example.com",
                "password": "password123",
                "profile": {
                    "bio": (
                        "Journalist 📰 Breaking news, investigative "
                        "reporting. Retweets ≠ endorsements."
                    ),
                    "location": "Washington, DC",
                },
            },
            {
                "username": "crypto_trader",
                "email": "crypto@example.com",
                "password": "password123",
                "profile": {
                    "bio": (
                        "Cryptocurrency analyst 📈 Bitcoin, Ethereum, "
                        "DeFi. Not financial advice!"
                    ),
                    "location": "Singapore",
                    "website": "https://cryptoinsights.io",
                },
            },
            {
                "username": "science_daily",
                "email": "science@example.com",
                "password": "password123",
                "profile": {
                    "bio": (
                        "Science communicator 🔬 Latest research, space "
                        "exploration, and technology."
                    ),
                    "location": "Boston, MA",
                },
            },
        ]

        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data["username"],
                defaults={
                    "email": user_data["email"],
                },
            )
            if created:
                user.set_password(user_data["password"])
                user.save()
            profile_data = user_data.get("profile", {})
            profile, _ = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    "accepted_legal_policies": True,
                    "bio": profile_data.get("bio", ""),
                    "location": profile_data.get("location", ""),
                    "website": profile_data.get("website", ""),
                },
            )
            # If profile already exists, update fields
            if not _:
                profile.accepted_legal_policies = True
                profile.bio = profile_data.get("bio", "")
                profile.location = profile_data.get("location", "")
                profile.website = profile_data.get("website", "")
                profile.save()
            users.append(user)
        return users

    def _create_follows(self, users):
        """Create realistic follow relationships."""
        follows = []

        # Strategy: Create clusters of mutual interests
        tech_cluster = [
            u
            for u in users
            if u.username in ["tech_guru", "crypto_trader", "science_daily"]
        ]
        creative_cluster = [
            u
            for u in users
            if u.username in ["art_creator", "music_maven", "book_worm"]
        ]
        lifestyle_cluster = [
            u
            for u in users
            if u.username
            in ["foodie_adventures", "travel_nomad", "fitness_coach"]
        ]

        clusters = [tech_cluster, creative_cluster, lifestyle_cluster]

        # Within-cluster follows (high density)
        for cluster in clusters:
            for user1 in cluster:
                for user2 in cluster:
                    # 80% follow rate within cluster
                    if user1 != user2 and random.random() > 0.2:
                        if not Follow.objects.filter(
                            follower=user1, following=user2
                        ).exists():
                            follow = Follow.objects.create(
                                follower=user1, following=user2
                            )
                            follows.append(follow)

                            # Create notification
                            Notification.objects.create(
                                user=user2,
                                actor=user1,
                                verb="started following you",
                                target_type="user",
                                target_id=user2.id,
                            )

        # Cross-cluster follows (lower density)
        for user in users:
            others = [u for u in users if u != user]
            num_follows = random.randint(2, 5)
            follows_to_create = random.sample(
                others, min(num_follows, len(others))
            )

            for to_follow in follows_to_create:
                if not Follow.objects.filter(
                    follower=user, following=to_follow
                ).exists():
                    follow = Follow.objects.create(
                        follower=user, following=to_follow
                    )
                    follows.append(follow)

        return follows

    def _create_regular_posts(self, users):
        """Create regular posts with hashtags and mentions."""
        posts = []
        posts_templates = [
            # Tech posts with hashtags
            (
                "Just deployed my new #Python web app using #Django and "
                "#React! Check it out 🚀",
                "tech_guru",
            ),
            (
                "Working on a new #MachineLearning model for image "
                "classification. The results are promising! #AI "
                "#DeepLearning",
                "tech_guru",
            ),
            (
                "Why #TypeScript is a game changer for large-scale "
                "JavaScript projects. Thread 🧵",
                "tech_guru",
            ),
            # Food posts with mentions and hashtags
            (
                "Had the most amazing pasta today! The carbonara was "
                "perfection 🍝 #FoodieLife",
                "foodie_adventures",
            ),
            (
                "Recipe of the day: Homemade sourdough bread! Tag "
                "@book_worm who loves baking 🍞 #BakingFromScratch",
                "foodie_adventures",
            ),
            (
                "Coffee tasting at the new cafe downtown. Best latte "
                "I've had! ☕ #CoffeeLover",
                "foodie_adventures",
            ),
            # Fitness posts with hashtags
            (
                "Morning workout complete! 5K run + strength training 💪 "
                "#FitnessMotivation #HealthyLifestyle",
                "fitness_coach",
            ),
            (
                "New blog post: Top 10 exercises for building core "
                "strength. Link in bio! #Fitness #Workout",
                "fitness_coach",
            ),
            (
                "Remember: consistency > intensity. Small daily "
                "improvements lead to big results! #FitnessJourney",
                "fitness_coach",
            ),
            # Travel posts with hashtags and mentions
            (
                "Sunset at Uluwatu Temple, Bali 🌅 Simply breathtaking! "
                "@travel_nomad #TravelPhotography #Bali",
                "travel_nomad",
            ),
            (
                "Pro tip: Visit temples early morning to avoid crowds "
                "and catch the sunrise! #TravelTips",
                "travel_nomad",
            ),
            (
                "Next destination: Japan 🇯🇵 Can't wait to explore "
                "Tokyo! Any recommendations @art_creator? #TravelPlanning",
                "travel_nomad",
            ),
            # Book posts with hashtags
            (
                "Just finished 'Project Hail Mary' by Andy Weir. What "
                "a ride! 📚 #BookReview #SciFi",
                "book_worm",
            ),
            (
                "Currently reading list: 5 sci-fi novels that will blow "
                "your mind 🤯 #BookRecommendations",
                "book_worm",
            ),
            (
                "Book club meeting tonight! Discussing '1984'. "
                "@news_reporter you should join us! #BookClub",
                "book_worm",
            ),
            # Music posts with hashtags
            (
                "New track out now! 'Midnight Dreams' - lo-fi beats for "
                "studying 🎵 #LoFi #ChillBeats",
                "music_maven",
            ),
            (
                "Working on a new EP. Here's a sneak peek of the first "
                "track 🎧 #MusicProduction",
                "music_maven",
            ),
            (
                "The theory behind chord progressions in electronic "
                "music. Thread 🧵 #MusicTheory",
                "music_maven",
            ),
            # Art posts with hashtags
            (
                "Latest digital painting: 'Cyberpunk Cityscape' 🎨 "
                "#DigitalArt #NFT",
                "art_creator",
            ),
            (
                "Commission work is now open! DM for details and pricing "
                "💼 #ArtCommissions",
                "art_creator",
            ),
            (
                "Tutorial: How to create realistic lighting in digital "
                "paintings #ArtTutorial",
                "art_creator",
            ),
            # News posts with hashtags
            (
                "Breaking: New climate report shows significant changes. "
                "Full coverage at 6PM 📰 #ClimateChange #News",
                "news_reporter",
            ),
            (
                "Investigative piece on tech industry practices published "
                "today. Thread 🧵 #Journalism",
                "news_reporter",
            ),
            (
                "Important update on the ongoing situation. Stay tuned "
                "for developments. #BreakingNews",
                "news_reporter",
            ),
            # Crypto posts with hashtags
            (
                "Bitcoin breaks $50K! Analysis and market outlook 📈 "
                "#Bitcoin #Crypto",
                "crypto_trader",
            ),
            (
                "Understanding DeFi: A beginner's guide to decentralized "
                "finance #DeFi #Blockchain",
                "crypto_trader",
            ),
            (
                "Warning: Watch out for these common crypto scams. Stay "
                "safe! ⚠️ #CryptoSafety",
                "crypto_trader",
            ),
            # Science posts with hashtags
            (
                "New exoplanet discovered in habitable zone! 🪐 "
                "#SpaceExploration #Astronomy",
                "science_daily",
            ),
            (
                "Study shows promising results in cancer treatment "
                "research 🔬 #MedicalResearch",
                "science_daily",
            ),
            (
                "The James Webb telescope captures stunning new images "
                "🌌 #JWST #Space",
                "science_daily",
            ),
        ]

        for content, username in posts_templates:
            try:
                user = next(u for u in users if u.username == username)
                post = Post.objects.create(user=user, content=content)
                posts.append(post)

                # Extract and create hashtags
                self._process_hashtags(post, content)

                # Extract and create mentions
                self._process_mentions(post, content, users)

            except (StopIteration, User.DoesNotExist):
                continue

        return posts

    def _process_hashtags(self, post, content):
        """Extract hashtags from content and create relationships."""
        hashtag_pattern = r"#(\w+)"
        hashtags = re.findall(hashtag_pattern, content)

        for tag_text in hashtags:
            hashtag, created = Hashtag.objects.get_or_create(
                tag=tag_text.lower()
            )

            if not created:
                hashtag.use_count += 1
                hashtag.last_used_at = timezone.now()
                hashtag.save()

            PostHashtag.objects.get_or_create(post=post, hashtag=hashtag)

    def _process_mentions(self, post, content, users):
        """Extract mentions from content and create relationships."""
        mention_pattern = r"@(\w+)"
        mentions = re.findall(mention_pattern, content)

        for username in mentions:
            try:
                mentioned_user = next(
                    u for u in users if u.username == username
                )
                Mention.objects.get_or_create(
                    post=post,
                    mentioned_user=mentioned_user,
                    mentioner_user=post.user,
                )

                # Create notification for mention
                Notification.objects.create(
                    user=mentioned_user,
                    actor=post.user,
                    verb="mentioned you in a post",
                    target_type="post",
                    target_id=post.id,
                )
            except StopIteration:
                continue

    def _create_threaded_replies(self, users, parent_posts):
        """Create threaded conversations with nested replies."""
        thread_posts = []

        # Select some posts to have threads
        posts_with_threads = random.sample(
            parent_posts, min(10, len(parent_posts))
        )

        for root_post in posts_with_threads:
            # Create 2-4 direct replies to root post
            num_replies = random.randint(2, 4)
            first_level_replies = []

            for _ in range(num_replies):
                reply_user = random.choice(
                    [u for u in users if u != root_post.user]
                )
                reply_content = random.choice(
                    [
                        "Great post! I totally agree with your perspective.",
                        "Interesting take. I have a slightly different view.",
                        "Thanks for sharing this! Very informative.",
                        "This is exactly what I needed to read today.",
                        "Could you elaborate more on this point?",
                    ]
                )

                reply = Post.objects.create(
                    user=reply_user,
                    content=reply_content,
                    parent_post=root_post,
                    root_post=root_post,
                    created_at=root_post.created_at
                    + timedelta(hours=random.randint(1, 12)),
                )
                first_level_replies.append(reply)
                thread_posts.append(reply)

                # Create notification
                Notification.objects.create(
                    user=root_post.user,
                    actor=reply_user,
                    verb="replied to your post",
                    target_type="post",
                    target_id=root_post.id,
                )

            # Create nested replies (replies to replies)
            for first_reply in first_level_replies:
                if random.random() > 0.5:  # 50% chance of nested reply
                    nested_reply_user = random.choice(
                        [u for u in users if u != first_reply.user]
                    )
                    nested_content = random.choice(
                        [
                            "I second this!",
                            "Building on your point...",
                            "Great addition to the discussion!",
                            "This makes a lot of sense.",
                        ]
                    )

                    nested_reply = Post.objects.create(
                        user=nested_reply_user,
                        content=nested_content,
                        parent_post=first_reply,
                        root_post=root_post,
                        created_at=first_reply.created_at
                        + timedelta(hours=random.randint(1, 6)),
                    )
                    thread_posts.append(nested_reply)

                    # Create notification
                    Notification.objects.create(
                        user=first_reply.user,
                        actor=nested_reply_user,
                        verb="replied to your comment",
                        target_type="post",
                        target_id=first_reply.id,
                    )

        return thread_posts

    def _create_retweets(self, users, posts):
        """Create pure retweets (no content)."""
        retweets = []

        # Select popular posts to retweet
        posts_to_retweet = random.sample(posts, min(15, len(posts)))

        for original_post in posts_to_retweet:
            # 2-5 users will retweet each popular post
            num_retweets = random.randint(2, 5)
            retweeters = random.sample(
                [u for u in users if u != original_post.user],
                min(num_retweets, len(users) - 1),
            )
            for retweeter in retweeters:
                # Check if already retweeted
                if not Post.objects.filter(
                    user=retweeter,
                    retweet_of=original_post,
                    is_quote_tweet=False,
                ).exists():
                    retweet = Post.objects.create(
                        user=retweeter,
                        content="",
                        retweet_of=original_post,
                        is_quote_tweet=False,
                        created_at=original_post.created_at
                        + timedelta(hours=random.randint(1, 48)),
                    )
                    retweets.append(retweet)

                    # Create notification
                    Notification.objects.create(
                        user=original_post.user,
                        actor=retweeter,
                        verb="retweeted your post",
                        target_type="post",
                        target_id=original_post.id,
                    )

        return retweets

    def _create_quote_tweets(self, users, posts):
        """Create quote tweets (retweet with commentary)."""
        quote_tweets = []

        quote_templates = [
            "This is so true! 💯",
            "Adding to this great point...",
            "Hot take: I disagree with this perspective.",
            "Everyone needs to see this! 👀",
            "This changed my perspective completely.",
            "Couldn't have said it better myself!",
            "Important thread everyone should read. 🧵",
            "This deserves more attention!",
        ]

        posts_to_quote = random.sample(posts, min(12, len(posts)))

        for original_post in posts_to_quote:
            # 1-3 users will quote tweet
            num_quotes = random.randint(1, 3)
            quoters = random.sample(
                [u for u in users if u != original_post.user],
                min(num_quotes, len(users) - 1),
            )

            for quoter in quoters:
                quote_content = random.choice(quote_templates)

                quote_tweet = Post.objects.create(
                    user=quoter,
                    content=quote_content,
                    retweet_of=original_post,
                    is_quote_tweet=True,
                    created_at=original_post.created_at
                    + timedelta(hours=random.randint(1, 72)),
                )
                quote_tweets.append(quote_tweet)

                # Process hashtags and mentions in quote content
                self._process_hashtags(quote_tweet, quote_content)
                self._process_mentions(quote_tweet, quote_content, users)

                # Create notification
                Notification.objects.create(
                    user=original_post.user,
                    actor=quoter,
                    verb="quoted your post",
                    target_type="post",
                    target_id=original_post.id,
                )

        return quote_tweets

    def _create_likes(self, users, posts):
        """Create likes with realistic patterns."""
        likes = []

        for post in posts:
            # Popular posts get more likes
            base_likes = random.randint(2, 8)
            num_likes = (
                base_likes if random.random() > 0.3 else random.randint(8, 15)
            )

            potential_likers = [u for u in users if u != post.user]
            likers = random.sample(
                potential_likers, min(num_likes, len(potential_likers))
            )

            for liker in likers:
                like, created = Like.objects.get_or_create(
                    user=liker, post=post
                )
                if created:
                    likes.append(like)

                    # Create notification (only for original posts)
                    if not post.parent_post:
                        Notification.objects.create(
                            user=post.user,
                            actor=liker,
                            verb="liked your post",
                            target_type="post",
                            target_id=post.id,
                        )

        return likes

    def _create_bookmarks(self, users, posts):
        """Create bookmarks."""
        bookmarks = []

        for user in users:
            # Each user bookmarks 3-7 posts
            num_bookmarks = random.randint(3, 7)
            posts_to_bookmark = random.sample(
                posts, min(num_bookmarks, len(posts))
            )

            for post in posts_to_bookmark:
                bookmark, created = Bookmark.objects.get_or_create(
                    user=user, post=post
                )
                if created:
                    bookmarks.append(bookmark)

        return bookmarks

    def _create_messages(self, users):
        """Create direct messages between users."""
        messages = []

        message_templates = [
            "Hey! Thanks for the follow!",
            "I loved your recent post about Python!",
            "Would you be interested in collaborating?",
            "Great content! Keep it up!",
            "I have a question about your latest article...",
            "Thanks for the recommendation!",
            "Your work is really inspiring!",
            "Let's connect sometime!",
        ]

        # Create conversations between users
        for _ in range(20):
            sender, receiver = random.sample(users, 2)
            content = random.choice(message_templates)

            message = Message.objects.create(
                sender=sender,
                receiver=receiver,
                content=content,
                is_read=random.choice([True, False]),
                created_at=timezone.now()
                - timedelta(days=random.randint(1, 30)),
            )
            messages.append(message)

        return messages

    def _display_summary(self):
        """Display comprehensive summary of seeded data."""
        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(
            self.style.SUCCESS("✨ DATABASE SEEDED SUCCESSFULLY!")
        )
        self.stdout.write("=" * 70)
        self.stdout.write("\n📊 Summary:\n")

        summary_data = [
            ("Users", User.objects.filter(is_superuser=False).count()),
            ("User Profiles", UserProfile.objects.count()),
            (
                "Regular Posts",
                Post.objects.filter(
                    parent_post__isnull=True, retweet_of__isnull=True
                ).count(),
            ),
            (
                "Reply Posts",
                Post.objects.filter(parent_post__isnull=False).count(),
            ),
            (
                "Retweets",
                Post.objects.filter(
                    retweet_of__isnull=False, is_quote_tweet=False
                ).count(),
            ),
            ("Quote Tweets", Post.objects.filter(is_quote_tweet=True).count()),
            ("Total Posts", Post.objects.count()),
            ("Hashtags", Hashtag.objects.count()),
            ("Post-Hashtag Links", PostHashtag.objects.count()),
            ("Mentions", Mention.objects.count()),
            ("Follows", Follow.objects.count()),
            ("Likes", Like.objects.count()),
            ("Bookmarks", Bookmark.objects.count()),
            ("Messages", Message.objects.count()),
            ("Notifications", Notification.objects.count()),
        ]

        for label, count in summary_data:
            self.stdout.write(f"  {label:<20}: {count:>5}")

        # Display trending hashtags
        self.stdout.write("\n🔥 Top Trending Hashtags:\n")
        top_hashtags = Hashtag.objects.order_by("-use_count")[:10]
        for hashtag in top_hashtags:
            self.stdout.write(
                f"  #{hashtag.tag:<20} ({hashtag.use_count} uses)"
            )

        # Display most active users
        self.stdout.write("\n👥 Most Active Users:\n")
        for user in User.objects.filter(is_superuser=False)[:5]:
            post_count = Post.objects.filter(user=user).count()
            self.stdout.write(f"  @{user.username:<20} ({post_count} posts)")

        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(
            self.style.SUCCESS("🎉 All test data created successfully!")
        )
        self.stdout.write("=" * 70)
        self.stdout.write("\n💡 Test credentials:")
        self.stdout.write("  Username: tech_guru (or any user from the list)")
        self.stdout.write("  Password: password123\n")
