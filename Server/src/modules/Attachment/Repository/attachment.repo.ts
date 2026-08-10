import { Types } from "mongoose";
import AttachmentModel from "../Models/attachment.model";
import { uploadAttachmentDTO } from "../DTO/attachment.dto";

class AttachmentRepository {
    // CREATE
    create = async (payload: uploadAttachmentDTO) => {
        const attachment = await AttachmentModel.create(payload);
        return attachment;
    };

    // FIND BY ID
    findById = async (attachmentId: Types.ObjectId) => {
        const attachment = await AttachmentModel.findById(attachmentId);
        return attachment;
    };

    // FIND BLOCK ATTACHMENTS
    findByBlockId = async (blockId: Types.ObjectId) => {
        const attachments = await AttachmentModel.find({
            blockId,
            isDeleted: false,
        }).sort({
            order: 1,
        });
        return attachments;
    };

    // FIND NOTE ATTACHMENTS
    findByNoteId = async (noteId: Types.ObjectId) => {
        const attachments = await AttachmentModel.find({
            noteId,
            isDeleted: false,
        }).sort({
            order: 1,
        });
        return attachments;
    };

    // FIND VAULT ATTACHMENTS
    findByVaultId = async (vaultId: Types.ObjectId) => {
        const attachments = await AttachmentModel.find({
            vaultId,
            isDeleted: false,
        }).sort({
            order: 1,
        });
        return attachments;
    };

    // UPDATE
    updateById = async (payload: {
        attachmentId: Types.ObjectId;
        updateData: Partial<uploadAttachmentDTO>;
    }) => {
        const updatedAttachment =
            await AttachmentModel.findByIdAndUpdate(
                payload.attachmentId,
                {
                    $set: payload.updateData,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );
        return updatedAttachment;
    };

    // SOFT DELETE
    softDelete = async (attachmentId: Types.ObjectId) => {
        const deletedAttachment =
            await AttachmentModel.findByIdAndUpdate(
                attachmentId,
                {
                    $set: {
                        isDeleted: true,
                        deletedAt: new Date(),
                    },
                },
                {
                    new: true,
                }
            );
        return deletedAttachment;
    };

    // RESTORE
    restore = async (attachmentId: Types.ObjectId) => {
        const restoredAttachment =
            await AttachmentModel.findByIdAndUpdate(
                attachmentId,
                {
                    $set: {
                        isDeleted: false,
                        deletedAt: null,
                    },
                },
                {
                    new: true,
                }
            );
        return restoredAttachment;
    };

    // REORDER
    reorder = async (
        attachments: Array<{
            attachmentId: Types.ObjectId;
            order: number;
        }>
    ) => {
        const operations = attachments.map((attachment) => ({
            updateOne: {
                filter: {
                    _id: attachment.attachmentId,
                },
                update: {
                    $set: {
                        order: attachment.order,
                    },
                },
            },
        }));

        if (operations.length === 0) {
            return [];
        }

        await AttachmentModel.bulkWrite(operations);

        const attachmentIds = attachments.map(
            (attachment) => attachment.attachmentId
        );

        return AttachmentModel.find({
            _id: {
                $in: attachmentIds,
            },
            isDeleted: false,
        }).sort({
            order: 1,
        });
    };
}

export default new AttachmentRepository();