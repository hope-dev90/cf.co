import pool from "../config/db.js";

export const createRestaurant = async (restaurantData) => {
  const {
    user_id,
    name,
    description,
    cuisine_type,
    phone,
    email,
    website,
    operating_hours
  } = restaurantData;

  const result = await pool.query(
    `INSERT INTO restaurants (
      user_id, name, description, cuisine_type, phone, email, website, operating_hours
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [user_id, name, description, cuisine_type, phone, email, website, operating_hours]
  );

  return result.rows[0];
};

export const getAllRestaurants = async () => {
  const result = await pool.query(`SELECT * FROM restaurants ORDER BY created_at DESC`);
  return result.rows;
};

export const getRestaurantById = async (id) => {
  const result = await pool.query(`SELECT * FROM restaurants WHERE id = $1`, [id]);
  return result.rows[0];
};

export const getRestaurantsByUserId = async (user_id) => {
  const result = await pool.query(`SELECT * FROM restaurants WHERE user_id = $1 ORDER BY created_at DESC`, [user_id]);
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
    operating_hours
  } = restaurantData;

  const result = await pool.query(
    `UPDATE restaurants SET 
      name = $1, description = $2, cuisine_type = $3, 
      phone = $4, email = $5, website = $6, operating_hours = $7,
      updated_at = NOW()
     WHERE id = $8 RETURNING *`,
    [name, description, cuisine_type, phone, email, website, operating_hours, id]
  );

  return result.rows[0];
};


export const deleteRestaurant = async (id) => {
  const result = await pool.query(`DELETE FROM restaurants WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0];
};

export const addRestaurantLocation = async (locationData) => {
  const { restaurant_id, address, city, state, postal_code, latitude, longitude } = locationData;

  const result = await pool.query(
    `INSERT INTO restaurant_locations (
      restaurant_id, address, city, state, postal_code, latitude, longitude
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [restaurant_id, address, city, state, postal_code, latitude, longitude]
  );

  return result.rows[0];
};

export const getRestaurantLocations = async (restaurant_id) => {
  const result = await pool.query(
    `SELECT * FROM restaurant_locations WHERE restaurant_id = $1`,
    [restaurant_id]
  );
  return result.rows;
};


export const updateRestaurantLocation = async (id, locationData) => {
  const { address, city, state, postal_code, latitude, longitude } = locationData;

  const result = await pool.query(
    `UPDATE restaurant_locations SET 
      address = $1, city = $2, state = $3, postal_code = $4, 
      latitude = $5, longitude = $6, updated_at = NOW()
     WHERE id = $7 RETURNING *`,
    [address, city, state, postal_code, latitude, longitude, id]
  );

  return result.rows[0];
};

export const deleteRestaurantLocation = async (id) => {
  const result = await pool.query(`DELETE FROM restaurant_locations WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0];
};
