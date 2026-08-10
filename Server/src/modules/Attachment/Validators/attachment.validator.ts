import { Types } from "mongoose";
import { uploadAttachmentDTO } from "../DTO/attachment.dto";
import { ApiError } from "@/common/utils/apiError";


export const validateUpload = (payload: uploadAttachmentDTO) => {
    const { userId, blockId, file, folderId, noteId, workspaceId } = payload;
    if (!userId) {
        throw new ApiError({
            statusCode: 400,
            message: "User id is required"
        })
    }
    if (!blockId) {
        throw new ApiError({
            statusCode: 400,
            message: "Block id is required"
        })
    }
    if (!file) {
        throw new ApiError({
            statusCode: 400,
            message: "File is required"
        })
    }

    if (!noteId) {
        throw new ApiError({
            statusCode: 400,
            message: "Note id is required"
        })
    }
    if (!workspaceId) {
        throw new ApiError({
            statusCode: 400,
            message: "Workspace id is required"
        })
    }
}