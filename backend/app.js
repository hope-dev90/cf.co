import authRouter from "./routes/authRoutes";
import express from "express";
const app = express();
app.get('/auth',authRouter);

export default app;