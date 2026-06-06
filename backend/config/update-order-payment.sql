ALTER TABLE restaurant_orders
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
