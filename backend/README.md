# Project Nexus Backend

Django REST Framework backend for the Project Nexus social media platform.

## 🔗 Live Demo

- **Backend API**: [Backend API](https://alx-project-nexus-nvh6.onrender.com/)
- **API Documentation**: [API Documentation](https://alx-project-nexus-nvh6.onrender.com/api/schema/swagger-ui/)

## 🛠️ Tech Stack

- **Framework**: Django 5.2.8 + Django REST Framework
- **Authentication**: JWT (Simple JWT)
- **Database**: PostgreSQL (Neon) / SQLite (development)
- **Deployment**: Render
- **Static Files**: Whitenoise

## 📁 Project Structure

```bash
backend/
├── backend/           # Main Django project settings
├── authentication/    # JWT auth, login, register
├── users/             # User profiles (bio, avatar, location, etc.)
├── posts/             # Posts/tweets with hashtags & mentions
├── likes/             # Post likes
├── follows/           # User follows
├── bookmarks/         # Saved posts
├── notifications/     # User notifications
├── usermessages/      # Direct messages
├── communities/       # Community groups
├── search/            # Search functionality
├── account/           # Account management
├── legal/             # Terms, privacy, cookies policies
├── hashtags/          # Hashtag tracking & trending
├── blocks/            # User blocking
├── reports/           # Content reporting
├── templates/         # Django HTML templates
├── static/            # Static files (CSS, JS)
└── docs/              # API & database documentation
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- pip
- PostgreSQL (optional - SQLite works for development)

### Local Development Setup

1. **Clone and navigate to backend**:

   ```bash
   git clone https://github.com/LewisMagangi/alx-project-nexus.git
   cd alx-project-nexus/backend
   ```

2. **Create virtual environment**:

   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env - most settings are optional for development
   # The defaults work out of the box!
   ```

5. **Run migrations**:

   ```bash
   python manage.py migrate
   ```

6. **Create superuser** (optional):

   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**:

   ```bash
   python manage.py runserver
   ```

   That's it! The server runs with sensible defaults (SQLite, DEBUG=True, localhost).

## 🔐 Environment Variables

The app uses `DJANGO_ENV` to detect the environment and apply appropriate defaults.

### Development (default)

Most settings are **optional** - the app works out of the box:

| Variable | Required | Default |
|----------|----------|---------|
| `DJANGO_ENV` | No | `development` |
| `SECRET_KEY` | No | Auto-generated dev key |
| `DEBUG` | No | `True` |
| `DATABASE_URL` | No | SQLite (`db.sqlite3`) |
| `ALLOWED_HOSTS` | No | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:3000` |

### Production (DJANGO_ENV=production)

These settings are **required** and will raise errors if missing:

| Variable | Required | Description |
|----------|----------|-------------|
| `DJANGO_ENV` | ✅ | Must be `production` |
| `SECRET_KEY` | ✅ | Generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `ALLOWED_HOSTS` | ✅ | Your domain(s), e.g., `your-app.onrender.com` |
| `DEBUG` | No | Defaults to `False` in production |
| `CORS_ALLOWED_ORIGINS` | No | Frontend URL(s) |
| `CSRF_TRUSTED_ORIGINS` | No | Has sensible defaults |

See `.env.example` for full list with descriptions.

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login (returns JWT) |
| POST | `/api/auth/jwt/create/` | Get JWT token pair |
| POST | `/api/auth/jwt/refresh/` | Refresh access token |

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/` | List all posts |
| POST | `/api/posts/` | Create new post |
| GET | `/api/posts/{id}/` | Get specific post |
| PATCH | `/api/posts/{id}/` | Update post |
| DELETE | `/api/posts/{id}/` | Delete post |
| GET | `/api/posts/home/` | Get home feed |
| POST | `/api/posts/{id}/retweet/` | Retweet a post |
| GET | `/api/posts/{id}/thread/` | Get post thread |
| GET | `/api/posts/trending_hashtags/` | Get trending hashtags |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/` | List users |
| GET | `/api/users/{username}/` | Get user profile by username |

### Follows

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/follows/` | List follows |
| POST | `/api/follows/` | Follow user (`{"following": user_id}`) |
| DELETE | `/api/follows/{id}/` | Unfollow user |
| GET | `/api/follows/followers/` | Get your followers |
| GET | `/api/follows/following/` | Get who you follow |

### Likes & Bookmarks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/likes/` | Like a post |
| DELETE | `/api/likes/{id}/` | Unlike |
| POST | `/api/bookmarks/` | Bookmark post |
| DELETE | `/api/bookmarks/{id}/` | Remove bookmark |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search/?q=query` | Search posts & users |

Full API documentation available at `/api/schema/swagger-ui/`

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_posts.py
```

## 🚀 Deployment (Render)

1. **Create new Web Service** on Render
2. **Connect GitHub repository**
3. **Configure**:
   - Build Command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - Start Command: `gunicorn backend.wsgi:application`
4. **Set environment variables** in Render dashboard
5. **Deploy**

### Render Environment Variables

Set these in your Render dashboard:

```bash
DJANGO_ENV=production
SECRET_KEY=<generated-secret-key>
DATABASE_URL=<neon-postgres-url>
ALLOWED_HOSTS=your-app.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://*.vercel.app,https://*.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
```

## 📝 License

This project is part of the ALX Software Engineering program.
