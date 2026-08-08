import { Document, model, Schema, Types } from "mongoose";
import { INote } from "../types/note.types";

export interface INoteDocument extends INote, Document {
    createdAt: Date;
    updatedAt: Date;
}

const noteSchema = new Schema<INoteDocument>(
    {
        vaultId: {
            type: Schema.Types.ObjectId,
            ref: "Vault",
            required: true,
            index: true,
        },

        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },

        folderId: {
            type: Schema.Types.ObjectId,
            ref: "Folder",
            default: null,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
            minlength: 1,
        },

        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        icon: {
            type: String,
            default: "📝",
        },

        coverImage: {
            type: String,
            default: "",
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        isPinned: {
            type: Boolean,
            default: false,
        },

        isArchived: {
            type: Boolean,
            default: false,
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

noteSchema.index({
    vaultId: 1,
    folderId: 1,
});

noteSchema.index({
    vaultId: 1,
    slug: 1,
}, {
    unique: true,
    partialFilterExpression: { isDeleted: false },
});

noteSchema.index({
    vaultId: 1,
    isDeleted: 1,
});

noteSchema.index({
    folderId: 1,
    isDeleted: 1,
});

noteSchema.index({
    createdBy: 1,
    isDeleted: 1,
});

const NoteModel = model<INoteDocument>("Note", noteSchema);

export default NoteModel;