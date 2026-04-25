import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, showUsers, saveOtp, verifyOtp, deleteUser, clearOtp, markEmailVerified, updatePassword } from "../models/users.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/mailer.js";

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const registerUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser({ email, password: hashedPassword });

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await saveOtp(email, otp, expiresAt);
        await sendVerificationEmail(email, otp);

        return res.status(200).json({ message: "Registered. Check your email for the verification code." });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await verifyOtp(email, otp);
        if (!user) return res.status(400).json({ message: "Invalid or expired code" });

        await markEmailVerified(email);
        await clearOtp(email);

        return res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error('Error verifying email:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        if (!user.is_verified) return res.status(403).json({ message: "Please verify your email first" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await saveOtp(email, otp, expiresAt);
        await sendPasswordResetEmail(email, otp);

        return res.status(200).json({ message: "Password reset code sent to your email" });
    } catch (error) {
        console.error('Error during forgot password:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "email, otp and newPassword are required" });
    }
    try {
        const user = await verifyOtp(email, otp);
        if (!user) return res.status(400).json({ message: "Invalid or expired code" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updatePassword(email, hashedPassword);
        await clearOtp(email);

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error('Error during password reset:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const resendOtp = async (req, res) => {
    const email = req.query.email || req.body.email;
    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.is_verified) return res.status(400).json({ message: "Email already verified" });

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await saveOtp(email, otp, expiresAt);
        await sendVerificationEmail(email, otp);

        return res.status(200).json({ message: "New verification code sent" });
    } catch (error) {
        console.error('Error resending OTP:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await showUsers();
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const deleteUsers = async (req, res) => {
    const { email } = req.body;
    try {
        await deleteUser(email);
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
