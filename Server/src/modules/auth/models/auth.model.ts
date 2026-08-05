import { Schema, model, Document, Types } from "mongoose";


export interface ISession extends Document {
    userId: Types.ObjectId;

    refreshTokenHash: string;

    device?: string;
    ipAddress?: string;
    userAgent?: string;

    lastUsedAt: Date;
    expiresAt: Date;

    revokedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}


const sessionSchema = new Schema<ISession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        refreshTokenHash: {
            type: String,
            required: true,
        },

        device: {
            type: String,
            default: "",
        },

        ipAddress: {
            type: String,
            default: "",
        },

        userAgent: {
            type: String,
            default: "",
        },

        lastUsedAt: {
            type: Date,
            default: Date.now,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);



sessionSchema.index({
    userId: 1,
});



sessionSchema.index(
    {
        expiresAt: 1,
    },
    {
        expireAfterSeconds: 0,
    }
);


const SessionModel = model<ISession>(
    "Session",
    sessionSchema
);


export default SessionModel;