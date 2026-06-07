import authRouter from "./routes/authRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: /^http:\/\/localhost(:\d+)?$/, credentials: true }));
app.use(express.json());
app.use("/auth", authRouter);
app.use("/restaurants", restaurantRouter);
app.use("/upload", uploadRouter);
app.use("/uploads", express.static("uploads"));

export default app;
