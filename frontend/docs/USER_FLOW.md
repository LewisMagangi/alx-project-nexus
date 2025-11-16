# Simple User Flow for alx-project-nexus Frontend

## 1. Authentication

- User visits `/auth/login` or `/auth/register` to log in or create an account.
- On success, user is redirected to `/dashboard`.

## 2. Dashboard

- `/dashboard`: User sees a feed of posts.
- User can create a new post from the dashboard.

## 3. Posts

- `/posts`: User can view all posts.
- User can like/unlike posts.

## 4. Profile

- `/profile`: User can view and edit their profile (username, email).

## 5. Follows

- `/follows`: User can view followers and following lists.
- User can follow/unfollow other users.

## 6. Settings

- `/settings`: User can logout and manage account settings.

---

### Navigation Example

- Login/Register → Dashboard → Create/View Posts → Like/Follow Users → Edit Profile/Settings

---

**Note:**

- All pages require authentication except login/register.
- Navigation is via sidebar, navbar, or direct links.
- Errors and loading states are handled on each page.
