import { Schema, model } from "mongoose";

import { WorkspaceRole } from "@/modules/Workspace/enum/workspace-role.enum";

import { type IInvitation, InvitationStatus } from "../Types/invitation.types";

const invitationSchema = new Schema<IInvitation>(
    {
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        role: {
            type: String,
            enum: Object.values(WorkspaceRole),
            default: WorkspaceRole.MEMBER,
            required: true,
        },

        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        status: {
            type: String,
            enum: Object.values(InvitationStatus),
            default: InvitationStatus.PENDING,
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        acceptedAt: {
            type: Date,
        },

        rejectedAt: {
            type: Date,
        },

        cancelledAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

invitationSchema.index(
    {
        workspaceId: 1,
        email: 1,
        status: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            status: InvitationStatus.PENDING,
        },
    }
);

export const InvitationModel = model<IInvitation>(
    "Invitation",
    invitationSchema
);