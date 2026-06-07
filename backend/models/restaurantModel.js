import pool from "../config/db.js";

export const addRestaurantTable = async (tableData) => {
  const {
    restaurant_id,
    table_number,
    capacity,
    location_description,
    position_x,
    position_y,
    is_active,
  } = tableData;
  const result = await pool.query(
    `INSERT INTO restaurant_tables (restaurant_id, table_number, capacity, location_description, position_x, position_y, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      restaurant_id,
      table_number,
      capacity,
      location_description,
      position_x ?? 0,
      position_y ?? 0,
      is_active,
    ],
  );
  return result.rows[0];
};

export const getRestaurantTables = async (restaurant_id) => {
  const result = await pool.query(
    `SELECT * FROM restaurant_tables WHERE restaurant_id = $1 ORDER BY table_number`,
    [restaurant_id],
  );
  return result.rows;
};

export const getRestaurantTableById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM restaurant_tables WHERE id = $1`,
    [id],
  );
  return result.rows[0];
};

export const updateRestaurantTable = async (id, tableData) => {
  const {
    table_number,
    capacity,
    location_description,
    position_x,
    position_y,
    is_active,
  } = tableData;
  const result = await pool.query(
    `UPDATE restaurant_tables 
     SET table_number = $1, capacity = $2, location_description = $3,
         position_x = $4, position_y = $5, is_active = $6, updated_at = NOW()
     WHERE id = $7 RETURNING *`,
    [
      table_number,
      capacity,
      location_description,
      position_x ?? 0,
      position_y ?? 0,
      is_active,
      id,
    ],
  );
  return result.rows[0];
};

export const deleteRestaurantTable = async (id) => {
  const result = await pool.query(
    `DELETE FROM restaurant_tables WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
};

export const addTableAvailability = async (availabilityData) => {
  const {
    table_id,
    date,
    start_time,
    end_time,
    status,
    customer_name,
    customer_phone,
    notes,
  } = availabilityData;
  const result = await pool.query(
    `INSERT INTO table_availability (table_id, date, start_time, end_time, status, customer_name, customer_phone, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      table_id,
      date,
      start_time,
      end_time,
      status,
      customer_name,
      customer_phone,
      notes,
    ],
  );
  return result.rows[0];
};

export const getTableAvailability = async (table_id) => {
  const result = await pool.query(
    `SELECT * FROM table_availability WHERE table_id = $1 ORDER BY date, start_time`,
    [table_id],
  );
  return result.rows;
};

export const getTableAvailabilityByDate = async (restaurant_id, date) => {
  const result = await pool.query(
    `SELECT ta.*, rt.table_number, rt.capacity, rt.location_description,
            rt.position_x, rt.position_y, u.name as user_name, u.email as user_email
     FROM table_availability ta
     JOIN restaurant_tables rt ON ta.table_id = rt.id
     LEFT JOIN users u ON ta.user_id = u.id
     WHERE rt.restaurant_id = $1 AND ta.date = $2 AND rt.is_active = true
     ORDER BY rt.table_number, ta.start_time`,
    [restaurant_id, date],
  );
  return result.rows;
};

export const updateTableAvailability = async (id, availabilityData) => {
  const {
    date,
    start_time,
    end_time,
    status,
    customer_name,
    customer_phone,
    notes,
  } = availabilityData;
  const result = await pool.query(
    `UPDATE table_availability 
     SET date = $1, start_time = $2, end_time = $3, status = $4, customer_name = $5, customer_phone = $6, notes = $7, updated_at = NOW()
     WHERE id = $8 RETURNING *`,
    [
      date,
      start_time,
      end_time,
      status,
      customer_name,
      customer_phone,
      notes,
      id,
    ],
  );
  return result.rows[0];
};

export const updateTableStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE table_availability SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id],
  );
  return result.rows[0];
};

export const deleteTableAvailability = async (id) => {
  const result = await pool.query(
    `DELETE FROM table_availability WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
};

export const reserveTable = async (availabilityId, userId, customerData) => {
  const { customer_name, customer_phone, notes } = customerData;
  const result = await pool.query(
    `UPDATE table_availability 
     SET status = 'reserved', user_id = $1, customer_name = $2, customer_phone = $3, notes = $4, updated_at = NOW()
     WHERE id = $5 AND status = 'available' 
     RETURNING *`,
    [userId, customer_name, customer_phone, notes, availabilityId],
  );
  return result.rows[0];
};

export const createRestaurant = async (restaurantData) => {
  const {
    user_id,
    name,
    description,
    cuisine_type,
    phone,
    email,
    website,
    operating_hours,
  } = restaurantData;

  const result = await pool.query(
    `INSERT INTO restaurants (
      user_id, name, description, cuisine_type, phone, email, website, operating_hours
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      user_id,
      name,
      description,
      cuisine_type,
      phone,
      email,
      website,
      operating_hours,
    ],
  );
  return result.rows[0];
};

export const getAllRestaurants = async () => {
  const result = await pool.query(
    `SELECT * FROM restaurants ORDER BY created_at DESC`,
  );
  return result.rows;
};

export const getRestaurantById = async (id) => {
  const result = await pool.query(`SELECT * FROM restaurants WHERE id = $1`, [
    id,
  ]);
  return result.rows[0];
};

export const getRestaurantsByUserId = async (user_id) => {
  const result = await pool.query(
    `SELECT * FROM restaurants WHERE user_id = $1 ORDER BY created_at DESC`,
    [user_id],
  );
  return result.rows;
};

export const updateRestaurant = async (id, restaurantData) => {
  const {
    name,
    description,
    cuisine_type,
    phone,
    email,
    website,
    operating_hours,
  } = restaurantData;

  const result = await pool.query(
    `UPDATE restaurants SET 
      name = $1, description = $2, cuisine_type = $3, 
      phone = $4, email = $5, website = $6, operating_hours = $7,
      updated_at = NOW()
     WHERE id = $8 RETURNING *`,
    [
      name,
      description,
      cuisine_type,
      phone,
      email,
      website,
      operating_hours,
      id,
    ],
  );
  return result.rows[0];
};

export const deleteRestaurant = async (id) => {
  const result = await pool.query(
    `DELETE FROM restaurants WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
};

export const addRestaurantLocation = async (locationData) => {
  const {
    restaurant_id,
    address,
    city,
    state,
    postal_code,
    latitude,
    longitude,
  } = locationData;

  const result = await pool.query(
    `INSERT INTO restaurant_locations (
      restaurant_id, address, city, state, postal_code, latitude, longitude
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [restaurant_id, address, city, state, postal_code, latitude, longitude],
  );
  return result.rows[0];
};

export const getRestaurantLocations = async (restaurant_id) => {
  const result = await pool.query(
    `SELECT * FROM restaurant_locations WHERE restaurant_id = $1`,
    [restaurant_id],
  );
  return result.rows;
};

export const updateRestaurantLocation = async (id, locationData) => {
  const { address, city, state, postal_code, latitude, longitude } =
    locationData;

  const result = await pool.query(
    `UPDATE restaurant_locations SET 
      address = $1, city = $2, state = $3, postal_code = $4, 
      latitude = $5, longitude = $6, updated_at = NOW()
     WHERE id = $7 RETURNING *`,
    [address, city, state, postal_code, latitude, longitude, id],
  );
  return result.rows[0];
};

export const deleteRestaurantLocation = async (id) => {
  const result = await pool.query(
    `DELETE FROM restaurant_locations WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
};

export const addMenuItem = async (menuData) => {
  const {
    restaurant_id,
    name,
    description,
    price,
    category,
    is_available,
    image_url,
  } = menuData;

  const result = await pool.query(
    `INSERT INTO menu_items (
      restaurant_id, name, description, price, category, is_available, image_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      restaurant_id,
      name,
      description,
      price,
      category,
      is_available,
      image_url,
    ],
  );
  return {
    ...result.rows[0],
    price: Number(result.rows[0].price)
  };
};

export const getMenuItems = async (restaurant_id) => {
  const result = await pool.query(
    `SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY category, name`,
    [restaurant_id],
  );
  return result.rows.map((item) => ({
    ...item,
    price: Number(item.price),
  }));
};

export const getMenuItemById = async (id) => {
  const result = await pool.query(`SELECT * FROM menu_items WHERE id = $1`, [
    id,
  ]);
  if(result.rows[0]) {
    return {
      ...result.rows[0],
      price: Number(result.rows[0].price)
    };
  }
  return null;
};

export const filterByCategory = async (category) => {
  const result = await pool.query(
    `SELECT * FROM menu_items WHERE category = $1`,
    [category],
  );
  return result.rows[0];
};

export const updateMenuItem = async (id, menuData) => {
  const { name, description, price, category, is_available, image_url } =
    menuData;

  const result = await pool.query(
    `UPDATE menu_items SET 
      name = $1, description = $2, price = $3, category = $4, 
      is_available = $5, image_url = $6, updated_at = NOW()
    WHERE id = $7 RETURNING *`,
    [name, description, price, category, is_available, image_url, id],
  );
  if(result.rows[0]) {
    return {
      ...result.rows[0],
      price: Number(result.rows[0].price)
    };
  }
  return null;
};

export const deleteMenuItem = async (id) => {
  const result = await pool.query(
    `DELETE FROM menu_items WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
};

export const addWaiter = async (waiterData) => {
  const { restaurant_id, user_id, first_name, last_name, phone, email, staff_role, task, photo_url, status } = waiterData;

  const result = await pool.query(
    `INSERT INTO waiters (
      restaurant_id, user_id, first_name, last_name, phone, email, staff_role, task, photo_url, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [restaurant_id, user_id, first_name, last_name, phone, email, staff_role || 'waiter', task || null, photo_url || null, status || 'active'],
  );
  return result.rows[0];
};

export const getWaiters = async (restaurant_id) => {
  const result = await pool.query(
    `SELECT * FROM waiters WHERE restaurant_id = $1 ORDER BY last_name, first_name`,
    [restaurant_id],
  );
  return result.rows;
};

export const getWaiterById = async (id) => {
  const result = await pool.query(`SELECT * FROM waiters WHERE id = $1`, [id]);
  return result.rows[0];
};

export const updateWaiter = async (id, waiterData) => {
  const { first_name, last_name, phone, email, staff_role, task, photo_url, status } = waiterData;

  const result = await pool.query(
    `UPDATE waiters SET 
      first_name = $1, last_name = $2, phone = $3, email = $4,
      staff_role = $5, task = $6, photo_url = $7, status = $8,
      updated_at = NOW()
     WHERE id = $9 RETURNING *`,
    [first_name, last_name, phone, email, staff_role || 'waiter', task || null, photo_url || null, status || 'active', id],
  );
  return result.rows[0];
};

export const deleteWaiter = async (id) => {
  const result = await pool.query(
    `DELETE FROM waiters WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
};

export const addWaiterAvailability = async (availabilityData) => {
  const { waiter_id, date, start_time, end_time, is_taken, notes } =
    availabilityData;

  const result = await pool.query(
    `INSERT INTO waiter_availability (
      waiter_id, date, start_time, end_time, is_taken, notes
    ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [waiter_id, date, start_time, end_time, is_taken, notes],
  );
  return result.rows[0];
};

export const getWaiterAvailability = async (waiter_id) => {
  const result = await pool.query(
    `SELECT * FROM waiter_availability WHERE waiter_id = $1 ORDER BY date, start_time`,
    [waiter_id],
  );
  return result.rows;
};

export const getAvailabilityByDate = async (restaurant_id, date) => {
  const result = await pool.query(
    `SELECT wa.*, w.first_name, w.last_name 
     FROM waiter_availability wa
     JOIN waiters w ON wa.waiter_id = w.id
     WHERE w.restaurant_id = $1 AND wa.date = $2
     ORDER BY wa.start_time`,
    [restaurant_id, date],
  );
  return result.rows;
};

export const updateWaiterAvailability = async (id, availabilityData) => {
  const { date, start_time, end_time, is_taken, notes } = availabilityData;

  const result = await pool.query(
    `UPDATE waiter_availability SET 
      date = $1, start_time = $2, end_time = $3, 
      is_taken = $4, notes = $5, updated_at = NOW()
     WHERE id = $6 RETURNING *`,
    [date, start_time, end_time, is_taken, notes, id],
  );
  return result.rows[0];
};

export const setAvailabilityTaken = async (id, is_taken) => {
  const result = await pool.query(
    `UPDATE waiter_availability SET is_taken = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [is_taken, id],
  );
  return result.rows[0];
};

export const deleteWaiterAvailability = async (id) => {
  const result = await pool.query(
    `DELETE FROM waiter_availability WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
};

// ------------------------------
// ORDERS
// ------------------------------

export const createOrder = async (orderData) => {
  const {
    user_id,
    restaurant_id,
    table_availability_id,
    customer_name,
    customer_phone,
    order_type,
    status,
    total_amount,
    payment_method,
    notes,
    delivery_address,
    items,
  } = orderData;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO restaurant_orders (
        user_id, restaurant_id, table_availability_id, customer_name, customer_phone, 
        order_type, status, total_amount, payment_method, notes, delivery_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        user_id,
        restaurant_id,
        table_availability_id,
        customer_name,
        customer_phone,
        order_type,
        status,
        total_amount,
        payment_method,
        notes,
        delivery_address,
      ],
    );

    const order = orderResult.rows[0];

    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, menu_item_id, menu_item_name, quantity, unit_price, notes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            order.id,
            item.menu_item_id,
            item.menu_item_name,
            item.quantity,
            item.unit_price,
            item.notes,
          ],
        );
      }
    }

    await client.query("COMMIT");
    return {
      ...order,
      total_amount: Number(order.total_amount)
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getOrderById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM restaurant_orders WHERE id = $1`,
    [id],
  );
  if (result.rows.length === 0) return null;

  const itemsResult = await pool.query(
    `SELECT * FROM order_items WHERE order_id = $1`,
    [id],
  );
  return { 
    ...result.rows[0], 
    total_amount: Number(result.rows[0].total_amount),
    items: itemsResult.rows.map(item => ({
      ...item,
      unit_price: Number(item.unit_price)
    })) 
  };
};

export const getOrdersByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT ro.*, r.name as restaurant_name
     FROM restaurant_orders ro
     LEFT JOIN restaurants r ON ro.restaurant_id = r.id
     WHERE ro.user_id = $1
     ORDER BY ro.created_at DESC`,
    [user_id],
  );

  const orders = result.rows;
  if (orders.length === 0) return [];

  const orderIds = orders.map((order) => order.id);
  const itemsResult = await pool.query(
    `SELECT * FROM order_items WHERE order_id = ANY($1::int[])`,
    [orderIds],
  );

  const itemsByOrder = itemsResult.rows.reduce((acc, item) => {
    if (!acc[item.order_id]) acc[item.order_id] = [];
    acc[item.order_id].push({
      ...item,
      unit_price: Number(item.unit_price)
    });
    return acc;
  }, {});

  return orders.map((order) => ({
    ...order,
    total_amount: Number(order.total_amount),
    items: itemsByOrder[order.id] || [],
  }));
};

export const getOrdersByRestaurant = async (restaurant_id, status = null) => {
  let query = `SELECT * FROM restaurant_orders WHERE restaurant_id = $1`;
  const params = [restaurant_id];

  if (status) {
    query += ` AND status = $2`;
    params.push(status);
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows.map(order => ({
    ...order,
    total_amount: Number(order.total_amount)
  }));
};

export const getOrdersByRestaurantWithItems = async (
  restaurant_id,
  status = null,
) => {
  let query = `SELECT * FROM restaurant_orders WHERE restaurant_id = $1`;
  const params = [restaurant_id];

  if (status) {
    query += ` AND status = $2`;
    params.push(status);
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, params);
  const orders = result.rows;

  for (const order of orders) {
    const itemsResult = await pool.query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [order.id],
    );
    order.total_amount = Number(order.total_amount);
    order.items = itemsResult.rows.map(item => ({
      ...item,
      unit_price: Number(item.unit_price)
    }));
  }

  return orders;
};

export const updateOrderStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE restaurant_orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id],
  );
  if(result.rows[0]) {
    return {
      ...result.rows[0],
      total_amount: Number(result.rows[0].total_amount)
    };
  }
  return null;
};

export const updateOrder = async (id, orderData) => {
  const {
    customer_name,
    customer_phone,
    order_type,
    status,
    total_amount,
    notes,
    delivery_address,
  } = orderData;

  const result = await pool.query(
    `UPDATE restaurant_orders SET 
      customer_name = $1, customer_phone = $2, order_type = $3, 
      status = $4, total_amount = $5, notes = $6, 
      delivery_address = $7, updated_at = NOW()
    WHERE id = $8 RETURNING *`,
    [
      customer_name,
      customer_phone,
      order_type,
      status,
      total_amount,
      notes,
      delivery_address,
      id,
    ],
  );
  if(result.rows[0]) {
    return {
      ...result.rows[0],
      total_amount: Number(result.rows[0].total_amount)
    };
  }
  return null;
};

export const deleteOrder = async (id) => {
  const result = await pool.query(
    `DELETE FROM restaurant_orders WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
};

// ------------------------------
// ANALYTICS
// ------------------------------

export const getRestaurantAnalytics = async (
  restaurant_id,
  startDate = null,
  endDate = null,
) => {
  let query = `
    SELECT 
      COUNT(*) as total_orders,
      SUM(total_amount) as total_revenue,
      AVG(total_amount) as avg_order_value
    FROM restaurant_orders 
    WHERE restaurant_id = $1
  `;
  const params = [restaurant_id];

  if (startDate && endDate) {
    query += ` AND created_at BETWEEN $2 AND $3`;
    params.push(startDate, endDate);
  }

  const result = await pool.query(query, params);
  const row = result.rows[0];
  return {
    total_orders: Number(row.total_orders),
    total_revenue: Number(row.total_revenue) || 0,
    avg_order_value: Number(row.avg_order_value) || 0
  };
};

export const getDailySales = async (restaurant_id, startDate, endDate) => {
  const result = await pool.query(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as orders_count,
      SUM(total_amount) as revenue
    FROM restaurant_orders
    WHERE restaurant_id = $1 AND created_at BETWEEN $2 AND $3
    GROUP BY DATE(created_at)
    ORDER BY date`,
    [restaurant_id, startDate, endDate],
  );
  return result.rows.map(row => ({
    date: row.date,
    orders_count: Number(row.orders_count),
    revenue: Number(row.revenue)
  }));
};

export const getTopMenuItems = async (restaurant_id, limit = 5) => {
  const result = await pool.query(
    `SELECT 
      mi.id,
      mi.name,
      mi.image_url,
      SUM(oi.quantity) as total_sold
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN restaurant_orders ro ON oi.order_id = ro.id
    WHERE ro.restaurant_id = $1
    GROUP BY mi.id, mi.name, mi.image_url
    ORDER BY total_sold DESC
    LIMIT $2`,
    [restaurant_id, limit],
  );
  return result.rows.map(row => ({
    ...row,
    total_sold: Number(row.total_sold)
  }));
};

export const getOrdersByStatus = async (restaurant_id) => {
  const result = await pool.query(
    `SELECT 
      status,
      COUNT(*) as count
    FROM restaurant_orders
    WHERE restaurant_id = $1
    GROUP BY status`,
    [restaurant_id],
  );
  return result.rows;
};
