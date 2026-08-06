import { Schema, model, Document } from "mongoose";

import {
    VaultInterface,
    VaultSettings,
} from "../types/vault.types";

export interface IVault extends VaultInterface, Document {
    createdAt: Date;
    updatedAt: Date;
}

const vaultSettingsSchema = new Schema<VaultSettings>(
    {
        allowAttachments: {
            type: Boolean,
            default: true,
        },

        allowWikiLinks: {
            type: Boolean,
            default: true,
        },
    },
    {
        _id: false,
    }
);

const vaultSchema = new Schema<IVault>(
    {
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        coverImage: {
            type: String,
            default: "",
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            maxlength: 500,
        },

        icon: {
            type: String,
            default: "📁",
        },

        color: {
            type: String,
            default: "#6366F1",
        },

        isDefault: {
            type: Boolean,
            default: false,
        },

        settings: {
            type: vaultSettingsSchema,
            default: () => ({}),
        },
    },
    {
        timestamps: true,
    }
);


vaultSchema.index(
    {
        workspaceId: 1,
        slug: 1,
    },
    {
        unique: true,
    }
);

vaultSchema.index({
    workspaceId: 1,
});

export const VaultModel = model<IVault>(
    "Vault",
    vaultSchema
);