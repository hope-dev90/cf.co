# Auth System - Standalone Authentication

This is a standalone authentication system extracted from your backend, with no changes to the original files.

## Features
- User Registration
- Email Verification with OTP
- User Login (JWT)
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
2. Create the users table using `config/setup.sql`
3. Create a `.env` file (already copied from backend)

## Run
```bash
npm start
# or for development
npm run dev
```

## API Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Verify email with OTP
- `POST /auth/forgot-password` - Request password reset OTP
- `POST /auth/reset-password` - Reset password with OTP
- `GET /auth/profile` - Get user profile (requires auth)
- `GET /auth/users` - Get all users (admin only, requires auth)
