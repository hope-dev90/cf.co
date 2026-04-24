import { getAllOrders, createOrder, getOrdersByLocation, getOrdersByEmail } from "../models/orders.js";

export const getAllOrder = async (req, res) => {
    try {
        const orders = await getAllOrders();
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const createNewOrder = async (req, res) => {
    try {
        const { name, phone, kgs, location, clientcategory, notes } = req.body;
        const order = await createOrder({ name, phone, kgs, location, clientcategory, notes });
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getOrdersByLoc = async (req, res) => {
    try {
        const { location } = req.params;
        const orders = await getOrdersByLocation(location);
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getOrdersByMail = async (req, res) => {
    try {
        const { email } = req.params;
        const orders = await getOrdersByEmail(email);
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
