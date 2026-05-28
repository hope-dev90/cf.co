import pool from "../config/db.js";

// ------------------------------
// Restaurant Tables (physical tables)
// ------------------------------

export const addRestaurantTable = async (tableData) => {
  const {
    restaurant_id,
    table_number,
    capacity,
    location_description,
    is_active,
  } = tableData;
  const result = await pool.query(
    `INSERT INTO restaurant_tables (restaurant_id, table_number, capacity, location_description, is_active)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [restaurant_id, table_number, capacity, location_description, is_active],
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
  const { table_number, capacity, location_description, is_active } = tableData;
  const result = await pool.query(
    `UPDATE restaurant_tables 
     SET table_number = $1, capacity = $2, location_description = $3, is_active = $4, updated_at = NOW()
     WHERE id = $5 RETURNING *`,
    [table_number, capacity, location_description, is_active, id],
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

// ------------------------------
// Table Availability
// ------------------------------

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
    `SELECT ta.*, rt.table_number, rt.capacity
     FROM table_availability ta
     JOIN restaurant_tables rt ON ta.table_id = rt.id
     WHERE rt.restaurant_id = $1 AND ta.date = $2
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

// Create a new restaurant
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

// Get restaurants by user ID (owner)
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

// Delete restaurant
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

// Delete restaurant location
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

  return result.rows[0];
};

export const getMenuItems = async (restaurant_id) => {
  const result = await pool.query(
    `SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY category, name`,
    [restaurant_id],
  );
  return result.rows;
};

export const getMenuItemById = async (id) => {
  const result = await pool.query(`SELECT * FROM menu_items WHERE id = $1`, [
    id,
  ]);
  return result.rows[0];
};

// Update menu item
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

  return result.rows[0];
};

export const deleteMenuItem = async (id) => {
  const result = await pool.query(
    `DELETE FROM menu_items WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
};

// Add waiter
export const addWaiter = async (waiterData) => {
  const { restaurant_id, user_id, first_name, last_name, phone, email } =
    waiterData;

  const result = await pool.query(
    `INSERT INTO waiters (
      restaurant_id, user_id, first_name, last_name, phone, email
    ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [restaurant_id, user_id, first_name, last_name, phone, email],
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

// Get waiter by ID
export const getWaiterById = async (id) => {
  const result = await pool.query(`SELECT * FROM waiters WHERE id = $1`, [id]);
  return result.rows[0];
};

// Update waiter
export const updateWaiter = async (id, waiterData) => {
  const { first_name, last_name, phone, email } = waiterData;

  const result = await pool.query(
    `UPDATE waiters SET 
      first_name = $1, last_name = $2, phone = $3, email = $4, updated_at = NOW()
     WHERE id = $5 RETURNING *`,
    [first_name, last_name, phone, email, id],
  );

  return result.rows[0];
};

// Delete waiter
export const deleteWaiter = async (id) => {
  const result = await pool.query(
    `DELETE FROM waiters WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
};

// ------------------------------
// Waiter Availability
// ------------------------------

// Add waiter availability
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

// Get waiter availability
export const getWaiterAvailability = async (waiter_id) => {
  const result = await pool.query(
    `SELECT * FROM waiter_availability WHERE waiter_id = $1 ORDER BY date, start_time`,
    [waiter_id],
  );
  return result.rows;
};

// Get availability by date (for all waiters in a restaurant)
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

// Update waiter availability
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

// Mark availability as taken/not taken
export const setAvailabilityTaken = async (id, is_taken) => {
  const result = await pool.query(
    `UPDATE waiter_availability SET is_taken = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [is_taken, id],
  );
  return result.rows[0];
};

// Delete waiter availability
export const deleteWaiterAvailability = async (id) => {
  const result = await pool.query(
    `DELETE FROM waiter_availability WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
};
