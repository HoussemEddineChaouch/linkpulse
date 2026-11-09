# LinkPulse API

Base URL (local): `http://localhost:3000`

All request and response bodies are JSON.

## Authentication

Protected endpoints require a JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

Get a token with `POST /api/auth/login`. Tokens expire after 1 hour by default.

## Endpoints

### `GET /health`

Health check, used by Docker and hosting platforms.

**200**
```json
{ "status": "ok" }
```

---

### `POST /api/auth/register`

Create a new account.

**Request body**
```json
{ "email": "ana@example.com", "password": "password123" }
```

| Rule | Details |
|---|---|
| `email` | Valid email. Stored trimmed and lowercase |
| `password` | 8 to 72 characters |

**201 Created**
```json
{
  "user": { "id": 1, "email": "ana@example.com", "createdAt": "2026-11-09T10:00:00.000Z" }
}
```

| Status | Meaning |
|---|---|
| 400 | Validation failed, response has an `errors` array |
| 400 | Malformed JSON body |
| 409 | Email already registered |

---

### `POST /api/auth/login`

Exchange credentials for a JWT.

**Request body**
```json
{ "email": "ana@example.com", "password": "password123" }
```

**200 OK**
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "email": "ana@example.com" }
}
```

| Status | Meaning |
|---|---|
| 400 | Email or password missing |
| 401 | Invalid email or password (same message for both, on purpose) |

---

### `GET /api/auth/me` 🔒

Returns the currently authenticated user.

**200 OK**
```json
{
  "user": { "id": 1, "email": "ana@example.com", "createdAt": "2026-11-09T10:00:00.000Z" }
}
```

| Status | Meaning |
|---|---|
| 401 | Missing, malformed, invalid, or expired token, or the user no longer exists |

## Error format

Single errors: `{ "error": "message" }`. Validation errors: `{ "errors": ["message", ...] }`.