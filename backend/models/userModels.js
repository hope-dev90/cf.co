import pool from "../config/db.js";
export const createUser = async ({ name, email, password, role }) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, role, is_verified, created_at`,
        [name, email, password, role]
    );
    return result.rows[0];
};

export const createGoogleUser = async ({ googleId, name, email, role }) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, role, google_id, is_verified) 
         VALUES ($1, $2, $3, $4, true) 
         RETURNING id, name, email, role, is_verified, created_at`,
        [name, email, role, googleId]
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

export const findUserByGoogleId = async (googleId) => {
    const result = await pool.query(`SELECT * FROM users WHERE google_id = $1`, [
        googleId
    ]);
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
export const getUserByRole = async (role) => {
    const result = await pool.query(
        `SELECT id, name, email
         FROM users 
         WHERE role = $1
         ORDER BY name ASC`,
        [role]
    );
    return result.rows;
};
export const getAllUsers = async () => {
    const result = await pool.query(
        `SELECT id, name, email, role, is_verified, created_at
         FROM users 
         ORDER BY created_at DESC`
    );
    return result.rows;
};

export const deleteUserById = async (id) => {
    const result = await pool.query(
        `DELETE FROM users WHERE id = $1 RETURNING id`,
        [id]
    );
    return result.rows[0];
};
export const saveOtp = async (email, otp, expiresAt) => {
    await pool.query(
        `UPDATE users 
         SET otp = $1::text, otp_expires = $2::timestamptz 
         WHERE email = $3`,
        [otp, expiresAt, email]
    );
};

export const verifyOtp = async (email, otp) => {
    const result = await pool.query(
        `SELECT * FROM users 
         WHERE email = $1 
         AND otp = $2::text 
         AND otp_expires > NOW()`,
        [email, otp]
    );
    return result.rows[0];
};
export const clearOtp = async (email) => {
    await pool.query(
        `UPDATE users 
         SET otp = NULL, otp_expires = NULL 
         WHERE email = $1`,
        [email]
    );
};
export const markEmailVerified = async (email) => {
    await pool.query(
        `UPDATE users SET is_verified = true WHERE email = $1`,
        [email]
    );
};
export const updatePassword = async (email, hashedPassword) => {
    await pool.query(
        `UPDATE users SET password = $1 WHERE email = $2`,
        [hashedPassword, email]
    );
};
export const deleteUser = async (email) => {
    await pool.query(
        `DELETE FROM users WHERE email = $1`,
        [email]
    );
};