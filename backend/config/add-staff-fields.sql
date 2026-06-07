-- Run this against your database to add staff management fields
ALTER TABLE waiters
  ADD COLUMN IF NOT EXISTS staff_role VARCHAR(50) DEFAULT 'waiter' CHECK (staff_role IN ('waiter', 'manager', 'security', 'chef', 'cashier')),
  ADD COLUMN IF NOT EXISTS task TEXT,
  ADD COLUMN IF NOT EXISTS task_done BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave'));
