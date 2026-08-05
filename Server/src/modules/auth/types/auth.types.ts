import type { UserStatus } from "../enums/user-status.enum";
import type { UserRole } from "../enums/user-role.enum";


export interface AuthenticatedUser {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
}


export interface AuthContext {
    user: AuthenticatedUser;
    sessionId: string;
}


export interface LoginResult {
    user: AuthenticatedUser;
    accessToken: string;
    refreshToken: string;
}


export interface RegisterResult {
    user: AuthenticatedUser;
    verificationRequired: boolean;
}


export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}