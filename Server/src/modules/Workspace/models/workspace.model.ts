import { Schema, model, Document } from "mongoose";

import {
    WorkspaceInterface,
    WorkspaceMember,
    WorkspaceSettings,
} from "../types/workspace.types";

import { WorkspaceRole } from "../enum/workspace-role.enum";
import { WorkspaceVisibility } from "../enum/workspace-visibility.enum";
export interface IWorkspace extends WorkspaceInterface, Document {
    createdAt: Date;
    updatedAt: Date;
}

const workspaceMemberSchema = new Schema<WorkspaceMember>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        role: {
            type: String,
            enum: Object.values(WorkspaceRole),
            default: WorkspaceRole.MEMBER,
        },

        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: false,
    }
);

const workspaceSettingsSchema = new Schema<WorkspaceSettings>(
    {
        allowInvites: {
            type: Boolean,
            default: true,
        },

        defaultVaultName: {
            type: String,
            default: "My Vault",
        },
    },
    {
        _id: false,
    }
);

const workspaceSchema = new Schema<IWorkspace>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 100,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            maxlength: 500,
        },

        visibility: {
            type: String,
            enum: Object.values(WorkspaceVisibility),
            default: WorkspaceVisibility.PRIVATE,
        },

        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        members: {
            type: [workspaceMemberSchema],
            default: [],
        },

        settings: {
            type: workspaceSettingsSchema,
            default: () => ({}),
        },
    },
    {
        timestamps: true,
    }
);


workspaceSchema.index({ slug: 1 }, { unique: true });
workspaceSchema.index({ ownerId: 1 });
workspaceSchema.index({ "members.userId": 1 });

export const WorkspaceModel = model<IWorkspace>(
    "Workspace",
    workspaceSchema
);