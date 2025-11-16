# API Integration Reference: Frontend vs Backend

## 1. Authentication

### Backend Endpoints

- `POST /api/auth/register/` — Register a new user
  - Request: `{ "username": string, "password": string, "email": string (optional) }`
  - Response: `{ "message": "User registered successfully." }`

- `POST /api/auth/login/` — Login and get JWT tokens
  - Request: `{ "username": string, "password": string }`
  - Response: `{ "refresh": string, "access": string, "user": { "id": int, "username": string, "email": string } }`

### Frontend Requirements

- Register: Send username, password, (optional) email
- Login: Send username, password; store access token for authenticated requests
- All authenticated requests: Send `Authorization: Bearer <access_token>` header

---

## 2. Posts

### Backend Endpoint

- `GET /api/posts/` — List posts
- `POST /api/posts/` — Create post
  - Request: `{ "content": string }` (user is set from JWT token)
  - Response: `{ "id": int, "user": int, "username": string, "content": string, "created_at": string, "likes_count": int, "is_liked": bool }`

### Frontend Design

- To create a post: Send `{ "content": "..." }` with JWT token in header
- To list posts: Send GET request with JWT token in header

---

## 3. Likes

### Backend Results

- `POST /api/likes/` — Like a post
  - Request: `{ "post": int }` (user is set from JWT token)
  - Response: `{ "id": int, "user": int, "post": int, "created_at": string }`

### Frontend Structure

- To like a post: Send `{ "post": post_id }` with JWT token in header

---

## 4. Follows

### Backend Attributes

- `POST /api/follows/` — Follow a user
  - Request: `{ "following": int }` (user is set from JWT token)
  - Response: `{ "id": int, "follower": int, "following": int, "created_at": string }`

### Frontend Needs

- To follow a user: Send `{ "following": user_id }` with JWT token in header

---

## 5. General Notes

- All endpoints requiring authentication expect JWT token in `Authorization` header
- Backend sets `user` field from authenticated user; frontend does not need to send `user` in payload
- All IDs refer to Django's built-in User model

---

## Next Steps

- Ensure frontend only sends required fields (no `user` field in payload)
- Ensure backend sets `user` from `request.user` for create actions
- Confirm all endpoints match the above structure
- Fix any mismatches by updating frontend requests or backend serializers/views
