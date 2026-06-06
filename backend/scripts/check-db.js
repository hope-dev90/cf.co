import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const checkDatabase = async () => {
  try {
    console.log("Checking database...");
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log("Users table exists:", tableExists);

    if (!tableExists) {
      console.log("Creating users table...");
      await pool.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255),
          google_id VARCHAR(255) UNIQUE,
          role VARCHAR(50) NOT NULL CHECK (role IN ('client', 'restaurateur', 'admin')),
          is_verified BOOLEAN DEFAULT false,
          otp VARCHAR(6),
          otp_expires TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log("Users table created successfully!");
    }

    // Check existing users
    const usersResult = await pool.query("SELECT id, name, email, role, is_verified FROM users");
    console.log("\nExisting users:", usersResult.rows.length);
    usersResult.rows.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role} - Verified: ${user.is_verified}`);
    });

    // Create test user if none exist
    if (usersResult.rows.length === 0) {
      console.log("\nCreating test user...");
      const hashedPassword = await bcrypt.hash("test1234", 10);
      
      await pool.query(`
        INSERT INTO users (name, email, password, role, is_verified)
        VALUES ($1, $2, $3, $4, $5)
      `, ["Test User", "test@example.com", hashedPassword, "client", true]);
      
      console.log("Test user created!");
      console.log("Email: test@example.com");
      console.log("Password: test1234");
    }

    console.log("\nDatabase check complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error checking database:", error);
    process.exit(1);
  }
};

checkDatabase();
