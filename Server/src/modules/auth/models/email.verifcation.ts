import { Schema, model, Document, Types } from "mongoose";


export interface IEmailVerificationToken extends Document {
    userId: Types.ObjectId;

    tokenHash: string;

    expiresAt: Date;

    usedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}


const emailVerificationTokenSchema =
    new Schema<IEmailVerificationToken>(
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            tokenHash: {
                type: String,
                required: true,
            },

            expiresAt: {
                type: Date,
                required: true,
            },

            usedAt: {
                type: Date,
                default: null,
            },
        },
        {
            timestamps: true,
        }
    );


emailVerificationTokenSchema.index({
    userId: 1,
});


emailVerificationTokenSchema.index(
    {
        expiresAt: 1,
    },
    {
        expireAfterSeconds: 0,
    }
);


const EmailVerificationTokenModel =
    model<IEmailVerificationToken>(
        "EmailVerificationToken",
        emailVerificationTokenSchema
    );


export default EmailVerificationTokenModel;