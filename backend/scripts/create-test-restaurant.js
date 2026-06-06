import pool from "../config/db.js";

const createTestRestaurant = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get the owner user (owner@example.com)
    const ownerResult = await client.query(
      "SELECT id FROM users WHERE email = $1",
      ["owner@example.com"]
    );
    
    if (ownerResult.rows.length === 0) {
      console.log("Owner user not found. Creating owner user...");
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash("owner1234", 10);
      
      const newOwner = await client.query(
        `INSERT INTO users (name, email, password, role, is_verified) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        ["Restaurant Owner", "owner@example.com", hashedPassword, "restaurateur", true]
      );
      ownerResult.rows = newOwner.rows;
    }

    const ownerId = ownerResult.rows[0].id;

    // Check if restaurant already exists
    const existingRestaurant = await client.query(
      "SELECT id FROM restaurants WHERE user_id = $1",
      [ownerId]
    );

    let restaurantId;
    if (existingRestaurant.rows.length > 0) {
      restaurantId = existingRestaurant.rows[0].id;
      console.log("Restaurant already exists, ID:", restaurantId);
    } else {
      // Create restaurant
      const restaurantResult = await client.query(
        `INSERT INTO restaurants (user_id, name, description, cuisine_type, phone, email, website, operating_hours)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          ownerId,
          "Test Bistro",
          "A cozy test restaurant serving delicious food!",
          "International",
          "+1 555 123 4567",
          "contact@testbistro.com",
          "https://testbistro.com",
          JSON.stringify({
            monday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
            tuesday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
            wednesday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
            thursday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
            friday: { isOpen: true, openTime: "09:00", closeTime: "23:00" },
            saturday: { isOpen: true, openTime: "10:00", closeTime: "23:00" },
            sunday: { isOpen: true, openTime: "10:00", closeTime: "21:00" }
          })
        ]
      );
      
      restaurantId = restaurantResult.rows[0].id;
      console.log("Created restaurant with ID:", restaurantId);
    }

    // Create location
    const existingLocation = await client.query(
      "SELECT id FROM restaurant_locations WHERE restaurant_id = $1",
      [restaurantId]
    );
    
    if (existingLocation.rows.length === 0) {
      await client.query(
        `INSERT INTO restaurant_locations (restaurant_id, address, city, state, postal_code, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          restaurantId,
          "123 Test Street",
          "Test City",
          "TS",
          "12345",
          40.7128,
          -74.0060
        ]
      );
      console.log("Created location");
    }

    // Create menu items
    const existingMenu = await client.query(
      "SELECT id FROM menu_items WHERE restaurant_id = $1",
      [restaurantId]
    );
    
    if (existingMenu.rows.length === 0) {
      const menuItems = [
        { name: "Burger", description: "Juicy beef burger with fries", price: 12.99, category: "Main", image_url: null },
        { name: "Pizza", description: "Margherita pizza with fresh basil", price: 14.99, category: "Main", image_url: null },
        { name: "Caesar Salad", description: "Classic Caesar salad", price: 8.99, category: "Starter", image_url: null },
        { name: "Pasta", description: "Creamy carbonara pasta", price: 13.99, category: "Main", image_url: null },
        { name: "Ice Cream", description: "Vanilla ice cream", price: 5.99, category: "Dessert", image_url: null }
      ];

      for (const item of menuItems) {
        await client.query(
          `INSERT INTO menu_items (restaurant_id, name, description, price, category, is_available, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [restaurantId, item.name, item.description, item.price, item.category, true, item.image_url]
        );
      }
      console.log("Created menu items");
    }

    // Create tables
    const existingTables = await client.query(
      "SELECT id FROM restaurant_tables WHERE restaurant_id = $1",
      [restaurantId]
    );
    
    if (existingTables.rows.length === 0) {
      const tables = [
        { table_number: "1", capacity: 2, location_description: "Window", position_x: 12, position_y: 18 },
        { table_number: "2", capacity: 4, location_description: "Main", position_x: 38, position_y: 18 },
        { table_number: "3", capacity: 4, location_description: "Main", position_x: 64, position_y: 18 },
        { table_number: "4", capacity: 2, location_description: "Corner", position_x: 12, position_y: 52 },
        { table_number: "5", capacity: 6, location_description: "Family", position_x: 38, position_y: 52 }
      ];

      for (const table of tables) {
        await client.query(
          `INSERT INTO restaurant_tables (restaurant_id, table_number, capacity, location_description, position_x, position_y, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [restaurantId, table.table_number, table.capacity, table.location_description, table.position_x, table.position_y, true]
        );
      }
      console.log("Created tables");
    }

    await client.query("COMMIT");
    console.log("\n✅ Test restaurant setup complete!");
    console.log("Restaurant ID:", restaurantId);
    console.log("Owner login: owner@example.com / owner1234");
    
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating test restaurant:", error);
  } finally {
    client.release();
    process.exit(0);
  }
};

createTestRestaurant();
