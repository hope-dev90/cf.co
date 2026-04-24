import client from "../config/db.js";

export const createUser = async(userData)=>{
    const{
        email,
        password
    } = userData;

    const result = await client.query( 
        `INSERT INTO users (email,password) VALUES($1,$2) RETURNING *`,
        [email,password]
    );
    return result.rows[0];
};

export const findUserByEmail = async(email) =>{
    const result = await client.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};  
export const showUsers = async () =>{
    
    const result = await client.query(`SELECT * FROM users`);

    return result.rows;

};
export const findUserById = async (id) => {
  const result = await client.query(
    "SELECT id, email, role FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const saveOtp = async (email, otp, expiresAt) => {
    await client.query(
        `UPDATE users SET otp = $1::text, otp_expires = $2::timestamptz WHERE email = $3`,
        [otp, expiresAt, email]
    );
};

export const verifyOtp = async (email, otp) => {
    const result = await client.query(
        `SELECT * FROM users WHERE email = $1 AND otp = $2::text AND otp_expires > NOW()`,
        [email, otp]
    );
    return result.rows[0];
};

export const clearOtp = async (email) => {
    await client.query(
        `UPDATE users SET otp = NULL, otp_expires = NULL WHERE email = $1`,
        [email]
    );
};

export const markEmailVerified = async (email) => {
    await client.query(
        `UPDATE users SET is_verified = true WHERE email = $1`,
        [email]
    );
};

export const updatePassword = async (email, hashedPassword) => {
    await client.query(
        `UPDATE users SET password = $1 WHERE email = $2`,
        [hashedPassword, email]
    );
};
