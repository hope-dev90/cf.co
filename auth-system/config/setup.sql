-- Create database (if needed)
-- CREATE DATABASE cfco;
-- \c cfco;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('client', 'restaurateur', 'admin')),
  is_verified BOOLEAN DEFAULT false,
  otp VARCHAR(6),
  otp_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
