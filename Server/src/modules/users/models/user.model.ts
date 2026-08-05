import mongoose, { Schema, Document, model } from "mongoose";
import { Profile, UserInterface } from "../types/user.types";
import { UserRole } from "@/modules/auth/enums/user-role.enum";
import { UserStatus } from "@/modules/auth/enums/user-status.enum";
export interface Iuser extends UserInterface, Document {
    createdAt: Date,
    updatedAt: Date
}


const profileSchema = new Schema<Profile>({
    avatar: {
        type: String,
        default: "",
    },
    name: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: ""
    }
})

const userSchema = new Schema<Iuser>({
    username: {
        type: String,
        required: true,
        minLength: 3,
        maxlength: 12
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true

    },
    passwordHash: {
        type: String,
        minLength: 6,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(UserStatus),
        default: UserStatus.ACTIVE,
        requried: true
    },
    emailVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    profile: profileSchema

}, {
    timestamps: true
})

userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ username: 1 })


const UserModel = model<Iuser>("User", userSchema)
export default UserModel
