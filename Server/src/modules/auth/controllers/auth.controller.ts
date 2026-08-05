import { Request, Response } from "express";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { ApiSuccess } from "@/common/utils/apiSuccess";
import authService from "../services/auth.service";
import { envConfig } from "@/config/env";

/**
 * Authentication Controller.
 * 
 * WHY THIS EXISTS:
 * This layer is strictly for HTTP concerns (parsing requests, setting cookies, returning responses).
 * Business logic belongs in the service layer.
 */
class AuthController {
    
    // Cookie options used for refresh token
    private getRefreshTokenCookieOptions() {
        return {
            httpOnly: true, // Prevents XSS attacks (JS cannot read this cookie)
            secure: envConfig.COOKIE_SECURE, // True in production (HTTPS only)
            sameSite: envConfig.COOKIE_SAME_SITE, // Protects against CSRF
            domain: envConfig.COOKIE_DOMAIN || undefined,
            path: "/api/v1/auth/refresh", // Only send this cookie on the refresh endpoint
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        };
    }

    login = asyncHandler(async (req: Request, res: Response) => {
        // Collect device info (useful for session management/security logs)
        const deviceInfo = {
            ipAddress: req.ip || req.headers["x-forwarded-for"] as string || "",
            userAgent: req.headers["user-agent"] || "",
        };

        const result = await authService.loginService(req.body, deviceInfo);

        // Set the refresh token as an HTTP-only cookie
        res.cookie(
            "refreshToken",
            result.refreshToken,
            this.getRefreshTokenCookieOptions()
        );

        return res.status(200).json(new ApiSuccess({
            message: "User logged in successfully",
            data: {
                user: result.user,
                accessToken: result.accessToken,
                // We do NOT return the refreshToken in the JSON body,
                // it is safely stored in the HTTP-only cookie.
            }
        }));
    });

    verifyEmail = asyncHandler(async (req: Request, res: Response) => {
        await authService.verifyEmailService(req.body);

        return res.status(200).json(
            new ApiSuccess({
                message: "Email verified successfully",
                data: null,
            })
        );
    });

    refreshSession = asyncHandler(async (req: Request, res: Response) => {
        // Retrieve the refresh token from cookies
        const oldRefreshToken = req.cookies?.refreshToken;
        
        const deviceInfo = {
            ipAddress: req.ip || req.headers["x-forwarded-for"] as string || "",
            userAgent: req.headers["user-agent"] || "",
        };

        const result = await authService.refreshSession(oldRefreshToken, deviceInfo);

        // Set the NEW refresh token
        res.cookie(
            "refreshToken",
            result.refreshToken,
            this.getRefreshTokenCookieOptions()
        );

        return res.status(200).json(new ApiSuccess({
            message: "Session refreshed successfully",
            data: {
                accessToken: result.accessToken,
            }
        }));
    });

    logout = asyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.cookies?.refreshToken;

        await authService.logoutService(refreshToken);

        // Clear the cookie
        res.clearCookie("refreshToken", {
            ...this.getRefreshTokenCookieOptions(),
            maxAge: 0,
        });

        return res.status(200).json(new ApiSuccess({
            message: "Logged out successfully",
            data: null,
        }));
    });
}

export default new AuthController();
