import { Request, Response } from "express";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { ApiSuccess } from "@/common/utils/apiSuccess";

import { attachmentService } from "../Services/attachment.service";
import { uploadAttachmentDTO } from "../DTO/attachment.dto";

class AttachmentController {

    // POST /attachments
    uploadAttachment = asyncHandler(
        async (req: Request, res: Response) => {
            const payload: uploadAttachmentDTO = {
                ...req.body,
                userId: (req as any).user.userId,
                file: req.file?.path,
            };
            const attachment = await attachmentService.uploadAttachment(payload);

            return res.status(201).json(
                new ApiSuccess({
                    message: "Attachment uploaded successfully",
                    data: attachment,
                })
            );
        }
    );

    // GET /attachments/:attachmentId
    getAttachmentById = asyncHandler(
        async (req: Request, res: Response) => {
            const attachment = await attachmentService.findById(req.params.attachmentId as unknown as any);

            return res.status(200).json(
                new ApiSuccess({
                    message: "Attachment fetched successfully",
                    data: attachment,
                })
            );
        }
    );

    // GET /blocks/:blockId/attachments
    getBlockAttachments = asyncHandler(
        async (req: Request, res: Response) => {
            const attachments = await attachmentService.findByBlockId(req.params.blockId as unknown as any);

            return res.status(200).json(
                new ApiSuccess({
                    message: "Block attachments fetched successfully",
                    data: attachments,
                })
            );
        }
    );

    // GET /notes/:noteId/attachments
    getNoteAttachments = asyncHandler(
        async (req: Request, res: Response) => {
            const attachments = await attachmentService.findByNoteId(req.params.noteId as unknown as any);

            return res.status(200).json(
                new ApiSuccess({
                    message: "Note attachments fetched successfully",
                    data: attachments,
                })
            );
        }
    );

    // GET /vaults/:vaultId/attachments
    getVaultAttachments = asyncHandler(
        async (req: Request, res: Response) => {
            const attachments = await attachmentService.findByVaultId(req.params.vaultId as unknown as any);

            return res.status(200).json(
                new ApiSuccess({
                    message: "Vault attachments fetched successfully",
                    data: attachments,
                })
            );
        }
    );

    // PATCH /attachments/:attachmentId
    updateAttachment = asyncHandler(
        async (req: Request, res: Response) => {
            const attachment = await attachmentService.updateById({
                attachmentId: req.params.attachmentId as unknown as any,
                userId: (req as any).user.userId,
                updateData: req.body,
            });

            return res.status(200).json(
                new ApiSuccess({
                    message: "Attachment updated successfully",
                    data: attachment,
                })
            );
        }
    );

    // PATCH /blocks/:blockId/attachments/reorder
    reorderAttachments = asyncHandler(
        async (req: Request, res: Response) => {
            const attachments = await attachmentService.reorder(req.body);

            return res.status(200).json(
                new ApiSuccess({
                    message: "Attachments reordered successfully",
                    data: attachments,
                })
            );
        }
    );

    // DELETE /attachments/:attachmentId
    deleteAttachment = asyncHandler(
        async (req: Request, res: Response) => {
            await attachmentService.softDelete({
                attachmentId: req.params.attachmentId as unknown as any,
                userId: (req as any).user.userId,
            });

            return res.status(200).json(
                new ApiSuccess({
                    message: "Attachment deleted successfully",
                    data: null,
                })
            );
        }
    );

    // PATCH /attachments/:attachmentId/restore
    restoreAttachment = asyncHandler(
        async (req: Request, res: Response) => {
            const attachment = await attachmentService.restore(
                req.params.attachmentId as unknown as any,
                (req as any).user.userId
            );

            return res.status(200).json(
                new ApiSuccess({
                    message: "Attachment restored successfully",
                    data: attachment,
                })
            );
        }
    );
}

export default new AttachmentController();