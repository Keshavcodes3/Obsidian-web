import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/common/utils/apiError";
import { envConfig } from "@/config/env";
import { logger } from "@/config/logger";


/**
 * Global error handler middleware.
 *
 * WHY THIS EXISTS:
 * Express only recognizes a middleware as an error handler when it has
 * exactly 4 parameters: (err, req, res, next). This is a framework
 * convention, not a TypeScript feature. If you remove any parameter,
 * Express treats it as a regular middleware and skips it during error
 * propagation.
 *
 * HOW IT WORKS:
 * 1. asyncHandler catches promise rejections and calls next(err)
 * 2. Services throw ApiError instances with structured metadata
 * 3. Express routes the error here via the 4-param signature
 * 4. We normalize ALL error shapes into a single JSON format
 *
 * PRODUCTION CONSIDERATIONS:
 * - We NEVER expose stack traces in production (information leakage)
 * - We distinguish "operational" errors (expected, like 404) from
 *   "programmer" errors (unexpected, like TypeError). Only operational
 *   errors get their real message sent to the client.
 * - Unknown errors always return 500 with a generic message
 * - Every error is logged with Pino for observability
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // --- Handle our own ApiError (the happy path for errors) ---
    if (err instanceof ApiError) {
        logger.error({
            errorCode: err.errorCode,
            statusCode: err.statusCode,
            message: err.message,
            path: req.originalUrl,
            method: req.method,
            ...(err.errors && { errors: err.errors }),
        });

        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode,
            ...(err.errors && { errors: err.errors }),
            ...(envConfig.NODE_ENV === "development" && {
                stack: err.stack,
            }),
        });
        return;
    }


    // --- Handle Mongoose validation errors ---
    // These happen when schema-level validation fails (e.g., required
    // fields, enum mismatches). We transform them into a flat list of
    // field-level errors so the client can display them inline.
    if (err.name === "ValidationError" && "errors" in err) {
        const mongooseErr = err as any;
        const fieldErrors: Record<string, string> = {};

        for (const field of Object.keys(mongooseErr.errors)) {
            fieldErrors[field] = mongooseErr.errors[field].message;
        }

        logger.warn({
            type: "MONGOOSE_VALIDATION",
            path: req.originalUrl,
            fields: Object.keys(fieldErrors),
        });

        res.status(400).json({
            success: false,
            message: "Validation failed",
            errorCode: "VALIDATION_ERROR",
            errors: fieldErrors,
        });
        return;
    }


    // --- Handle Mongoose duplicate key errors ---
    // MongoDB error code 11000 means a unique index was violated.
    // Instead of leaking the raw Mongo error, we return a clean message.
    if ((err as any).code === 11000) {
        const keyValue = (err as any).keyValue || {};
        const field = Object.keys(keyValue)[0] || "field";

        logger.warn({
            type: "DUPLICATE_KEY",
            path: req.originalUrl,
            field,
        });

        res.status(409).json({
            success: false,
            message: `A record with this ${field} already exists`,
            errorCode: "DUPLICATE_KEY",
        });
        return;
    }


    // --- Handle Mongoose CastError (invalid ObjectId, etc.) ---
    if (err.name === "CastError") {
        logger.warn({
            type: "CAST_ERROR",
            path: req.originalUrl,
            message: err.message,
        });

        res.status(400).json({
            success: false,
            message: "Invalid resource identifier",
            errorCode: "INVALID_ID",
        });
        return;
    }


    // --- Catch-all for unknown/programmer errors ---
    // If we reach here, something unexpected happened. In production,
    // we NEVER expose the real error message — it could contain
    // database connection strings, internal paths, or other secrets.
    logger.error({
        type: "UNHANDLED_ERROR",
        name: err.name,
        message: err.message,
        path: req.originalUrl,
        method: req.method,
        stack: err.stack,
    });

    res.status(500).json({
        success: false,
        message:
            envConfig.NODE_ENV === "production"
                ? "An unexpected error occurred"
                : err.message,
        errorCode: "INTERNAL_ERROR",
        ...(envConfig.NODE_ENV === "development" && {
            stack: err.stack,
        }),
    });
};
