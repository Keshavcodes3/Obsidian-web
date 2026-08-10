import { Types } from "mongoose";

export const ATTACHMENT_EVENTS = {
    CREATED: "attachment.created",
    UPDATED: "attachment.updated",
    DELETED: "attachment.deleted",
    RESTORED: "attachment.restored",
    REORDERED: "attachment.reordered",
} as const;

export interface AttachmentCreatedEvent {
    attachmentId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    vaultId: Types.ObjectId;
    noteId?: Types.ObjectId | null;
    blockId?: Types.ObjectId | null;
    uploadedBy: Types.ObjectId;
}

export interface AttachmentUpdatedEvent {
    attachmentId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    vaultId: Types.ObjectId;
    updatedBy: Types.ObjectId;
}

export interface AttachmentDeletedEvent {
    attachmentId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    vaultId: Types.ObjectId;
    noteId?: Types.ObjectId | null;
    blockId?: Types.ObjectId | null;
    deletedBy: Types.ObjectId;
}

export interface AttachmentRestoredEvent {
    attachmentId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    vaultId: Types.ObjectId;
    noteId?: Types.ObjectId | null;
    blockId?: Types.ObjectId | null;
    restoredBy: Types.ObjectId;
}

export interface AttachmentReorderedEvent {
    workspaceId: Types.ObjectId;
    vaultId: Types.ObjectId;
    noteId?: Types.ObjectId | null;
    blockId?: Types.ObjectId | null;
    updatedBy: Types.ObjectId;
    attachments: Array<{
        attachmentId: Types.ObjectId;
        order: number;
    }>;
}