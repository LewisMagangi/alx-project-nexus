# Backend Deployment Setup - Render vs PythonAnywhere

## 🎯 Quick Comparison

| Feature | Render | PythonAnywhere |
|---------|--------|----------------|
| **Price (MVP)** | Free tier available | $5/month (Hacker plan) |
| **Setup** | Easier (Git-based) | Manual configuration |
| **Auto Deploy** | ✅ Git push → auto deploy | ❌ Manual or script |
| **PostgreSQL** | ✅ Free tier included | ❌ MySQL only on free |
| **Performance** | Better | Good enough |
| **Sleep** | Yes (free tier) | No |
| **Recommendation** | **MVP Choice** ✅ | Beginner-friendly |

---

## 🚀 Option A: Render (RECOMMENDED)

### Why Render for MVP?

- Git-based deployment (push = deploy)
- Free PostgreSQL database
- HTTPS included
- Simple webhook for CI/CD
- Better for production scaling

### Setup Steps

#### 1. Create Render Account

``` BASH
https://render.com → Sign up with GitHub
```

#### 2. Create Web Service

```yaml
Name: twitter-mvp-api
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
```

#### 3. Add Environment Variables

```bash
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-app.onrender.com
DATABASE_URL=postgres://...  # Auto-provided by Render
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

#### 4. Create PostgreSQL Database

``` BASH
Render Dashboard → New → PostgreSQL
→ Copy DATABASE_URL to Web Service env vars
```

#### 5. Get Deploy Hook

``` BASH
Render Dashboard → Your Service → Settings
→ Deploy Hook → Copy URL
```

#### 6. Add to GitHub Secrets

```bash
# Go to: GitHub Repo → Settings → Secrets → Actions
RENDER_DEPLOY_HOOK_URL=https://api.render.com/deploy/srv-xxxxx?key=xxxxx
```

#### 7. Add render.yaml (Optional)

```yaml
# render.yaml in repo root
services:
  - type: web
    name: twitter-mvp-api
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: cd backend && gunicorn backend.wsgi:application
    envVars:
      - key: PYTHON_VERSION
        value: 3.12.0
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: false
```

### Requirements.txt Updates

```txt
# Add to backend/requirements.txt
gunicorn==21.2.0
psycopg2-binary==2.9.9  # For PostgreSQL
dj-database-url==2.1.0  # For DATABASE_URL parsing
whitenoise==6.6.0       # For static files
```

### Settings.py Updates

```python
# backend/backend/settings.py
import dj_database_url

# Database
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600
    )
}

# Static files
STATIC_ROOT = BASE_DIR / 'staticfiles'
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
    # ... rest
]
```

---

## 🔧 Option B: PythonAnywhere

### Why PythonAnywhere?

- Simpler for Django beginners
- Always-on (no sleep on paid plans)
- Built-in MySQL database
- Web-based console
- Good for learning

### Procedures

#### 1. Create Account

``` BASH
https://www.pythonanywhere.com → Sign up
Choose: Hacker Plan ($5/month for custom domains)
```

#### 2. Upload Code

```bash
# In PythonAnywhere Bash console
git clone https://github.com/your-username/alx-project-nexus.git
cd alx-project-nexus/backend
```

#### 3. Create Virtual Environment

```bash
mkvirtualenv --python=/usr/bin/python3.12 myenv
pip install -r requirements.txt
```

#### 4. Configure Web App

``` TEXT
Web tab → Add new web app
→ Manual configuration → Python 3.12
→ Virtualenv: /home/yourusername/.virtualenvs/myenv
```

#### 5. WSGI Configuration

```python
# /var/www/yourusername_pythonanywhere_com_wsgi.py
import os
import sys

path = '/home/yourusername/alx-project-nexus/backend'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

#### 6. Static Files

```bash
# In PythonAnywhere console
cd ~/alx-project-nexus/backend
python manage.py collectstatic --noinput
```

``` TEXT
# Web tab → Static files
URL: /static/
Directory: /home/yourusername/alx-project-nexus/backend/staticfiles
```

#### 7. Database Setup

```bash
# Create MySQL database in Databases tab
# Update settings.py:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'yourusername$twitter_mvp',
        'USER': 'yourusername',
        'PASSWORD': 'your-db-password',
        'HOST': 'yourusername.mysql.pythonanywhere-services.com',
    }
}
```

#### 8. GitHub Secrets for CI/CD

```bash
PA_USERNAME=your-pythonanywhere-username
PA_API_TOKEN=your-api-token  # From Account → API Token
```

### Auto-Deploy Script (Optional)

```bash
# ~/deploy.sh on PythonAnywhere
#!/bin/bash
cd ~/alx-project-nexus
git pull origin main
source ~/.virtualenvs/myenv/bin/activate
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
touch /var/www/yourusername_pythonanywhere_com_wsgi.py
```

---

## 🔐 GitHub Secrets Summary

### For Render

``` TEXT
RENDER_DEPLOY_HOOK_URL
```

### For PythonAnywhere

``` TEXT
PA_USERNAME
PA_API_TOKEN
```

### For Both (Vercel)

``` TEXT
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

---

## 🎯 MVP Recommendation

**Use Render** because:

1. ✅ Free tier (no credit card for testing)
2. ✅ Automatic deploys from GitHub
3. ✅ PostgreSQL included
4. ✅ Easy CI/CD integration
5. ✅ Better production scalability

**When to use PythonAnywhere:**

- You're learning Django and want simplicity
- You prefer MySQL over PostgreSQL
- You want always-on free hosting (with limitations)
- You don't need auto-deployments

---

## 📋 Deployment Checklist

```bash
# Backend deployed? ✅
curl https://your-backend.onrender.com/api/health

# Frontend deployed? ✅
curl https://your-frontend.vercel.app

# CORS configured? ✅
# Check backend allows frontend origin

# Database migrated? ✅
# Check Render logs or run: python manage.py showmigrations

# Static files served? ✅
# Check: https://your-backend.onrender.com/static/admin/css/base.css

# Environment variables set? ✅
# SECRET_KEY, DEBUG, ALLOWED_HOSTS, DATABASE_URL, CORS_ALLOWED_ORIGINS

# CI/CD working? ✅
# Push to main → Check GitHub Actions → Verify deployments
```

---

## 🆘 Troubleshooting

### Render Issues

```bash
# Check logs
Render Dashboard → Your Service → Logs

# Common issues:
- Build fails: Check requirements.txt
- 502 error: Check Start Command
- Database error: Check DATABASE_URL env var
```

### PythonAnywhere Issues

```bash
# Check error logs
Web tab → Log files → Error log

# Reload web app
Web tab → Reload button

# Common issues:
- Import error: Check WSGI file path
- Static files 404: Check collectstatic
- Database error: Check MySQL credentials
```
