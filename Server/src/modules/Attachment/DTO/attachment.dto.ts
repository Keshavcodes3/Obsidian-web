import { Types } from "mongoose";

export type uploadAttachmentDTO = {
    userId: Types.ObjectId;
    blockId: Types.ObjectId;
    noteId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    vaultId: Types.ObjectId;
    folderId?: Types.ObjectId;
    file: string;
};