-- Add user_id column to table_availability
ALTER TABLE table_availability 
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
