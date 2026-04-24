import client from "../config/db.js";
export const addSubscriber = async (email)=>{
    const result = await client.query(
        'INSERT INTO subscribers(email) VALUES($1) RETURNING *',
        [email]  );
        return result.rows[0];
}
export const getAllSubscribers = async ()=>{
    const result = await client.query('SELECT * FROM subscribers');
    return result.rows;
}