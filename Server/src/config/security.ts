import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

import { RequestHandler } from "express";
import { envConfig } from "@/config/env.js";


export const securityMiddleware: RequestHandler[] = [

    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: [
                    "'self'",
                    "data:",
                    "https:",
                ],
                scriptSrc: [
                    "'self'",
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                ],
            },
        },

        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
    }),

    hpp(),


    // CORS
    cors({
        origin: envConfig.CORS_ORIGIN,
        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    }),


    // Global API rate limit
    rateLimit({
        windowMs: envConfig.RATE_LIMIT_WINDOW_MS,

        limit: envConfig.RATE_LIMIT_MAX_REQUESTS,

        standardHeaders: true,

        legacyHeaders: false,

        message: {
            success: false,
            message: "Too many requests, please try again later.",
        },
    }),
];