# Project Nexus Production Deployment Guide

---

## 🚀 Backend Deployment (Render + Neon)

### 1. Create a Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech) and sign up/log in
2. Create a new project (e.g., `nexus-prod-db`)
3. Note the connection string (starts with `postgres://`). **Do not wrap the DATABASE_URL in single or double quotes when setting it in your environment variables.**
4. Set password and region as needed

### 2. Deploy Django Backend on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +" → "Web Service"**
3. Connect your GitHub and select your Project Nexus repo
4. Set up:
   - **Name**: `nexus-backend-prod`
   - **Branch**: `prod` (or your production branch)
   - **Root Directory**: `backend` (or wherever your manage.py is)
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py seed_data && python manage.py collectstatic --noinput`
   - **Start Command**: `gunicorn backend.wsgi`
   - **Instance Type**: Free or paid as needed

### 3. Add Environment Variables (Render)

Go to your Render service **Environment** tab and add:

```bash
# Django
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=.onrender.com,vercel.app,your-custom-domain.com

# Database (from Neon)
DATABASE_URL=postgres://<user>:<password>@<host>/<db>?sslmode=require

# CORS (wildcards not supported, list your main Vercel domain(s))
CORS_ALLOWED_ORIGINS=https://alx-project-nexus-social.vercel.app/,http://localhost:3000

# CSRF (wildcards supported, allow all .vercel.app for previews and production)
CSRF_TRUSTED_ORIGINS=https://*.vercel.app,https://*.onrender.com

# Frontend URL
FRONTEND_URL=https://your-frontend.vercel.app

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@nexus.com
```

**Tips:**

- Generate a new `SECRET_KEY` for production
- Use the Neon connection string for `DATABASE_URL` (with `sslmode=require`)
- Update CORS and ALLOWED_HOSTS after frontend deploy
- For Vercel preview/production support, use your main Vercel domain in `CORS_ALLOWED_ORIGINS` and `https://*.vercel.app` in `CSRF_TRUSTED_ORIGINS`.

### 4. Deploy and Monitor

- Click **Create Web Service**
- Watch build logs for errors
- After deploy, note your Render backend URL (e.g., `https://nexus-backend-prod.onrender.com`)

### 5. Create Superuser

- In Render dashboard, open the Shell and run:

  ```bash
  python manage.py createsuperuser
  ```

### 6. Generate a Secret Key

To generate a secure `SECRET_KEY` for your Django application, use the [Djecrety](https://djecrety.ir/) tool:

1. Visit [https://djecrety.ir/](https://djecrety.ir/).
2. Copy the generated key.
3. Add it to your Render environment variables under `SECRET_KEY`.

---

## 🎨 Frontend Deployment (Vercel)

### 1. Deploy Next.js Frontend

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import your Project Nexus repo from GitHub
4. Set:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2. Set Environment Variables (Vercel)

Go to **Settings → Environment Variables** and add:

```bash
NEXT_PUBLIC_API_URL=https://nexus-backend-prod.onrender.com
NODE_ENV=production
```

- Use your actual Render backend URL
- Do not include `/api` at the end

### 3. Deploy

- Click **Deploy**
- After deploy, note your Vercel frontend URL (e.g., `https://nexus-frontend.vercel.app`)

---

## 🔄 Final Backend CORS & Hosts Update

1. Go back to Render → Web Service → Environment
2. Update:
   - `CORS_ALLOWED_ORIGINS=https://nexus-frontend.vercel.app`
   - `CSRF_TRUSTED_ORIGINS=https://*.vercel.app,https://*.onrender.com`
   - `FRONTEND_URL=https://nexus-frontend.vercel.app`
   - `ALLOWED_HOSTS=.onrender.com,nexus-frontend.vercel.app`
3. Save and redeploy

---

## Environment Variable Best Practices

**Important:**

- Never wrap environment variable values in single ('') or double ("") quotes. For example, use:

  `DATABASE_URL=postgresql://user:password@host/db?sslmode=require`

  **Not:**

  `'postgresql://user:password@host/db?sslmode=require'` or `"postgresql://user:password@host/db?sslmode=require"`

- CORS origins must not have trailing slashes or paths. For example, use:

  `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`

  **Not:**

  `https://your-frontend.vercel.app/` or `https://your-frontend.vercel.app/somepath`

- Always provide a `.env.example` file (tracked in git) with all required environment variables and fake/sample values. Never commit real `.env` or `.env.production` files to git.

---

## ✅ Test Production

- Visit your Vercel URL and test registration, login, and main flows
- Check browser DevTools for API calls and CORS
- Visit backend admin: `https://nexus-backend-prod.onrender.com/admin`

---

## 🛡 Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Unique `SECRET_KEY`
- [ ] All secrets in environment variables
- [ ] CORS and ALLOWED_HOSTS set to production domains
- [ ] HTTPS enforced (default on Vercel/Render)
- [ ] Database backups enabled (Neon paid plans)

---

## 💡 Tips

- Both Vercel and Render auto-deploy on push to `prod` branch
- Use preview deployments for PRs
- Monitor logs and analytics in both dashboards

---

## 🎉 Success

Your Project Nexus app is now live!

- **Frontend**: `https://nexus-frontend.vercel.app`
- **Backend**: `https://nexus-backend-prod.onrender.com`
- **Admin**: `https://nexus-backend-prod.onrender.com/admin`

---

For help, check Render, Vercel, and Neon docs, or ask your team!
