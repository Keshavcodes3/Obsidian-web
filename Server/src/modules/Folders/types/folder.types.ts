import { Types } from "mongoose";

export interface IFolder {
    vaultId: Types.ObjectId;

    parentFolderId?: Types.ObjectId | null;

    name: string;

    slug: string;

    color?: string;

    icon?: string;

    createdBy: Types.ObjectId;

    updatedBy?: Types.ObjectId;

    isDeleted: boolean;

    createdAt: Date;

    updatedAt: Date;
}