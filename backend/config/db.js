import pkg from 'pg';
const { Pool } = pkg;

let pool;

export const connectDB = async () => {
    pool = new Pool({
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: Number(process.env.PG_PORT),
    });

    try {
        await pool.query('SELECT 1');
        console.log("🐘 PostgreSQL connected successfully");
    } catch (err) {
        console.error("❌ PostgreSQL connection error: ", err);
    }
};

export default { query: (...args) => pool.query(...args) };
