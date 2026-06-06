import pool from "../config/db.js";

const restaurant = await pool.query(`
  SELECT column_name, data_type, udt_name
  FROM information_schema.columns
  WHERE table_name = 'restaurants'
  ORDER BY ordinal_position
`);
console.log("restaurants:", restaurant.rows);

const orders = await pool.query(`
  SELECT column_name, data_type, udt_name
  FROM information_schema.columns
  WHERE table_name = 'orders'
  ORDER BY ordinal_position
`);
console.log("orders:", orders.rows);

const sample = await pool.query("SELECT id FROM restaurants LIMIT 3");
console.log("restaurant ids:", sample.rows);

process.exit(0);
