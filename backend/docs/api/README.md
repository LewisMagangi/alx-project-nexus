# API Documentation

## Endpoints

### Posts

- `GET /api/posts/` — List all posts
- `POST /api/posts/` — Create a new post
- `GET /api/posts/{id}/` — Retrieve a post
- `PUT /api/posts/{id}/` — Update a post
- `PATCH /api/posts/{id}/` — Partially update a post
- `DELETE /api/posts/{id}/` — Delete a post

#### Fields

- `id`: integer
- `user`: integer (User ID)
- `content`: string (max 280 chars)
- `created_at`: datetime

### Likes

- `GET /api/likes/` — List all likes
- `POST /api/likes/` — Create a like
- `GET /api/likes/{id}/` — Retrieve a like
- `DELETE /api/likes/{id}/` — Delete a like

#### Characters

- `id`: integer
- `user`: integer (User ID)
- `post`: integer (Post ID)
- `created_at`: datetime

### Follows

- `GET /api/follows/` — List all follows
- `POST /api/follows/` — Create a follow
- `GET /api/follows/{id}/` — Retrieve a follow
- `DELETE /api/follows/{id}/` — Delete a follow

#### Attributes

- `id`: integer
- `follower`: integer (User ID)
- `following`: integer (User ID)
- `created_at`: datetime

---

## OpenAPI & Swagger

- `GET /api/schema/` — OpenAPI schema (JSON)
- `GET /api/swagger/` — Swagger UI (interactive docs)

---

## Authentication

- Endpoints support JWT authentication (see DRF SimpleJWT docs)

---

## Example Request

```http
POST /api/posts/
Content-Type: application/json
Authorization: Bearer <token>

{
  "user": 1,
  "content": "Hello, world!"
}
```

## Example Response

```json
{
  "id": 42,
  "user": 1,
  "content": "Hello, world!",
  "created_at": "2025-11-13T12:34:56Z"
}
```
