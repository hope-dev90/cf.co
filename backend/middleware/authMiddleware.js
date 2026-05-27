import jwt from 'jsonwebtoken';
import { findUserById } from '../models/userModels.js';

export const authMiddleware = async (req, res, next) => {
    let token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized'
        });
    }

    try {
        token = token.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await findUserById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        next();

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token invalid'
        });
    }
};

export const restaurateurOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized'
        });
    }

    if (req.user.role !== 'restaurateur') {
        return res.status(403).json({
            success: false,
            message: 'Mentors only'
        });
    }

    next();
};

// ─── Admin only ───────────────────────────────────────────────
export const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access only'
        });
    }

    next();
};

// ─── Mentor or Girl (both allowed) ────────────────────────────
export const userOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized'
        });
    }

    if (!['girl', 'mentor'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized'
        });
    }

    next();
};