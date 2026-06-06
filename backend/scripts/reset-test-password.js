import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const resetPassword = async () => {
  try {
    const testEmail = "test@example.com";
    
    // Check if test user exists, if not create
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [testEmail]);
    
    if (existing.rows.length === 0) {
      console.log("Creating test user...");
      const hashedPassword = await bcrypt.hash("test1234", 10);
      await pool.query(`
        INSERT INTO users (name, email, password, role, is_verified)
        VALUES ($1, $2, $3, $4, $5)
      `, ["Test User", testEmail, hashedPassword, "client", true]);
    } else {
      console.log("Updating test user password...");
      const hashedPassword = await bcrypt.hash("test1234", 10);
      await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, testEmail]);
    }
    
    console.log("\n✅ Test user ready!");
    console.log("Email: test@example.com");
    console.log("Password: test1234");
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

resetPassword();
