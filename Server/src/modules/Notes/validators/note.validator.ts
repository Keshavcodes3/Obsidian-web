import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/common/utils/apiError";
import { Types, isValidObjectId } from "mongoose";

export class NoteValidator {
    static validateCreateNote = (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate required fields
            if (!req.body.title) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Title is required",
                });
            }

            if (!req.body.vaultId) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Vault ID is required",
                });
            }

            // Validate ObjectId formats
            if (!isValidObjectId(req.body.vaultId)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Invalid Vault ID format",
                });
            }

            if (req.body.folderId && !isValidObjectId(req.body.folderId)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Invalid Folder ID format",
                });
            }

            // Validate title length
            if (req.body.title.length > 200) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Title cannot exceed 200 characters",
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };

    static validateUpdateNote = (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate ObjectId format for noteId in params
            if (!isValidObjectId(req.params.noteId)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Invalid Note ID format",
                });
            }

            // Validate folderId if provided
            if (req.body.folderId && !isValidObjectId(req.body.folderId)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Invalid Folder ID format",
                });
            }

            // Validate title length if provided
            if (req.body.title && req.body.title.length > 200) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Title cannot exceed 200 characters",
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };

    static validateNoteIdParam = (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!isValidObjectId(req.params.noteId)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Invalid Note ID format",
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    };

    static validateVaultIdParam = (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!isValidObjectId(req.params.vaultId)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Invalid Vault ID format",
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    };

    static validateFolderIdParam = (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!isValidObjectId(req.params.folderId)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Invalid Folder ID format",
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    };
}
