import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(12, "Username cannot exceed 12 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
    token: z.string().min(1, "Token is required"),
    otp: z.number().int().min(100000, "Invalid OTP").max(999999, "Invalid OTP"),
});
