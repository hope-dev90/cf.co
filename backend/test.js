
import pool from './config/db.js';

async function test() {
  const restaurants = await pool.query('SELECT * FROM restaurants');
  console.log('Restaurants:', restaurants.rows);
  
  const menuItems = await pool.query('SELECT * FROM menu_items');
  console.log('Menu Items:', menuItems.rows);
  
  const users = await pool.query('SELECT * FROM users');
  console.log('Users:', users.rows);
}

test().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
