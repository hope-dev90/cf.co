import { addSubscriber, getAllSubscribers } from "../models/subscribers.js";

export const addNewSubscriber = async (req, res) => {
    const { email } = req.body;
    try {
        const subscriber = await addSubscriber(email);
        return res.status(200).json({ message: "Subscribed successfully", subscriber });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const allSubscribers = async (req, res) => {
    try {
        const subscribers = await getAllSubscribers();
        return res.status(200).json({ subscribers });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
