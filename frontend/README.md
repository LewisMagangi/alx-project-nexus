# Project Nexus Frontend

A [Next.js](https://nextjs.org) social media frontend built with TypeScript, TailwindCSS, and Shadcn UI.

## Live Demo

- **Frontend (App):** [https://alx-project-nexus-social.vercel.app/](https://alx-project-nexus-social.vercel.app/)
- **Backend (API):** [https://alx-project-nexus-nvh6.onrender.com/](https://alx-project-nexus-nvh6.onrender.com/)

## Environment Variables

Copy `.env.example` to `.env.local` for development:

```bash
cp .env.example .env.local
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` (dev) or `https://alx-project-nexus-nvh6.onrender.com` (prod) |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Vercel Deployment

When deploying to Vercel, set environment variables in the Vercel dashboard:

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `NEXT_PUBLIC_API_URL`: `https://alx-project-nexus-nvh6.onrender.com`
4. Redeploy your application

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in these variables.

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```text
frontend/
├── app/                    # Next.js App Router pages
│   ├── auth/               # Authentication pages (login, register)
│   ├── settings/           # User settings
│   └── page.tsx            # Home page
├── components/             # Reusable UI components
│   └── ui/                 # Shadcn UI components
├── context/                # React Context providers
├── hooks/                  # Custom React hooks
├── services/               # API service modules
│   ├── api.ts              # Axios instance & interceptors
│   └── auth.ts             # Authentication API calls
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Features

- 🔐 JWT Authentication (login, register, logout)
- 📝 Create, read, update, delete posts
- ❤️ Like and bookmark posts
- 👥 Follow/unfollow users
- 💬 Direct messaging
- 🔔 Notifications
- 🏘️ Communities
- 🔍 Search users and posts

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** Shadcn UI
- **HTTP Client:** Axios
- **State Management:** React Context
- **Deployment:** Vercel

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
