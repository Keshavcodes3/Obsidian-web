import { ApiError } from "@/common/utils/apiError";
import { RegisterDto } from "../dtos/Register.dto";
import userRepo from "../repositories/user.repo";
import { UserRole } from "@/modules/auth/enums/user-role.enum";
import { hashPassword } from "../utils/hashPassword";
import { eventBus } from "@/common/events";
import { UserCreatedEvent } from "../types/user.types";
import { USER_EVENTS } from "@/common/events/EventTypes";
import redis from "@/config/redis";
import { emailVerifyQueue } from "@/common/Bull/Verify-email/queue";
import { LoginDto } from "../dtos/Login.dto";
import { comparePassword } from "../utils/comparePassword";
import { UserStatus } from "@/modules/auth/enums/user-status.enum";
import jwt from 'jsonwebtoken'
import { envConfig } from "@/config/env";
class UserService {

    constructor(private readonly userRepository: typeof userRepo) { }


    registerUserService = async (
        payload: RegisterDto
    ) => {

        const existingUser =
            await this.userRepository.findByEmail(
                payload.email
            );

        if (existingUser) {
            throw new ApiError({
                statusCode: 409,
                message: "User already exists"
            });
        }


        const hashedPassword =
            await hashPassword(payload.password);


        const user =
            await this.userRepository.create({
                ...payload,
                passwordHash: hashedPassword,
                role: UserRole.USER,
            });

        if (!user) {
            throw new ApiError({
                statusCode: 400,
                message: "User couldn't created"
            });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        await redis.set(
            `otp:${user.email}`,
            otp,
            "EX",
            300
        );
        await emailVerifyQueue.add("email-verif", {
            email: user.email,
            otp,
        });
        //fire and event and catch
        eventBus.publish<UserCreatedEvent>(
            USER_EVENTS.userCreated, {
            userId: user._id.toString(),
            email: user.email,
            username: user.username
        })


        return user;
    }

    loginService = async (payload: LoginDto) => {
        const { email, password } = payload;

        const user = await this.userRepository.findByEmail(email);

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



        return user;
    };

    verifyEmailService = async (payload: {
        otp: number;
        token: string;
    }) => {

        let decoded: { userId: string; email: string };

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

        const user = await this.userRepository.findById(decoded.userId);

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


export default new UserService(userRepo)