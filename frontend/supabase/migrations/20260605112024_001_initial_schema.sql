/*
# Restaurant Platform - Initial Schema

1. New Tables
- `profiles` - User profiles with role selection (user, admin, restaurant_owner)
  - id (uuid, PK, references auth.users)
  - email (text)
  - full_name (text)
  - role (text: 'user' | 'admin' | 'restaurant_owner')
  - avatar_url (text, nullable)
  - phone (text, nullable)
  - created_at (timestamptz)

- `restaurants` - Restaurant listings owned by restaurant_owner users
  - id (uuid, PK)
  - owner_id (uuid, FK to profiles, NOT NULL DEFAULT auth.uid())
  - name (text)
  - description (text)
  - cuisine_type (text)
  - address (text)
  - phone (text)
  - image_url (text, nullable)
  - rating (numeric, default 0)
  - is_active (boolean, default true)
  - created_at (timestamptz)

- `categories` - Menu categories per restaurant
  - id (uuid, PK)
  - restaurant_id (uuid, FK to restaurants)
  - name (text)
  - sort_order (integer, default 0)
  - created_at (timestamptz)

- `menu_items` - Individual menu items
  - id (uuid, PK)
  - category_id (uuid, FK to categories)
  - restaurant_id (uuid, FK to restaurants)
  - name (text)
  - description (text, nullable)
  - price (numeric)
  - image_url (text, nullable)
  - is_available (boolean, default true)
  - prep_time_minutes (integer, default 15)
  - created_at (timestamptz)

- `orders` - Customer orders
  - id (uuid, PK)
  - user_id (uuid, FK to profiles, NOT NULL DEFAULT auth.uid())
  - restaurant_id (uuid, FK to restaurants)
  - status (text: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled')
  - total_amount (numeric)
  - delivery_address (text)
  - notes (text, nullable)
  - created_at (timestamptz)

- `order_items` - Line items within an order
  - id (uuid, PK)
  - order_id (uuid, FK to orders)
  - menu_item_id (uuid, FK to menu_items)
  - quantity (integer, default 1)
  - unit_price (numeric)
  - created_at (timestamptz)

2. Security
- RLS enabled on all tables
- profiles: users can read/update own; admins can read all
- restaurants: owners can CRUD own; users can read active; admins can read all
- categories: owners can CRUD own restaurant's; users can read; admins can read all
- menu_items: owners can CRUD own restaurant's; users can read available; admins can read all
- orders: users can CRUD own orders; owners can read/update orders for their restaurants; admins can read all
- order_items: scoped through orders
*/

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'restaurant_owner')),
  avatar_url text,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admin can read all profiles
DROP POLICY IF EXISTS "admin_read_profiles" ON profiles;
CREATE POLICY "admin_read_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  cuisine_type text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  image_url text,
  rating numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active restaurants
DROP POLICY IF EXISTS "read_active_restaurants" ON restaurants;
CREATE POLICY "read_active_restaurants" ON restaurants FOR SELECT
  TO authenticated USING (true);

-- Owners can insert their own restaurants
DROP POLICY IF EXISTS "insert_own_restaurants" ON restaurants;
CREATE POLICY "insert_own_restaurants" ON restaurants FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own restaurants
DROP POLICY IF EXISTS "update_own_restaurants" ON restaurants;
CREATE POLICY "update_own_restaurants" ON restaurants FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Owners can delete their own restaurants
DROP POLICY IF EXISTS "delete_own_restaurants" ON restaurants;
CREATE POLICY "delete_own_restaurants" ON restaurants FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- Admin can update/delete any restaurant
DROP POLICY IF EXISTS "admin_manage_restaurants" ON restaurants;
CREATE POLICY "admin_manage_restaurants" ON restaurants FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_categories" ON categories;
CREATE POLICY "read_categories" ON categories FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_categories" ON categories;
CREATE POLICY "insert_own_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_categories" ON categories;
CREATE POLICY "update_own_categories" ON categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_categories" ON categories;
CREATE POLICY "delete_own_categories" ON categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  prep_time_minutes integer NOT NULL DEFAULT 15,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_menu_items" ON menu_items;
CREATE POLICY "read_menu_items" ON menu_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_menu_items" ON menu_items;
CREATE POLICY "insert_own_menu_items" ON menu_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_menu_items" ON menu_items;
CREATE POLICY "update_own_menu_items" ON menu_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_menu_items" ON menu_items;
CREATE POLICY "delete_own_menu_items" ON menu_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  total_amount numeric NOT NULL DEFAULT 0,
  delivery_address text NOT NULL DEFAULT '',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Restaurant owners can read orders for their restaurants
DROP POLICY IF EXISTS "owner_read_orders" ON orders;
CREATE POLICY "owner_read_orders" ON orders FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

-- Admin can read all orders
DROP POLICY IF EXISTS "admin_read_orders" ON orders;
CREATE POLICY "admin_read_orders" ON orders FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can insert their own orders
DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Restaurant owners can update order status for their restaurants
DROP POLICY IF EXISTS "owner_update_orders" ON orders;
CREATE POLICY "owner_update_orders" ON orders FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
  );

-- Admin can update any order
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM restaurants WHERE id = orders.restaurant_id AND owner_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
  );

DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
