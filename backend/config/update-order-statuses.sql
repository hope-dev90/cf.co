ALTER TABLE restaurant_orders 
DROP CONSTRAINT restaurant_orders_status_check;

ALTER TABLE restaurant_orders 
ADD CONSTRAINT restaurant_orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'served', 'completed', 'cancelled'));
