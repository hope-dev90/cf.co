import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendOtpEmail } from "../utils/email.js";
import { OAuth2Client } from "google-auth-library";
import pool from "../config/db.js";
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

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const isDevEnvironment = () => process.env.NODE_ENV !== "production";

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage",
);

export const googleLogin = async (req, res) => {
  const { credential, role } = req.body;

  try {
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    if (
      role &&
      !["client", "restaurateur", "restaurant_owner"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || "User";

    // Check if user exists by Google ID first
    let user = await findUserByGoogleId(googleId);

    if (!user) {
      // Check if user exists by email
      user = await findUserByEmail(email);

      if (user) {
        // Link Google ID to existing user
        const result = await pool.query(
          `UPDATE users SET google_id = $1 WHERE email = $2 RETURNING *`,
          [googleId, email],
        );
        user = result.rows[0];
      } else {
        // Create new user with Google
        let normalizedRole = role || "client";
        if (normalizedRole === "restaurant_owner") {
          normalizedRole = "restaurateur";
        }

        user = await createGoogleUser({
          googleId,
          name,
          email,
          role: normalizedRole,
        });
      }
    }

    if (!user.is_verified) {
      await markEmailVerified(email);
    }

    const token = generateToken(user.id, user.role);

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
    if (error.message && error.message.includes("Token used too late")) {
      return res.status(400).json({
        success: false,
        message: "Google token expired",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};
const getDatabaseErrorMessage = (error) => {
  if (error.code === "42P01") {
    return "Database tables are missing. Run npm run db:setup, then try again.";
  }

  if (error.code === "42703") {
    return `Database column is missing: ${error.column || error.message}. Run npm run db:setup, then try again.`;
  }

  if (error.code === "23505") {
    return "Email already exists";
  }

  if (error.code === "23514") {
    return "Invalid role. Run npm run db:setup to update the database schema, then try again.";
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

    const normalizedEmail = normalizeEmail(email);

    // Map "restaurant_owner" to "restaurateur" for consistency
    let normalizedRole = role;
    if (role === "restaurant_owner") {
      normalizedRole = "restaurateur";
    }

    if (!["client", "restaurateur"].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Role must be client or restaurateur",
      });
    }

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
    });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await saveOtp(normalizedEmail, otp, expiresAt);

    let emailSent = false;
    try {
      emailSent = await sendOtpEmail({
        to: normalizedEmail,
        otp,
        purpose: "verify your email",
      });
    } catch (emailError) {
      console.error("register email error:", emailError);
    }

    const readyToSignIn = !emailSent || isDevEnvironment();
    if (readyToSignIn) {
      await markEmailVerified(normalizedEmail);
      await clearOtp(normalizedEmail);
    }

    return res.status(201).json({
      success: true,
      message: readyToSignIn
        ? "Registration successful! Your account is ready to use. You can sign in now."
        : "Registration successful! Check your email for the verification code.",
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

export const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
      });
    }

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await saveOtp(normalizedEmail, otp, expiresAt);

    let emailSent = false;
    try {
      emailSent = await sendOtpEmail({
        to: normalizedEmail,
        otp,
        purpose: "verify your email",
      });
    } catch (emailError) {
      console.error("resendOtp email error:", emailError);
    }

    if (!emailSent || isDevEnvironment()) {
      await markEmailVerified(normalizedEmail);
      await clearOtp(normalizedEmail);
      return res.status(200).json({
        success: true,
        message: "Your account is ready to use. You can sign in now.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "New verification code sent",
    });
  } catch (error) {
    console.error("resendOtp error:", error);
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

    const normalizedEmail = normalizeEmail(email);
    const user = await verifyOtp(normalizedEmail, otp);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await markEmailVerified(normalizedEmail);

    await clearOtp(normalizedEmail);

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

    console.log("Login attempt:", { email: email ? email.substring(0, 20) + '...' : 'missing', password: password ? 'provided' : 'missing' });

    try {
        if (!email || !password) {
            console.log("Missing email or password");
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const normalizedEmail = normalizeEmail(email);
        console.log("Normalized email:", normalizedEmail);
        
        const user = await findUserByEmail(normalizedEmail);
        console.log("Found user:", user ? { id: user.id, email: user.email, name: user.name } : 'NO USER FOUND');
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        if (!user.is_verified) {
            if (isDevEnvironment()) {
                await markEmailVerified(normalizedEmail);
                user.is_verified = true;
                console.log("Auto-verified user in dev mode");
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Please verify your email first",
                    requiresVerification: true,
                });
            }
        }

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "This account uses Google sign-in. Please log in with Google.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);
        
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const token = generateToken(user.id, user.role);

        console.log("Login successful for user:", user.email);

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
    const users = await getAllUsers(req.user.id);
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
