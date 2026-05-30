# Auth System - Standalone Authentication

This is a standalone authentication system extracted from your backend, with no changes to the original files.

## Features

- User Registration
- Email Verification with OTP
- User Login (Email/Password)
- **Continue with Google** (OAuth2)
- Forgot Password (OTP)
- Reset Password
- Profile Get (authenticated)
- Get All Users (admin only)

## Installation

```bash
cd auth-system
npm install
```

## Setup

1. Make sure PostgreSQL is running
2. Create/update the users table using `config/setup.sql`
3. Create a `.env` file (already copied from backend)
4. **Get Google OAuth credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project, enable "Google Identity API"
   - Create OAuth 2.0 Client ID (Web application)
   - Add your authorized redirect URIs
   - Copy the Client ID and Client Secret to your `.env`

## Run

```bash
npm start
# or for development
npm run dev
```

## API Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login (email/password)
- `POST /auth/google` - Continue with Google
- `POST /auth/verify-email` - Verify email with OTP
- `POST /auth/forgot-password` - Request password reset OTP
- `POST /auth/reset-password` - Reset password with OTP
- `GET /auth/profile` - Get user profile (requires auth)
- `GET /auth/users` - Get all users (admin only, requires auth)

### Google Login Request

```json
{
  "credential": "google_id_token_from_frontend",
  "role": "client" // optional, defaults to "client"
}
```
