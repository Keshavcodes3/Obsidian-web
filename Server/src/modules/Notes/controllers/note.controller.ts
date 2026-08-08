import { Request, Response } from "express";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { ApiSuccess } from "@/common/utils/apiSuccess";
import { ApiError } from "@/common/utils/apiError";
import noteService from "../services/note.service";
import { CreateNoteDTO, UpdateNoteDTO } from "../types/note.types";
import { Types } from "mongoose";

export class NoteController {
    // CREATE NOTE
    static createNote = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const payload: CreateNoteDTO = {
            vaultId: new Types.ObjectId(req.body.vaultId),
            folderId: req.body.folderId ? new Types.ObjectId(req.body.folderId) : null,
            workspaceId: new Types.ObjectId("000000000000000000000000"), // Placeholder, will be overridden by vault's workspaceId
            title: req.body.title,
            icon: req.body.icon,
            coverImage: req.body.coverImage,
        };

        const note = await noteService.createNote(payload, userId);

        res.status(201).json(
            new ApiSuccess({
                message: "Note created successfully",
                data: note,
            })
        );
    });

    // GET NOTE BY ID
    static getNoteById = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const note = await noteService.getNoteById(req.params.noteId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Note retrieved successfully",
                data: note,
            })
        );
    });

    // GET VAULT NOTES
    static getVaultNotes = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const notes = await noteService.getVaultNotes(req.params.vaultId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Vault notes retrieved successfully",
                data: notes,
            })
        );
    });

    // GET FOLDER NOTES
    static getFolderNotes = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const notes = await noteService.getFolderNotes(req.params.folderId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Folder notes retrieved successfully",
                data: notes,
            })
        );
    });

    // GET ROOT NOTES (no folder)
    static getRootNotes = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const notes = await noteService.getRootNotes(req.params.vaultId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Root notes retrieved successfully",
                data: notes,
            })
        );
    });

    // UPDATE NOTE
    static updateNote = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const payload: UpdateNoteDTO = {
            title: req.body.title,
            folderId: req.body.folderId ? new Types.ObjectId(req.body.folderId) : undefined,
            icon: req.body.icon,
            coverImage: req.body.coverImage,
            isPinned: req.body.isPinned,
            isArchived: req.body.isArchived,
        };

        const note = await noteService.updateNote(req.params.noteId, payload, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Note updated successfully",
                data: note,
            })
        );
    });

    // DELETE NOTE
    static deleteNote = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const note = await noteService.deleteNote(req.params.noteId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Note deleted successfully",
                data: note,
            })
        );
    });

    // RESTORE NOTE
    static restoreNote = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const note = await noteService.restoreNote(req.params.noteId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Note restored successfully",
                data: note,
            })
        );
    });

    // TOGGLE PIN
    static togglePin = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const note = await noteService.togglePin(req.params.noteId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: `Note ${note.isPinned ? "pinned" : "unpinned"} successfully`,
                data: note,
            })
        );
    });

    // TOGGLE ARCHIVE
    static toggleArchive = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const note = await noteService.toggleArchive(req.params.noteId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: `Note ${note.isArchived ? "archived" : "unarchived"} successfully`,
                data: note,
            })
        );
    });

    // MOVE NOTE
    static moveNote = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const folderId = req.body.folderId ? new Types.ObjectId(req.body.folderId) : null;

        const note = await noteService.moveNote(req.params.noteId, folderId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Note moved successfully",
                data: note,
            })
        );
    });
}
