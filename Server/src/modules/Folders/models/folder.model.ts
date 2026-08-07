import mongoose, { Document, Schema, model } from "mongoose";

import { IFolder } from "../types/folder.types";


const FolderSchema = new Schema<IFolder>(
    {
        vaultId: {
            type: Schema.Types.ObjectId,
            ref: "Vault",
            required: true,
            index: true,
        },

        parentFolderId: {
            type: Schema.Types.ObjectId,
            ref: "Folder",
            default: null,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            trim: true,
        },

        color: {
            type: String,
            default: "#808080",
        },

        icon: {
            type: String,
            default: "Folder",
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

FolderSchema.index(
    {
        vaultId: 1,
        parentFolderId: 1,
        name: 1,
    },
    {
        unique: true,
    }
);

// Fast lookup by slug
FolderSchema.index({
    vaultId: 1,
    slug: 1,
});

export const FolderModel = model<IFolder>(
    "Folder",
    FolderSchema
);