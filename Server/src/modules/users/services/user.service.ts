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

}


export default new UserService(userRepo)