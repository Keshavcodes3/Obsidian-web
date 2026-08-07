import { Types } from "mongoose";
export type CreateFolderDTO = {
    vaultId: Types.ObjectId;

    parentFolderId?: Types.ObjectId | null;
    color: string,
    icon: string,
    name: string;
}