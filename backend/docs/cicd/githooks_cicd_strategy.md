# Git Hooks & CI/CD Strategy - Twitter MVP

## 🎯 Philosophy: Speed First, Quality Always

**Goal**: Keep commits fast, push thorough, CI comprehensive

---

## ⚡ PRE-COMMIT (Fast: ~3-5 seconds)

**Purpose**: Auto-fix formatting issues, catch obvious mistakes

### What Runs

✅ **trailing-whitespace** - Remove trailing spaces
✅ **end-of-file-fixer** - Add newline at EOF
✅ **check-yaml** - Validate YAML syntax
✅ **check-added-large-files** - Block files >1MB
✅ **black** - Auto-format Python code
✅ **isort** - Sort Python imports

### Why These?

- **All auto-fix** - No manual intervention needed
- **Fast** - Run in seconds
- **Non-blocking** - Devs can iterate quickly

### What's NOT Checked

❌ Linting errors (flake8, pylint)
❌ Tests
❌ Type checking

---

## 🔍 PRE-PUSH (Thorough: ~30-60 seconds)

**Purpose**: Catch bugs before they hit remote

### What's Checked

✅ **flake8** - Python linting (E501, F401, etc.)
✅ **pytest** - Backend API tests
✅ **npm test** - Frontend component tests

### Why Pre-Push?

- **Devs commit often** - Multiple commits before push
- **Tests take time** - Don't slow down local dev flow
- **Catch issues early** - Before PR/CI

### What isn't Checked

❌ Build verification
❌ Integration tests
❌ Deployment

---

## 🚀 CI/CD (Comprehensive: ~3-5 minutes)

**Purpose**: Final gatekeeper before merge/deploy

### Backend Job

```yaml
1. Setup Python 3.12
2. Install dependencies (cached)
3. Run flake8 (all files)
4. Run pytest (all tests)
```

### Frontend Job

```yaml
1. Setup Node.js 20
2. Install dependencies (cached)
3. Run tests
4. Build check (ensure no build errors)
```

### Deploy Job (main branch only)

```yaml
1. Deploy frontend to Vercel
2. Backend remains on existing infrastructure
```

### Why CI Runs Everything Again?

- **Different environment** - Catches platform-specific issues
- **Clean slate** - No local cache/state
- **Branch protection** - Enforces quality gate
- **Multiple contributors** - Someone might skip hooks

---

## 📊 Comparison Table

| Check | Pre-Commit | Pre-Push | CI/CD |
|-------|------------|----------|-------|
| **Time** | 3-5s | 30-60s | 3-5m |
| **Formatting** | ✅ Auto-fix | ✅ Verify | ✅ Verify |
| **Linting** | ❌ | ✅ | ✅ |
| **Tests** | ❌ | ✅ Fast only | ✅ All |
| **Build** | ❌ | ❌ | ✅ |
| **Deploy** | ❌ | ❌ | ✅ (main) |
| **Can Skip** | Yes (--no-verify) | Yes (--no-verify) | No |

---

## 🎬 Developer Workflow

### Typical Dev Session

```bash
# 1. Make changes
vim backend/posts/views.py

# 2. Commit (fast formatting only)
git add .
git commit -m "Add like feature"
# → black, isort auto-fix in 3s ✅

# 3. More commits...
git commit -m "Fix typo"
git commit -m "Add tests"

# 4. Push (runs all checks)
git push
# → flake8 + pytest + npm test run ~45s ✅

# 5. CI runs on GitHub
# → Full verification + deploy if main branch
```

---

## 🔧 Setup Instructions

### 1. Install Pre-commit

```bash
pip install pre-commit
pre-commit install
pre-commit install --hook-type pre-push
```

### 2. Setup CI

- Add `.github/workflows/ci.yml` to repo
- Add Vercel secrets to GitHub:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

### 3. Test Locally

```bash
# Test pre-commit
pre-commit run --all-files

# Test pre-push
pre-commit run --hook-stage pre-push --all-files
```

---

## 🚨 When Something Fails

### Pre-commit fails

```bash
# Usually auto-fixed, just re-commit
git add .
git commit -m "Your message"
```

### Pre-push fails

```bash
# Fix the issue
vim problematic_file.py

# Re-run to verify
pre-commit run --hook-stage pre-push --all-files

# Then push
git push
```

### CI fails

- Check GitHub Actions logs
- Run same commands locally
- Fix and push again

---

## 💡 MVP Optimizations

**What We Skipped (Add Later):**

- Type checking (mypy)
- Security scanning (bandit)
- Coverage requirements
- Integration tests
- E2E tests
- Performance tests
- Docker image building
- Backend deployment automation

**Why?**
MVP needs speed. Add these as project matures.

---

## 📝 Quick Reference

```bash
# Skip pre-commit (emergency only)
git commit --no-verify

# Skip pre-push (not recommended)
git push --no-verify

# Run pre-commit manually
pre-commit run --all-files

# Update pre-commit hooks
pre-commit autoupdate

# See what will run
pre-commit run --verbose --all-files
```
