import jwt from "jsonwebtoken";
import crypto from "crypto";
import { envConfig } from "@/config/env";

/**
 * Token generation utility.
 * 
 * WHY THIS EXISTS:
 * Separates token generation logic from the service layer.
 * 
 * HOW IT WORKS:
 * Access tokens are short-lived JWTs.
 * Refresh tokens are opaque cryptographic strings (not JWTs), stored hashed in the DB.
 */
export const generateAccessToken = (payload: { userId: string; role: string; email: string }) => {
    return jwt.sign(
        payload,
        envConfig.JWT_ACCESS_SECRET,
        { expiresIn: envConfig.JWT_ACCESS_EXPIRES_IN }
    );
};

export const generateRefreshToken = () => {
    // Generate a secure 64-byte hex string
    const token = crypto.randomBytes(64).toString("hex");
    
    // Hash it before storing in DB (so if DB leaks, refresh tokens can't be used)
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    
    return { token, hash };
};

export const hashToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};
