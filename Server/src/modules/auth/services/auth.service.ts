import { ApiError } from "@/common/utils/apiError";
import { LoginDto } from "@/modules/users/dtos/Login.dto";
import userRepo from "@/modules/users/repositories/user.repo";
import sessionRepository from "../repositories/session.repository";
import { comparePassword } from "@/modules/users/utils/comparePassword";
import { UserStatus } from "../enums/user-status.enum";
import { generateAccessToken, generateRefreshToken, hashToken } from "../utils/token.util";
import { Types } from "mongoose";
import dayjs from "dayjs";
import { envConfig } from "@/config/env";

class AuthService {
    loginService = async (
        payload: LoginDto,
        deviceInfo?: { ipAddress?: string; userAgent?: string; device?: string }
    ) => {
        const { email, password } = payload;

        const user = await userRepo.findByEmail(email);

        if (!user) {
            throw new ApiError({
                statusCode: 401,
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await comparePassword(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            throw new ApiError({
                statusCode: 401,
                message: "Invalid email or password",
            });
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new ApiError({
                statusCode: 403,
                message: "Account is not active",
            });
        }

        if (!user.emailVerified) {
            throw new ApiError({
                statusCode: 403,
                message: "Please verify your email first",
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        });

        const { token: refreshToken, hash: refreshTokenHash } = generateRefreshToken();

        // Calculate expiration date for session (default 7 days if not defined properly)
        // You could parse envConfig.JWT_REFRESH_EXPIRES_IN, but let's assume 7 days for now.
        const expiresAt = dayjs().add(7, 'day').toDate();

        // Create session
        const session = await sessionRepository.create({
            userId: user._id as Types.ObjectId,
            refreshTokenHash,
            device: deviceInfo?.device || "",
            ipAddress: deviceInfo?.ipAddress || "",
            userAgent: deviceInfo?.userAgent || "",
            expiresAt,
        });

        return {
            user: {
                userId: user._id,
                email: user.email,
                username: user.username,
                profile: user.profile,
            },
            accessToken,
            refreshToken,
        };
    };

    refreshSession = async (
        oldRefreshToken: string,
        deviceInfo?: { ipAddress?: string; userAgent?: string; device?: string }
    ) => {
        if (!oldRefreshToken) {
            throw new ApiError({ statusCode: 401, message: "Refresh token is missing" });
        }

        const refreshTokenHash = hashToken(oldRefreshToken);
        const session = await sessionRepository.findByRefreshTokenHash(refreshTokenHash);

        if (!session) {
            throw new ApiError({ statusCode: 401, message: "Invalid refresh token" });
        }

        if (session.revokedAt) {
            throw new ApiError({ statusCode: 401, message: "Session has been revoked" });
        }

        if (dayjs().isAfter(session.expiresAt)) {
            throw new ApiError({ statusCode: 401, message: "Session expired" });
        }

        const user = await userRepo.findById(session.userId.toString());

        if (!user || user.status !== UserStatus.ACTIVE) {
            throw new ApiError({ statusCode: 401, message: "User is not active" });
        }

        // Generate new tokens (Rotation)
        const accessToken = generateAccessToken({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        });

        const { token: newRefreshToken, hash: newRefreshTokenHash } = generateRefreshToken();
        const expiresAt = dayjs().add(7, 'day').toDate();

        // Update the current session
        await sessionRepository.updateById(session._id.toString(), {
            refreshTokenHash: newRefreshTokenHash,
            expiresAt,
            lastUsedAt: new Date(),
            ipAddress: deviceInfo?.ipAddress || session.ipAddress,
            userAgent: deviceInfo?.userAgent || session.userAgent,
        });

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    };

    logoutService = async (refreshToken: string) => {
        if (!refreshToken) return;
        
        const refreshTokenHash = hashToken(refreshToken);
        const session = await sessionRepository.findByRefreshTokenHash(refreshTokenHash);
        
        if (session) {
            await sessionRepository.revokeSession(session._id.toString());
        }
    };

    verifyEmailService = async (payload: {
        otp: number;
        token: string;
    }) => {
        let decoded: { userId: string; email: string };
        const jwt = require("jsonwebtoken");
        try {
            decoded = jwt.verify(
                payload.token,
                envConfig.JWT_ACCESS_SECRET
            ) as { userId: string; email: string };
        } catch {
            throw new ApiError({
                statusCode: 401,
                message: "Invalid or expired verification token",
            });
        }

        const user = await userRepo.findById(decoded.userId);

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }

        if (user.emailVerified) {
            throw new ApiError({
                statusCode: 400,
                message: "Email already verified",
            });
        }

        const redis = require("@/config/redis").default;
        const storedOtp = await redis.get(`otp:${decoded.email}`);

        if (!storedOtp) {
            throw new ApiError({
                statusCode: 400,
                message: "OTP expired",
            });
        }

        if (storedOtp !== payload.otp.toString()) {
            throw new ApiError({
                statusCode: 400,
                message: "Invalid OTP",
            });
        }

        user.emailVerified = true;
        await user.save();
        await redis.del(`otp:${decoded.email}`);

        return true;
    };
}

export default new AuthService();
