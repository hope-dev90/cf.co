import client from "../config/db.js";

export const getAllOrders = async () => {
 const result = await client.query(
    `SELECT * FROM orders`,
 )
};
export const createOrder = async (orderData)=>{
    const {
        name,
        phone,
        kgs,
        location,
        clientcategory,
        notes
    } = orderData;
    const result = await client.query(
        `INSERT INTO orders(name,phone,kgs,location,clientcategory,notes)
        VALUES($1,$2,$3,$4,$5,$6)
        RETURNING *`,
        [name,phone,kgs,location,clientcategory,notes]
    )
    return result.rows[0];  
}
export const getOrdersByLocation = async(location)=>{
    const result = 
        await client.query(
            `SELECT * FROM orders WHERE location = $1`,
            [location]
        )
    return result.rows;
}
export const getOrdersByEmail = async (email)=>{
    
    const result = await client.query(
        `SELECT * FROM orders WHERE email = $1`,
        [email])
        return result.rows;
    

}