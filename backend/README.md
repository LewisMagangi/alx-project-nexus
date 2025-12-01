# Project Nexus Backend

Django REST Framework backend for the Project Nexus social media platform.

## 🔗 Live Demo

- **Backend API**: [Backend API](https://alx-project-nexus-nvh6.onrender.com/)
- **API Documentation**: [API Documentation](https://alx-project-nexus-nvh6.onrender.com/api/schema/swagger-ui/)

## 🛠️ Tech Stack

- **Framework**: Django 5.2.5 + Django REST Framework
- **Authentication**: JWT (Simple JWT)
- **Database**: PostgreSQL (Neon)
- **Deployment**: Render
- **Static Files**: Whitenoise

## 📁 Project Structure

```bash
backend/
├── backend/           # Main Django project settings
├── authentication/    # JWT auth, login, register
├── users/             # User profiles
├── posts/             # Posts/tweets
├── likes/             # Post likes
├── follows/           # User follows
├── bookmarks/         # Saved posts
├── notifications/     # User notifications
├── usermessages/      # Direct messages
├── communities/       # Community groups
├── search/            # Search functionality
├── account/           # Account management
├── templates/         # Django HTML templates
├── static/            # Static files (CSS, JS)
└── docs/              # API & database documentation
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- pip
- PostgreSQL (or use Neon cloud database)

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
   # Edit .env with your configuration
   ```

5. **Run migrations**:

   ```bash
   python manage.py migrate
   ```

6. **Create superuser** (optional):

   ```bash
   python manage.py createsuperuser
   ```

7. **Seed test data** (optional):

   ```bash
   python manage.py seed_data
   ```

8. **Run development server**:

   ```bash
   python manage.py runserver
   ```

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | Debug mode | `False` for production |
| `ALLOWED_HOSTS` | Allowed host domains | `.onrender.com,localhost` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@host/db?sslmode=require` |
| `CORS_ALLOWED_ORIGINS` | Frontend URLs for CORS | `https://your-frontend.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | Trusted origins for CSRF | `https://*.vercel.app` |
| `FRONTEND_URL` | Frontend base URL | `https://your-frontend.vercel.app` |

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

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/` | List users |
| GET | `/api/users/{id}/` | Get user profile |

### Follows

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/follows/` | List follows |
| POST | `/api/follows/` | Follow user |
| DELETE | `/api/follows/{id}/` | Unfollow user |

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
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn backend.wsgi:application`
4. **Set environment variables** in Render dashboard
5. **Deploy**

### Render Environment Variables

Set these in your Render dashboard:

``` bash
SECRET_KEY=<generated-secret-key>
DEBUG=False
ALLOWED_HOSTS=.onrender.com
DATABASE_URL=<neon-postgres-url>
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://*.vercel.app,https://*.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
```

## 📝 License

This project is part of the ALX Software Engineering program.
