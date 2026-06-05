-- Add google_id column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

-- Make password column nullable
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Create restaurant_orders table
CREATE TABLE IF NOT EXISTS restaurant_orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  table_availability_id INTEGER REFERENCES table_availability(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  order_type VARCHAR(50) NOT NULL DEFAULT 'dine-in' CHECK (order_type IN ('dine-in', 'takeaway', 'delivery')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  delivery_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES restaurant_orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
  menu_item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_user ON restaurant_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_restaurant ON restaurant_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_status ON restaurant_orders(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_created ON restaurant_orders(created_at);
