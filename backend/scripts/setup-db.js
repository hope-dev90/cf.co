import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configDir = path.join(__dirname, "..", "config");

const migrationFiles = [
  "complete-setup.sql",
  "update-role-constraint.sql",
  "update-add-google-id.sql",
  "update-database.sql",
  "update-table-availability.sql",
];

const sanitizeSql = (sql) =>
  sql
    .replace(/^\s*CREATE DATABASE.*$/gim, "")
    .replace(/^\s*\\c.*$/gim, "")
    .trim();

const runSqlFile = async (filePath) => {
  const sql = sanitizeSql(fs.readFileSync(filePath, "utf8"));
  if (!sql) {
    return;
  }

  await pool.query(sql);
};

const setupDatabase = async () => {
  try {
    for (const file of migrationFiles) {
      const filePath = path.join(configDir, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`Skipping missing migration: ${file}`);
        continue;
      }

      console.log(`Running ${file}...`);
      await runSqlFile(filePath);
    }

    console.log("Database setup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Database setup failed:", error.message);
    process.exit(1);
  }
};

setupDatabase();
