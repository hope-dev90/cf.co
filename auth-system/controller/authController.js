import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import pool from "../config/db.js";
import { sendOtpEmail } from "../utils/email.js";
import {
  createUser,
  createGoogleUser,
  findUserByEmail,
  findUserById,
  findUserByGoogleId,
  getUserByRole,
  saveOtp,
  verifyOtp,
  clearOtp,
  markEmailVerified,
  updatePassword,
  deleteUser,
  getAllUsers,
} from "../models/userModels.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const getDatabaseErrorMessage = (error) => {
  if (error.code === "42P01") {
    return "Database tables are missing. Set up the users table.";
  }

  if (error.code === "42703") {
    return `Database column is missing: ${error.column || error.message}.`;
  }

  if (error.code === "23505") {
    return "Email already exists";
  }

  return null;
};
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!["client", "restaurateur"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be client, restaurateur",
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await saveOtp(email, otp, expiresAt);

    await sendOtpEmail({
      to: email,
      otp,
      purpose: "verify your email",
    });
    console.log(`Verification OTP sent to ${email}`);

    return res.status(201).json({
      success: true,
      message: "Registration successful! Check your email for OTP",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("register error:", error);
    const databaseMessage = getDatabaseErrorMessage(error);

    if (databaseMessage) {
      return res.status(error.code === "23505" ? 400 : 500).json({
        success: false,
        message: databaseMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await verifyOtp(email, otp);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await markEmailVerified(email);

    await clearOtp(email);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login",
    });
  } catch (error) {
    console.error("verifyEmail error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    const databaseMessage = getDatabaseErrorMessage(error);

    if (databaseMessage) {
      return res.status(500).json({
        success: false,
        message: databaseMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await saveOtp(email, otp, expiresAt);

    await sendOtpEmail({
      to: email,
      otp,
      purpose: "reset your password",
    });
    console.log(`Password reset OTP sent to ${email}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await verifyOtp(email, otp);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updatePassword(email, hashedPassword);

    await clearOtp(email);

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("getAllUsersController error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const googleLogin = async (req, res) => {
  const { credential, role } = req.body;

  try {
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    if (role && !["client", "restaurateur"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be client or restaurateur",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google credentials",
      });
    }

    const googleId = payload.sub;
    let user = await findUserByGoogleId(googleId);

    if (!user) {
      user = await findUserByEmail(payload.email);
      if (user) {
        const result = await pool.query(
          `UPDATE users SET google_id = $1 WHERE email = $2 RETURNING *`,
          [googleId, payload.email],
        );
        user = result.rows[0];
      } else {
        const defaultRole = role || "client";
        user = await createGoogleUser({
          googleId,
          name: payload.name || "Google User",
          email: payload.email,
          role: defaultRole,
        });
      }
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("googleLogin error:", error);
    return res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};
