import authRouter from "./routes/authRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import express from "express";
const app = express();
app.use(express.json());
app.use("/auth", authRouter);
app.use("/restaurants", restaurantRouter);

export default app;
