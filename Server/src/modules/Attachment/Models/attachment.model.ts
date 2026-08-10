import { Document, Schema, Types, model } from "mongoose";
import { IAttachment } from "../Types/attachment.types";

export interface IAttachmentI extends IAttachment, Document {
    createdAt: Date;
    updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachmentI>(
    {
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },

        vaultId: {
            type: Schema.Types.ObjectId,
            ref: "Vault",
            required: true,
            index: true,
        },

        noteId: {
            type: Schema.Types.ObjectId,
            ref: "Note",
            default: null,
            index: true,
        },

        blockId: {
            type: Schema.Types.ObjectId,
            ref: "Block",
            default: null,
            index: true,
        },

        storageKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },

        storageProvider: {
            type: String,
            enum: ["imagekit"],
            required: true,
            default: "imagekit",
            index: true,
        },

        imageKitFileId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },

        url: {
            type: String,
            required: true,
            trim: true,
        },

        originalFilename: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255,
        },

        mimeType: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },

        size: {
            type: Number,
            required: true,
            min: 0,
        },
        folderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        order: {
            type: Number,
            default: 0,
            required: true,
            index: true
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

attachmentSchema.index({
    blockId: 1,
    isDeleted: 1,
});

attachmentSchema.index({
    noteId: 1,
    isDeleted: 1,
});


attachmentSchema.index({
    workspaceId: 1,
    isDeleted: 1,
});


attachmentSchema.index({
    vaultId: 1,
    isDeleted: 1,
});

const AttachmentModel = model<IAttachmentI>(
    "Attachment",
    attachmentSchema
);

export default AttachmentModel;