# Project Nexus Frontend

A [Next.js](https://nextjs.org) social media frontend built with TypeScript, TailwindCSS v4, and Shadcn UI.

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
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

### Vercel Deployment

When deploying to Vercel, set environment variables in the Vercel dashboard:

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add: `NEXT_PUBLIC_API_URL`: `https://alx-project-nexus-nvh6.onrender.com`
4. Redeploy your application

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in these variables.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```text
frontend/
├── app/                    # Next.js App Router pages
│   ├── auth/               # Authentication (login, register)
│   ├── dashboard/          # Main feed & home
│   ├── explore/            # Discover posts & users
│   ├── profile/            # User profiles
│   │   └── [username]/     # Dynamic user profile pages
│   ├── follows/            # Followers & following
│   ├── bookmarks/          # Saved posts
│   ├── notifications/      # User notifications
│   ├── threads/            # Post threads/replies
│   ├── posts/              # Individual post views
│   ├── settings/           # User settings
│   ├── legal/              # Terms, privacy, cookies
│   ├── about/              # About page
│   └── page.tsx            # Landing page
├── components/             # Reusable UI components
│   ├── ui/                 # Shadcn UI components
│   ├── AppLayout.tsx       # Main app layout with sidebar
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── PostCard.tsx        # Post display component
│   └── ProtectedRoute.tsx  # Auth route wrapper
├── context/                # React Context providers
│   └── AuthContext.tsx     # Authentication state
├── hooks/                  # Custom React hooks
├── services/               # API service modules
│   └── api.ts              # Axios instance & API methods
├── types/                  # TypeScript type definitions
├── lib/                    # Utility libraries
└── styles/                 # Global styles
```

## Features

- 🔐 **Authentication** - JWT login, register, logout with protected routes
- 📝 **Posts** - Create, edit, delete posts with hashtags & @mentions
- 🔄 **Retweets** - Retweet and quote tweet functionality
- 💬 **Threads** - Nested replies and conversation threads
- ❤️ **Likes** - Like/unlike posts
- 🔖 **Bookmarks** - Save posts for later
- 👥 **Follows** - Follow/unfollow users, see followers/following
- 👤 **Profiles** - User profiles with bio, location, avatar, stats
- 🔍 **Search** - Search users and posts
- 📱 **Responsive** - Mobile-first design with collapsible sidebar
- 🎨 **Themes** - Modern UI with Tailwind CSS v4

## Tech Stack

- **Framework:** Next.js 15+ (App Router with Turbopack)
- **Language:** TypeScript
- **Styling:** TailwindCSS v4
- **UI Components:** Shadcn UI + Lucide Icons
- **HTTP Client:** Axios
- **State Management:** React Context
- **Deployment:** Vercel

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
