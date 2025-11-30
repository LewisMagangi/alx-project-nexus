# Twitter MVP - User Journey Map

## 1. Authentication Flow

**Routes:** `/auth/login`, `/auth/register`

### Login Journey

#### User Flow

1. User lands on site → redirected to `/auth/login` (unless already authenticated)
2. Enters username/email + password; optional "Remember me"
3. Client-side validation → show inline errors (empty fields, format)
4. Submit → POST `/api/auth/login`
5. On success → store auth state (localStorage/sessionStorage or secure cookie), update auth context, redirect to intended route or `/dashboard`
6. On error → show specific error (invalid credentials, account locked, rate limit)
7. Forgot password → `/auth/forgot` → send reset email → `/auth/reset` flow
8. Optional 2FA → prompt for code → verify → complete login

#### Edge Cases & UX

- Disable submit while request in progress and show loader
- Focus first invalid field and display accessible error messages
- Preserve original redirect path after login
- Support password managers and autofill hints

#### Security & Validation

- Enforce server-side validation and structured error responses
- Use HTTPS; prefer secure, HttpOnly cookies for refresh tokens
- Rate-limit and escalate to CAPTCHA or temporary lockouts on repeated failures
- Clear sensitive fields on errors and on logout

1. User visits site → Redirects to `/auth/login`
2. Enters username + password
3. On success → Dashboard with personalized feed
4. On error → Shows error message

### Register Journey

1. User clicks "Sign up" from login
2. Enters username, email, password, confirms password
3. Must accept legal policies
4. On success → Auto-login → Dashboard
5. On error → Shows validation errors

---

## 2. Core Navigation Structure

``` bash
┌─────────────────────────────────────────┐
│           Top Navigation Bar            │
│  [Logo] [Home] [Notifications] [Profile]│
└─────────────────────────────────────────┘
           │
           ├── Home (Dashboard)
           ├── Notifications
           └── Profile Menu
                ├── Profile
                ├── Bookmarks
                ├── Settings
                └── Logout
```

---

## 3. Home Feed (Dashboard)

**Route:** `/dashboard` or `/home`

### User Actions

1. **View Feed**
   - See posts from followed users (chronological)
   - See all posts if not following anyone

2. **Create Post**
   - Compose box at top
   - 280 character limit
   - Real-time character count
   - Post button disabled if empty/over limit

3. **Interact with Posts**
   - Like/Unlike (heart icon)
   - Reply (comment icon) → Opens reply modal
   - Bookmark (bookmark icon)
   - Delete own posts (trash icon)

---

## 4. Explore/Discover

**Route:** `/explore`

### Features

1. Search users by username
2. View all posts (not just following)
3. Discover new users to follow
4. Trending topics/hashtags (future)

---

## 5. Notifications

**Route:** `/notifications`

### Types

1. **Engagement Notifications**
   - "@user liked your post"
   - "@user replied to your post"
   - "@user started following you"

2. **Interaction Flow**
   - Click notification → Navigate to relevant post/profile
   - Mark as read on click
   - Unread count badge on nav icon

---

## 6. Profile

**Route:** `/profile` (own) or `/profile/[username]` (others)

### Own Profile View

1. **Header Section**
   - Username, email, join date
   - Edit Profile button
   - Follower/Following counts

2. **Tabs**
   - Posts: User's posts
   - Replies: User's comments
   - Likes: Posts user liked
   - Bookmarks: Saved posts (private)

3. **Actions**
   - Edit profile → Modal/page
   - View followers/following

### Other User Profile

1. Follow/Unfollow button
2. View their posts
3. Can't see their bookmarks

---

## 7. Bookmarks

**Route:** `/bookmarks`

### features

1. List of all saved posts
2. Remove bookmark option
3. Navigate to original post
4. Private to user

---

## 8. Messages (DMs)

**Route:** `/messages` or `/messages/[user_id]`

### Flow

1. Inbox list of conversations
2. Click conversation → Chat view
3. Send/receive messages
4. Real-time updates (future: WebSocket)

---

## 9. Settings & Account

**Route:** `/settings`

### Settings Sections

#### Account Settings

- **Profile**
  - Edit username
  - Edit email
  - Change password
  - Delete/Deactivate account

#### Notifications

- **Preferences**
  - Email notifications on/off
  - Push notifications on/off
  - Notification types (likes, follows, replies)

#### Privacy & Safety

- **Blocking**
  - View blocked users
  - Unblock users

#### Display

- Theme (Light/Dark) - future
- Language preferences

---

## 10. Logout Flow

**Location:** Profile dropdown menu

### Actions

1. User clicks "Logout" from profile menu
2. Confirms logout (optional modal)
3. Token removed from localStorage
4. Redirects to `/auth/login`

---

## User Journey Example Scenarios

### Scenario 1: New User Signs Up

``` bash
/auth/register → Accept policies → Auto-login → /dashboard
→ Empty feed → "Follow users to see posts" prompt
→ Clicks "Discover" → /explore → Follows users
→ Returns to /dashboard → Sees followed users' posts
```

### Scenario 2: Existing User Daily Use

``` bash
/auth/login → /dashboard → Scrolls feed → Likes posts
→ Creates new post → Checks notifications
→ Replies to comment → Views profile
→ Bookmarks interesting post → Logs out
```

### Scenario 3: User Interaction

``` bash
/dashboard → Sees interesting post → Clicks username
→ /profile/[username] → Views user's posts
→ Clicks Follow → Returns to /dashboard
→ Sees user's posts in feed now
```

---

## Navigation Priority (Twitter-like)

### Primary Navigation (Always Visible)

1. **Home** - Feed
2. **Explore** - Discover
3. **Notifications** - Activity
4. **Messages** - DMs
5. **Bookmarks** - Saved
6. **Profile** - User menu

### Secondary Navigation (Profile Dropdown)

- Profile
- Settings
- Logout

---

## Mobile Considerations

### Mobile Navigation (Bottom Bar)

``` bash
[Home] [Explore] [Compose] [Notifications] [Profile]
```

### Compose Button

- Floating action button (FAB)
- Opens compose modal
- Available on all screens

---

## Future Enhancements

1. Retweets/Reposts
2. Quote tweets
3. Thread creation
4. Media uploads (images, videos)
5. Hashtag support
6. Mentions system
7. Live updates (WebSocket)
8. Infinite scroll
9. Trending topics
10. Lists feature

---

## Technical Implementation Notes

### State Management

- Auth state: Context API
- Posts: React Query (future)
- Real-time: WebSocket (future)

### Route Protection

- All routes except `/auth/*` require authentication
- Redirect to login if not authenticated
- Persist auth state in localStorage

### API Integration

- Use Axios interceptors
- JWT token in Authorization header
- Handle 401 globally
- Loading states for all actions
- Error handling with user feedback

---

## Metrics to Track

1. User engagement (likes, replies, posts)
2. Follow/unfollow rates
3. Notification interaction rates
4. Time spent on platform
5. Feature usage (bookmarks, messages)
