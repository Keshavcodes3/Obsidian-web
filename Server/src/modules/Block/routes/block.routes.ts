import express from "express";
import { requireAuth } from "@/common/middlewares/auth.middleware";
import { BlockController } from "../controllers/block.controller";
import { BlockValidator } from "../validators/block.validator";

const router = express.Router();

// All block routes require authentication
router.use(requireAuth);

// CREATE BLOCK
router.post(
    "/",
    BlockValidator.validateCreateBlock,
    BlockController.createBlock
);

// CREATE MANY BLOCKS
router.post(
    "/batch",
    BlockController.createManyBlocks
);

// GET BLOCK BY ID
router.get(
    "/:blockId",
    BlockValidator.validateBlockIdParam,
    BlockController.getBlockById
);

// GET NOTE BLOCKS
router.get(
    "/note/:noteId",
    BlockValidator.validateNoteIdParam,
    BlockController.getNoteBlocks
);

// GET BLOCK CHILDREN
router.get(
    "/:blockId/children",
    BlockValidator.validateBlockIdParam,
    BlockController.getBlockChildren
);

// UPDATE BLOCK
router.patch(
    "/:blockId",
    BlockValidator.validateBlockIdParam,
    BlockValidator.validateUpdateBlock,
    BlockController.updateBlock
);

// MOVE BLOCK
router.patch(
    "/:blockId/move",
    BlockValidator.validateBlockIdParam,
    BlockValidator.validateUpdateBlock,
    BlockController.moveBlock
);

// REORDER BLOCKS
router.patch(
    "/note/:noteId/reorder",
    BlockValidator.validateNoteIdParam,
    BlockValidator.validateReorderBlocks,
    BlockController.reorderBlocks
);

// DELETE BLOCK
router.delete(
    "/:blockId",
    BlockValidator.validateBlockIdParam,
    BlockController.deleteBlock
);

// RESTORE BLOCK
router.post(
    "/:blockId/restore",
    BlockValidator.validateBlockIdParam,
    BlockController.restoreBlock
);

export default router;
