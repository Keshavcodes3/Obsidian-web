import { Types } from "mongoose";

export interface IAttachment {
    workspaceId: Types.ObjectId;
    vaultId: Types.ObjectId;

    noteId?: Types.ObjectId | null;
    blockId?: Types.ObjectId | null;

    storageKey: string;
    storageProvider: "imagekit";

    imageKitFileId: string;
    url: string;

    originalFilename: string;
    mimeType: string;
    size: number;
    folderId: Types.ObjectId;
    uploadedBy: Types.ObjectId;
    order: number;
    isDeleted: boolean;
    deletedAt?: Date | null;
}