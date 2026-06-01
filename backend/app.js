import authRouter from "./routes/authRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/auth", authRouter);
app.use("/restaurants", restaurantRouter);

export default app;
