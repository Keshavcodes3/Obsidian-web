import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/common/utils/apiError";
import { Types, isValidObjectId } from "mongoose";
import { BlockType } from "../Types/block.types";

export class BlockValidator {
    static validateCreateBlock = (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate required fields
            if (!req.body.noteId) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Note ID is required",
                });
            }

            if (!req.body.type) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Block type is required",
                });
            }

            if (!req.body.props) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Block props are required",
                });
            }

            // Validate ObjectId formats
            if (!isValidObjectId(req.body.noteId)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Invalid Note ID format",
                });
            }

            if (req.body.parentBlockId && !isValidObjectId(req.body.parentBlockId)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Invalid Parent Block ID format",
                });
            }

            // Validate block type
            if (!Object.values(BlockType).includes(req.body.type)) {
                throw new ApiError({
                    statusCode: 400,
                    message: `Invalid block type: ${req.body.type}`,
                });
            }

            // Validate props is an object
            if (typeof req.body.props !== "object" || req.body.props === null) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Block props must be an object",
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };

    static validateUpdateBlock = (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate ObjectId format for blockId in params
            if (!isValidObjectId(req.params.blockId)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Invalid Block ID format",
                });
            }

            // Validate parentBlockId if provided
            if (req.body.parentBlockId && !isValidObjectId(req.body.parentBlockId)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Invalid Parent Block ID format",
                });
            }

            // Validate block type if provided
            if (req.body.type && !Object.values(BlockType).includes(req.body.type)) {
                throw new ApiError({
                    statusCode: 400,
                    message: `Invalid block type: ${req.body.type}`,
                });
            }

            // Validate props if provided
            if (req.body.props && (typeof req.body.props !== "object" || req.body.props === null)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Block props must be an object",
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };

    static validateBlockIdParam = (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!isValidObjectId(req.params.blockId)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Invalid Block ID format",
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

    static validateReorderBlocks = (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body.blocks || !Array.isArray(req.body.blocks)) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Blocks array is required",
                });
            }

            if (req.body.blocks.length === 0) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Blocks array cannot be empty",
                });
            }

            for (const item of req.body.blocks) {
                if (!item.blockId || !isValidObjectId(item.blockId)) {
                    throw new ApiError({
                        statusCode: 400,
                        message: "Invalid block ID in reorder array",
                    });
                }

                if (typeof item.order !== "number") {
                    throw new ApiError({
                        statusCode: 400,
                        message: "Order must be a number",
                    });
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}
