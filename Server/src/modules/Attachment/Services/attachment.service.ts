import { Types } from "mongoose";
import { uploadAttachmentDTO } from "../DTO/attachment.dto";
import { validateUpload } from "../Validators/attachment.validator";
import attachmentRepository from "../Repository/attachment.repo";
import { ApiError } from "@/common/utils/apiError";
import { eventBus } from "@/common/events";
import { ATTACHMENT_EVENTS } from "../Events/attachment.event";

class AttachmentService {
    constructor(private readonly attachmentRepo: typeof attachmentRepository) { }

    uploadAttachment = async (payload: uploadAttachmentDTO) => {
        validateUpload(payload);
        const attachment = await this.attachmentRepo.create(payload);
        if (!attachment) {
            throw new ApiError({
                statusCode: 500,
                message: "Attachment not uploaded"
            });
        }
        eventBus.emit(ATTACHMENT_EVENTS.CREATED, {
            attachmentId: attachment._id,
            workspaceId: payload.workspaceId,
            vaultId: payload.vaultId,
            noteId: payload.noteId || null,
            blockId: payload.blockId || null,
            uploadedBy: payload.userId,
        });
        return attachment;
    }

    findById = async (attachmentId: Types.ObjectId) => {
        const attachment = await this.attachmentRepo.findById(attachmentId);
        if (!attachment) {
            throw new ApiError({
                statusCode: 404,
                message: "Attachment not found"
            });
        }
        return attachment;
    }

    findByBlockId = async (blockId: Types.ObjectId) => {
        const attachments = await this.attachmentRepo.findByBlockId(blockId);
        if (!attachments) {
            throw new ApiError({
                statusCode: 404,
                message: "Attachments not found"
            });
        }
        return attachments;
    }

    findByNoteId = async (noteId: Types.ObjectId) => {
        const attachments = await this.attachmentRepo.findByNoteId(noteId);
        if (!attachments) {
            throw new ApiError({
                statusCode: 404,
                message: "Attachments not found"
            });
        }
        return attachments;
    }

    findByVaultId = async (vaultId: Types.ObjectId) => {
        const attachments = await this.attachmentRepo.findByVaultId(vaultId);
        if (!attachments) {
            throw new ApiError({
                statusCode: 404,
                message: "Attachments not found"
            });
        }
        return attachments;
    }

    updateById = async (payload: {
        attachmentId: Types.ObjectId;
        userId: Types.ObjectId;
        updateData: Partial<uploadAttachmentDTO>;
    }) => {
        const updatedAttachment = await this.attachmentRepo.updateById(payload);
        if (!updatedAttachment) {
            throw new ApiError({
                statusCode: 404,
                message: "Attachment not found"
            });
        }
        eventBus.emit(ATTACHMENT_EVENTS.UPDATED, {
            attachmentId: updatedAttachment._id,
            workspaceId: updatedAttachment.workspaceId,
            vaultId: updatedAttachment.vaultId,
            updatedBy: payload.userId,
        });
        return updatedAttachment;
    }

    softDelete = async (payload: { attachmentId: Types.ObjectId; userId: Types.ObjectId; }) => {
        const deletedAttachment = await this.attachmentRepo.softDelete(payload.attachmentId);
        if (!deletedAttachment) {
            throw new ApiError({
                statusCode: 404,
                message: "Attachment not found"
            });
        }
        eventBus.emit(ATTACHMENT_EVENTS.DELETED, {
            attachmentId: deletedAttachment._id,
            workspaceId: deletedAttachment.workspaceId,
            vaultId: deletedAttachment.vaultId,
            noteId: deletedAttachment.noteId || null,
            blockId: deletedAttachment.blockId || null,
            deletedBy: payload.userId,
        });
        return deletedAttachment;
    }

    restore = async (attachmentId: Types.ObjectId, userId: Types.ObjectId) => {
        const restoredAttachment = await this.attachmentRepo.restore(attachmentId);
        if (!restoredAttachment) {
            throw new ApiError({
                statusCode: 404,
                message: "Attachment not found"
            });
        }
        eventBus.emit(ATTACHMENT_EVENTS.RESTORED, {
            attachmentId: restoredAttachment._id,
            workspaceId: restoredAttachment.workspaceId,
            vaultId: restoredAttachment.vaultId,
            noteId: restoredAttachment.noteId || null,
            blockId: restoredAttachment.blockId || null,
            restoredBy: userId,
        });
        return restoredAttachment;
    }

    reorder = async (payload: Array<{
        attachmentId: Types.ObjectId;
        order: number;
    }>) => {
        const reorderedAttachments = await this.attachmentRepo.reorder(payload);
        if (!reorderedAttachments) {
            throw new ApiError({
                statusCode: 500,
                message: "Failed to reorder attachments"
            });
        }

        eventBus.emit(ATTACHMENT_EVENTS.REORDERED, {
            workspaceId: reorderedAttachments[0].workspaceId,
            vaultId: reorderedAttachments[0].vaultId,
            noteId: reorderedAttachments[0].noteId || null,
            blockId: reorderedAttachments[0].blockId || null,
            attachments: reorderedAttachments,
        });
        return reorderedAttachments;
    }
}

export const attachmentService = new AttachmentService(attachmentRepository);