import authRouter from "./routes/authRoutes.js";
import express from "express";
const app = express();
app.use(express.json());
app.use("/auth", authRouter);

export default app;
