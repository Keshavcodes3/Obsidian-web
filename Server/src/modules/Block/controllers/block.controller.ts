import { Request, Response } from "express";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { ApiSuccess } from "@/common/utils/apiSuccess";
import { ApiError } from "@/common/utils/apiError";
import blockService from "../Service/block.service";
import {
    CreateBlockDTO,
    UpdateBlockDTO,
    MoveBlockDTO,
    ReorderBlocksDTO,
} from "../Dto/block.dto";
import { BlockType } from "../Types/block.types";
import { Types } from "mongoose";

export class BlockController {
    // CREATE BLOCK
    static createBlock = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const payload: CreateBlockDTO = {
            noteId: new Types.ObjectId(req.body.noteId),
            parentBlockId: req.body.parentBlockId ? new Types.ObjectId(req.body.parentBlockId) : null,
            type: req.body.type as BlockType,
            props: req.body.props || {},
            order: req.body.order,
        };

        const block = await blockService.createBlock(payload, userId);

        res.status(201).json(
            new ApiSuccess({
                message: "Block created successfully",
                data: block,
            })
        );
    });

    // CREATE MANY BLOCKS
    static createManyBlocks = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const payload: CreateBlockDTO[] = req.body.blocks.map((block: any) => ({
            noteId: new Types.ObjectId(block.noteId),
            parentBlockId: block.parentBlockId ? new Types.ObjectId(block.parentBlockId) : null,
            type: block.type as BlockType,
            props: block.props || {},
            order: block.order,
        }));

        const blocks = await blockService.createManyBlocks(payload, userId);

        res.status(201).json(
            new ApiSuccess({
                message: "Blocks created successfully",
                data: blocks,
            })
        );
    });

    // GET BLOCK BY ID
    static getBlockById = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const block = await blockService.getBlockById(req.params.blockId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Block retrieved successfully",
                data: block,
            })
        );
    });

    // GET NOTE BLOCKS
    static getNoteBlocks = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const blocks = await blockService.getNoteBlocks(req.params.noteId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Note blocks retrieved successfully",
                data: blocks,
            })
        );
    });

    // GET BLOCK CHILDREN
    static getBlockChildren = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const children = await blockService.getBlockChildren(req.params.blockId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Block children retrieved successfully",
                data: children,
            })
        );
    });

    // UPDATE BLOCK
    static updateBlock = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const payload: UpdateBlockDTO = {
            type: req.body.type as BlockType,
            props: req.body.props,
            parentBlockId: req.body.parentBlockId ? new Types.ObjectId(req.body.parentBlockId) : undefined,
            order: req.body.order,
        };

        const block = await blockService.updateBlock(req.params.blockId, payload, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Block updated successfully",
                data: block,
            })
        );
    });

    // MOVE BLOCK
    static moveBlock = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const payload: MoveBlockDTO = {
            parentBlockId: req.body.parentBlockId ? new Types.ObjectId(req.body.parentBlockId) : null,
            order: req.body.order,
        };

        const block = await blockService.moveBlock(req.params.blockId, payload, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Block moved successfully",
                data: block,
            })
        );
    });

    // REORDER BLOCKS
    static reorderBlocks = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const payload: ReorderBlocksDTO = {
            blocks: req.body.blocks.map((item: any) => ({
                blockId: new Types.ObjectId(item.blockId),
                order: item.order,
            })),
        };

        const result = await blockService.reorderBlocks(req.params.noteId, payload, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Blocks reordered successfully",
                data: result,
            })
        );
    });

    // DELETE BLOCK
    static deleteBlock = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const result = await blockService.deleteBlock(req.params.blockId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Block deleted successfully",
                data: result,
            })
        );
    });

    // RESTORE BLOCK
    static restoreBlock = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ApiError({
                statusCode: 401,
                message: "Authentication required",
            });
        }

        const block = await blockService.restoreBlock(req.params.blockId, userId);

        res.status(200).json(
            new ApiSuccess({
                message: "Block restored successfully",
                data: block,
            })
        );
    });
}
