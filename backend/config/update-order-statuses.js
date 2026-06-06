import pool from './db.js';

const runUpdate = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to database');
    
    // Drop old constraint
    await client.query(`
      ALTER TABLE restaurant_orders 
      DROP CONSTRAINT restaurant_orders_status_check
    `);
    console.log('Dropped old status constraint');
    
    // Add new constraint
    await client.query(`
      ALTER TABLE restaurant_orders 
      ADD CONSTRAINT restaurant_orders_status_check 
      CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'served', 'completed', 'cancelled'))
    `);
    console.log('Added new status constraint');
    
    client.release();
    console.log('Update complete');
    process.exit(0);
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
};

runUpdate();
