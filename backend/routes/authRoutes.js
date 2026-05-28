import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getAllUsersController,
  getProfile,
  verifyEmail,
} from "../controller/authController.js";
import { authMiddleware } from "../middleware/authMiddleWare.js";
import express from "express";
const authRouter = express.Router();
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/profile", authMiddleware, getProfile);
authRouter.post("/verify-email", verifyEmail);
authRouter.get("/users", authMiddleware, getAllUsersController);
export default authRouter;
