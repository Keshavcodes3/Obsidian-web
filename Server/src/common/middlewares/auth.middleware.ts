import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError";
import { envConfig } from "@/config/env";

/**
 * Authentication Middleware.
 * 
 * WHY THIS EXISTS:
 * Protects private routes. It extracts the JWT access token from the Authorization header,
 * verifies it using the secret, and attaches the decoded user context to the request object.
 * 
 * HOW IT WORKS:
 * 1. Looks for the "Bearer <token>" in the Authorization header.
 * 2. If missing, throws 401 Unauthorized.
 * 3. Uses jsonwebtoken to verify the token signature and expiration.
 * 4. If invalid/expired, throws 401 Unauthorized.
 * 5. On success, populates req.user and calls next().
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication token is missing or invalid",
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, envConfig.JWT_ACCESS_SECRET) as {
            userId: string;
            role: string;
            email: string;
        };

        // Attach to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(new ApiError({
                statusCode: 401,
                message: "Access token has expired",
                errorCode: "TOKEN_EXPIRED"
            }));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new ApiError({
                statusCode: 401,
                message: "Invalid access token",
                errorCode: "INVALID_TOKEN"
            }));
        } else {
            next(error);
        }
    }
};
