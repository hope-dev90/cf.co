import { getAllOrder, createNewOrder, getOrdersByLoc, getOrdersByMail } from "../controllers/ordercont.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";
import { Router } from "express";

const orderRouter = Router();

orderRouter.get("/", authMiddleware, adminOnly, getAllOrder);
orderRouter.post("/create", authMiddleware, createNewOrder);
orderRouter.get("/location/:location", authMiddleware, adminOnly, getOrdersByLoc);
orderRouter.get("/email/:email", authMiddleware, adminOnly, getOrdersByMail);

export default orderRouter;
