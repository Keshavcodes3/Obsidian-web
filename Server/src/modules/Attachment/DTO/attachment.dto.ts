import { Types } from "mongoose"


export type uploadAttachmentDTO = {
    userId: Types.ObjectId,
    blockId: Types.ObjectId,
    noteId: Types.ObjectId,
    workspaceId: string,
    vaultId: Types.ObjectId,
    folderId?: Types.ObjectId,
    file: string,

}