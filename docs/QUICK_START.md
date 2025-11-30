# Twitter MVP - Quick Start Commands

## 🚀 One-Time Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
```

### Frontend

```bash
cd frontend
npm install
```

## 🏃 Daily Development

### Start Both Servers

**Terminal 1 - Backend:**

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver
```

→ Backend runs on `http://localhost:8000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

→ Frontend runs on `http://localhost:3000`

## 🧪 Running Tests

### Backend Tests (Pytest)

```bash
cd backend
pytest                           # Run all tests
pytest -v                        # Verbose output
pytest tests/test_posts.py       # Specific file
pytest --cov                     # With coverage
pytest -k "test_login"           # Run tests matching pattern
```

### Frontend Tests (Jest + MSW)

```bash
cd frontend
npm test                         # Run all tests
npm run test:watch              # Watch mode
npm run test:coverage           # With coverage
npm test -- --testPathPattern=api  # Specific pattern
```

## 📊 Key URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js app |
| Backend API | http://localhost:8000/api/ | REST API |
| Swagger Docs | http://localhost:8000/api/swagger/ | Interactive API docs |
| Django Admin | http://localhost:8000/admin/ | Admin interface |

## 🔑 Test Credentials

Create a test user via Django admin or use:

```bash
python manage.py createsuperuser
```

## 📝 Common Tasks

### Create Migration

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Add New Frontend Component

```bash
cd frontend
npx shadcn@latest add [component-name]
```

### Format Code

```bash
# Backend
cd backend
black . --line-length=79
isort . --profile black

# Frontend
cd frontend
npm run lint
```

### Check Test Coverage

```bash
# Backend
pytest --cov --cov-report=html
open htmlcov/index.html

# Frontend
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Backend (8000)
lsof -ti:8000 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

### Clear Caches

```bash
# Backend
rm -rf __pycache__ */__pycache__
find . -type d -name '__pycache__' -exec rm -r {} +

# Frontend
rm -rf .next node_modules
npm install
```

### Reset Database

```bash
cd backend
python manage.py flush
python manage.py migrate
python manage.py createsuperuser
```

## 🎯 Feature Checklist

### Implemented ✅

- [x] User authentication (register/login/logout)
- [x] Create, read, update, delete posts
- [x] Like/unlike posts
- [x] Follow/unfollow users
- [x] Bookmark posts
- [x] Notifications
- [x] User profiles
- [x] Home feed
- [x] Search functionality
- [x] Communities (basic)
- [x] Direct messages (basic)
- [x] Comprehensive tests (Backend + Frontend)
- [x] CI/CD pipelines

### Coming Soon 🚧

- [ ] Real-time notifications (WebSockets)
- [ ] Image uploads
- [ ] Hashtag trending
- [ ] Advanced search filters
- [ ] User blocking
- [ ] Email verification

## 📚 API Examples

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'
```

### Create Post (with token)

```bash
curl -X POST http://localhost:8000/api/posts/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"content": "Hello World!"}'
```

### Get Posts

```bash
curl http://localhost:8000/api/posts/
```

## 🔄 Git Workflow

```bash
# Start feature
git checkout -b feat/your-feature

# Commit changes
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push origin feat/your-feature
```

## 📦 Build for Production

### backend

```bash
cd backend
pip install gunicorn
gunicorn backend.wsgi:application
```

### frontend

```bash
cd frontend
npm run build
npm start
```

## 💡 Pro Tips

1. **Use Python virtual environment** - Always activate venv before backend work
2. **Check API docs first** - Swagger UI has all endpoint details
3. **MSW handles API mocking** - No need for real backend in frontend tests
4. **Pre-commit hooks** - Auto-formats code on commit
5. **Type safety** - TypeScript catches errors before runtime

## 🆘 Get Help

- Check `SETUP_GUIDE.md` for detailed instructions
- Review test files for API usage examples
- Check `backend/docs/` for additional documentation
- Review Swagger UI for API specifications
