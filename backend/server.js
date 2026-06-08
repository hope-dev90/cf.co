import app from "./app.js";
import { connectDB } from "./config/db.js";
import pool from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Run safe incremental migrations on every startup
const runMigrations = async () => {
  const migrations = [
    // waiters extra fields
    `ALTER TABLE waiters ADD COLUMN IF NOT EXISTS staff_role VARCHAR(50) DEFAULT 'waiter'`,
    `ALTER TABLE waiters ADD COLUMN IF NOT EXISTS task TEXT`,
    `ALTER TABLE waiters ADD COLUMN IF NOT EXISTS task_done BOOLEAN DEFAULT false`,
    `ALTER TABLE waiters ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500)`,
    `ALTER TABLE waiters ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`,
    // restaurants extra fields
    `ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`,
    `ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)`,
  ];
  for (const sql of migrations) {
    try {
      await pool.query(sql);
    } catch (e) {
      console.warn("Migration skipped:", e.message);
    }
  }
  console.log("Migrations applied.");
};

connectDB().then(async () => {
    await runMigrations();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});