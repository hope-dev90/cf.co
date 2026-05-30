# Auth System

Standalone authentication service with email/password and Google OAuth.

## Features

- User registration with email verification
- Email/password login
- Google OAuth login
- Password reset with OTP
- JWT-based authentication
- Role-based access control

## Installation

```bash
npm install
```

## Setup

1. Copy `.env.example` to `.env` and configure all environment variables.

2. Set up PostgreSQL database using `config/setup.sql`

## Run

```bash
npm run dev
# or
npm start
```

## API Endpoints

| Method | Endpoint              | Description                              |
| ------ | --------------------- | ---------------------------------------- |
| POST   | /auth/register        | Register new user                        |
| POST   | /auth/login           | Login with email/password                |
| POST   | /auth/google          | Login with Google OAuth token            |
| POST   | /auth/verify-email    | Verify email with OTP                    |
| POST   | /auth/forgot-password | Request password reset OTP               |
| POST   | /auth/reset-password  | Reset password with OTP                  |
| GET    | /auth/profile         | Get current user profile (auth required) |
| GET    | /auth/users           | Get all users (admin & auth required)    |
