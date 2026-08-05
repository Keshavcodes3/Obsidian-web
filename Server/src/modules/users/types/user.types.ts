import { UserRole } from "@/modules/auth/enums/user-role.enum";
import { UserStatus } from "@/modules/auth/enums/user-status.enum";
import { Types } from "mongoose";

export interface Profile {
    avatar?: string
    name?: string,
    bio?: string,
    timezone?: string,
}


export interface UserInterface {
    role: UserRole,
    status: UserStatus
    username: string,
    email: string,
    passwordHash: string,
    emailVerified: boolean,
    profile: Profile
}

export interface UserCreatedEvent {
    userId: string;
    email: string;
    username: string;
}