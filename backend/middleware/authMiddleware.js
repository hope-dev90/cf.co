import jwt from "jsonwebtoken";
import { findUserById } from "../models/users.js";


export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};
export const authMiddleware = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await findUserById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid" });
  }
  
};


