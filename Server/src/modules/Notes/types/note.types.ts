import { Types } from "mongoose";

export interface INote {
    vaultId: Types.ObjectId;
    folderId?: Types.ObjectId | null;
    workspaceId: Types.ObjectId;
    title: string;
    slug: string;

    icon?: string;
    coverImage?: string;

    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;

    isPinned: boolean;
    isArchived: boolean;
    isDeleted: boolean;
}

export interface CreateNoteDTO {
    vaultId: Types.ObjectId;
    folderId?: Types.ObjectId | null;
    workspaceId: Types.ObjectId;
    title: string;

    icon?: string;
    coverImage?: string;
}

export interface UpdateNoteDTO {
    title?: string;
    folderId?: Types.ObjectId | null;

    icon?: string;
    coverImage?: string;

    isPinned?: boolean;
    isArchived?: boolean;
}