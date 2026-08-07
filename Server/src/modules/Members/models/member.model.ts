import { Schema, model } from "mongoose";

import { WorkspaceRole } from "@/modules/Workspace/enum/workspace-role.enum";

import {
    MemberInterface,
    MemberStatus,
} from "../types/member.types";

const memberSchema = new Schema<MemberInterface>(
    {
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        role: {
            type: String,
            enum: Object.values(WorkspaceRole),
            default: WorkspaceRole.MEMBER,
            required: true,
        },

        status: {
            type: String,
            enum: Object.values(MemberStatus),
            default: MemberStatus.ACTIVE,
            required: true,
        },

        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        joinedAt: {
            type: Date,
            default: Date.now,
        },

        lastActiveAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

memberSchema.index(
    {
        workspaceId: 1,
        userId: 1,
    },
    {
        unique: true,
    }
);

memberSchema.index({
    workspaceId: 1,
    role: 1,
});

memberSchema.index({
    userId: 1,
});

export const MemberModel = model<MemberInterface>(
    "Member",
    memberSchema
);