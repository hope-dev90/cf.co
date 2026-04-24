# cf.co API Documentation

Base URL: `http://localhost:9900`

All protected routes require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Auth Routes — `/auth`

### POST `/auth/register`
Register a new user. Sends a 6-digit OTP to the provided email.

**Body**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response `200`**
```json
{ "message": "Registered. Check your email for the verification code." }
```

---

### POST `/auth/verify-email`
Verify email using the OTP sent after registration.

**Body**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response `200`**
```json
{ "message": "Email verified successfully" }
```

---

### POST `/auth/resend-otp`
Resend the email verification OTP.

**Body**
```json
{
  "email": "user@example.com"
}
```

**Response `200`**
```json
{ "message": "New verification code sent" }
```

---

### POST `/auth/login`
Login with verified credentials. Returns a JWT token valid for 1 hour.

**Body**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response `200`**
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Errors**
- `400` — Invalid credentials
- `403` — Email not verified yet

---

### POST `/auth/forgot-password`
Request a password reset OTP sent to email.

**Body**
```json
{
  "email": "user@example.com"
}
```

**Response `200`**
```json
{ "message": "Password reset code sent to your email" }
```

---

### POST `/auth/reset-password`
Reset password using the OTP received by email.

**Body**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "yournewpassword"
}
```

**Response `200`**
```json
{ "message": "Password reset successfully" }
```

---

### GET `/auth/getAllUsers` 🔒 Admin only
Returns all registered users.

**Headers**
```
Authorization: Bearer <token>
```

**Response `200`**
```json
[
  { "id": 1, "email": "user@example.com", "is_verified": true }
]
```

---

## Subscriber Routes — `/sub`

### POST `/sub/add`
Subscribe an email to the mailing list.

**Body**
```json
{
  "email": "user@example.com"
}
```

**Response `200`**
```json
{ "message": "Subscribed successfully", "subscriber": { "id": 1, "email": "user@example.com" } }
```

---

### GET `/sub/` 🔒 Admin only
Get all subscribers.

**Headers**
```
Authorization: Bearer <token>
```

**Response `200`**
```json
{ "subscribers": [ { "id": 1, "email": "user@example.com" } ] }
```

---

## Order Routes — `/orders`

### POST `/orders/create` 🔒
Create a new order.

**Headers**
```
Authorization: Bearer <token>
```

**Body**
```json
{
  "name": "John Doe",
  "phone": "0712345678",
  "kgs": 2,
  "location": "Nairobi",
  "clientcategory": "retail",
  "notes": "Deliver before noon"
}
```

**Response `200`**
```json
{
  "id": 1,
  "name": "John Doe",
  "phone": "0712345678",
  "kgs": 2,
  "location": "Nairobi",
  "clientcategory": "retail",
  "notes": "Deliver before noon"
}
```

---

### GET `/orders/` 🔒 Admin only
Get all orders.

**Headers**
```
Authorization: Bearer <token>
```

---

### GET `/orders/location/:location` 🔒 Admin only
Get orders filtered by location.

**Example:** `GET /orders/location/Nairobi`

---

### GET `/orders/email/:email` 🔒 Admin only
Get orders filtered by email.

**Example:** `GET /orders/email/user@example.com`

---

## Error Responses

| Status | Meaning |
|--------|---------|
| `400` | Bad request / validation error |
| `401` | Missing or invalid token |
| `403` | Forbidden — email not verified or not admin |
| `404` | Resource not found |
| `500` | Internal server error |

---

## Auth Flow

```
Register → verify-email → login → use token on protected routes
```

## Password Reset Flow

```
forgot-password → check email for OTP → reset-password
```
