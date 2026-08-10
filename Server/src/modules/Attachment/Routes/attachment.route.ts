import { Router } from "express";
import AttachmentController from "../Controllers/service.controller";
import { upload } from "@/common/Multer/upload";

const router = Router();

// POST /attachments
router.post(
    "/",
    upload.single("file"),
    AttachmentController.uploadAttachment
);

// GET /attachments/:attachmentId
router.get(
    "/:attachmentId",
    AttachmentController.getAttachmentById
);

// GET /blocks/:blockId/attachments
router.get(
    "/blocks/:blockId",
    AttachmentController.getBlockAttachments
);

// GET /notes/:noteId/attachments
router.get(
    "/notes/:noteId",
    AttachmentController.getNoteAttachments
);

// GET /vaults/:vaultId/attachments
router.get(
    "/vaults/:vaultId",
    AttachmentController.getVaultAttachments
);

// PATCH /attachments/:attachmentId
router.patch(
    "/:attachmentId",
    AttachmentController.updateAttachment
);

// PATCH /attachments/reorder
router.patch(
    "/reorder",
    AttachmentController.reorderAttachments
);

// DELETE /attachments/:attachmentId
router.delete(
    "/:attachmentId",
    AttachmentController.deleteAttachment
);

// PATCH /attachments/:attachmentId/restore
router.patch(
    "/:attachmentId/restore",
    AttachmentController.restoreAttachment
);

export default router;
