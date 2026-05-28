-- Connect to your database first
\c cfco;

-- Drop the old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the new constraint with client and restaurateur roles
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('client', 'restaurateur', 'admin'));
