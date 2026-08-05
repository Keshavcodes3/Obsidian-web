import { Schema, model, Document, Types } from "mongoose";


export interface IPasswordResetToken extends Document {
    userId: Types.ObjectId;

    tokenHash: string;

    expiresAt: Date;

    usedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}


const passwordResetTokenSchema =
    new Schema<IPasswordResetToken>(
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


passwordResetTokenSchema.index({
    userId: 1,
});


passwordResetTokenSchema.index(
    {
        expiresAt: 1,
    },
    {
        expireAfterSeconds: 0,
    }
);


const PasswordResetTokenModel =
    model<IPasswordResetToken>(
        "PasswordResetToken",
        passwordResetTokenSchema
    );


export default PasswordResetTokenModel;