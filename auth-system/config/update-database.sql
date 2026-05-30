-- Add google_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

-- Make password column nullable (for Google users)
ALTER TABLE users 
ALTER COLUMN password DROP NOT NULL;
