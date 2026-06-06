import pool from "../config/db.js";

const checkUsers = async () => {
  try {
    const users = await pool.query("SELECT id, name, email, password, google_id FROM users");
    
    console.log("Users with password status:\n");
    users.rows.forEach(user => {
      const hasPassword = !!user.password;
      const hasGoogleId = !!user.google_id;
      console.log(`${user.name} (${user.email}):`);
      console.log(`  - Has password: ${hasPassword}`);
      console.log(`  - Has Google ID: ${hasGoogleId}`);
      console.log();
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkUsers();
