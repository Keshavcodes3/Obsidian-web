import express from "express";
import { requireAuth } from "@/common/middlewares/auth.middleware";
import { NoteController } from "../controllers/note.controller";
import { NoteValidator } from "../validators/note.validator";

const router = express.Router();

// All note routes require authentication
router.use(requireAuth);

// CREATE NOTE
router.post(
    "/",
    NoteValidator.validateCreateNote,
    NoteController.createNote
);

// GET NOTE BY ID
router.get(
    "/:noteId",
    NoteValidator.validateNoteIdParam,
    NoteController.getNoteById
);

// GET VAULT NOTES
router.get(
    "/vault/:vaultId",
    NoteValidator.validateVaultIdParam,
    NoteController.getVaultNotes
);

// GET FOLDER NOTES
router.get(
    "/folder/:folderId",
    NoteValidator.validateFolderIdParam,
    NoteController.getFolderNotes
);

// GET ROOT NOTES (no folder)
router.get(
    "/vault/:vaultId/root",
    NoteValidator.validateVaultIdParam,
    NoteController.getRootNotes
);

// UPDATE NOTE
router.patch(
    "/:noteId",
    NoteValidator.validateNoteIdParam,
    NoteValidator.validateUpdateNote,
    NoteController.updateNote
);

// DELETE NOTE
router.delete(
    "/:noteId",
    NoteValidator.validateNoteIdParam,
    NoteController.deleteNote
);

// RESTORE NOTE
router.post(
    "/:noteId/restore",
    NoteValidator.validateNoteIdParam,
    NoteController.restoreNote
);

// TOGGLE PIN
router.patch(
    "/:noteId/pin",
    NoteValidator.validateNoteIdParam,
    NoteController.togglePin
);

// TOGGLE ARCHIVE
router.patch(
    "/:noteId/archive",
    NoteValidator.validateNoteIdParam,
    NoteController.toggleArchive
);

// MOVE NOTE
router.patch(
    "/:noteId/move",
    NoteValidator.validateNoteIdParam,
    NoteValidator.validateUpdateNote,
    NoteController.moveNote
);

export default router;
