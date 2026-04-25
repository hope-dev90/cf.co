import { registerUser, loginUser, getAllUsers, deleteUsers, verifyEmail, forgotPassword, resetPassword, resendOtp } from "../controllers/auth.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";
import { Router } from "express";

const router = Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.get("/resend-otp", resendOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/getAllUsers", authMiddleware, adminOnly, getAllUsers);
router.get("/deleteUser",authMiddleware,adminOnly,deleteUsers);

export default router;
