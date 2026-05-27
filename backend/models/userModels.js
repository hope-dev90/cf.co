import pool from "../config/db";
export const createUser = async ({ name, email, password, role }) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, role, is_verified, created_at`,
        [name, email, password, role]
    );
    return result.rows[0];
};
export const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};
export const findUserById = async (id) => {
    const result = await pool.query(
        `SELECT id, name, email, role, is_verified
         FROM users WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};
export const getUserByRole = async () => {
    const result = await pool.query(
        `SELECT id, name, email,
         FROM users 
         WHERE role = $1
         ORDER BY name ASC`
    );
    return result.rows;
};