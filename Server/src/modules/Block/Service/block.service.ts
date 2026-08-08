import { Types, ClientSession, startSession } from "mongoose";
import { validateObjectId } from "@/common/utils/objectId.util";

import blockRepository from "../Repositary/block.repo";
import noteRepository from "@/modules/Notes/repositories/note.repo";
import vaultRepository from "@/modules/vault/repositories/vault.repo";
import memberRepository from "@/modules/Members/repositories/member.repo";

import {
    CreateBlockDTO,
    UpdateBlockDTO,
    MoveBlockDTO,
    ReorderBlocksDTO,
} from "../Dto/block.dto";
import { BlockType, IBlock } from "../Types/block.types";

import { ApiError } from "@/common/utils/apiError";
import { eventBus } from "@/common/events";
import { BLOCK_EVENTS } from "../Events/block.events";

// Block type to props validation
const BLOCK_TYPE_PROPS = {
    [BlockType.PARAGRAPH]: {
        required: ["text"],
        optional: [],
    },
    [BlockType.HEADING]: {
        required: ["text", "level"],
        optional: [],
    },
    [BlockType.CODE]: {
        required: ["code"],
        optional: ["language"],
    },
    [BlockType.IMAGE]: {
        required: ["url"],
        optional: ["caption"],
    },
    [BlockType.QUOTE]: {
        required: ["text"],
        optional: [],
    },
    [BlockType.BULLET_LIST]: {
        required: ["items"],
        optional: [],
    },
    [BlockType.NUMBERED_LIST]: {
        required: ["items"],
        optional: [],
    },
    [BlockType.CHECKLIST]: {
        required: ["items"],
        optional: [],
    },
    [BlockType.TABLE]: {
        required: ["rows", "columns"],
        optional: [],
    },
    [BlockType.CALLOUT]: {
        required: ["text"],
        optional: ["icon", "color"],
    },
    [BlockType.DIVIDER]: {
        required: [],
        optional: [],
    },
    [BlockType.TOGGLE]: {
        required: ["text"],
        optional: ["isOpen"],
    },
    [BlockType.EMBED]: {
        required: ["url"],
        optional: ["title"],
    },
} as const;

class BlockService {
    constructor(
        private readonly blockRepo: typeof blockRepository,
        private readonly noteRepo: typeof noteRepository,
        private readonly vaultRepo: typeof vaultRepository,
        private readonly memberRepo: typeof memberRepository,
    ) { }

    // ─────────────────────────────────────────────
    // CREATE BLOCK
    // ─────────────────────────────────────────────

    createBlock = async (
        payload: CreateBlockDTO,
        userId: string
    ) => {
        // Validate ObjectId formats
        validateObjectId(payload.noteId.toString(), "Note");
        if (payload.parentBlockId) {
            validateObjectId(payload.parentBlockId.toString(), "Parent Block");
        }

        // Validate block type
        if (!Object.values(BlockType).includes(payload.type)) {
            throw new ApiError({
                statusCode: 400,
                message: `Invalid block type: ${payload.type}`,
            });
        }

        // Validate props for block type
        this.validateBlockProps(payload.type, payload.props);

        // Validate note exists and is accessible
        const note = await this.getAccessibleNote(payload.noteId, userId);

        // Validate parent block if provided
        if (payload.parentBlockId) {
            await this.validateParentBlock(
                payload.parentBlockId,
                payload.noteId,
                userId
            );
        }

        // Set order - auto-increment if not provided
        let order = payload.order ?? 0;
        if (payload.parentBlockId) {
            const siblings = await this.blockRepo.findChildren(
                payload.noteId,
                payload.parentBlockId
            ) as any[];
            order = siblings.length > 0 ? Math.max(...siblings.map((b: any) => b.order)) + 1 : 0;
        } else {
            const rootBlocks = await this.blockRepo.findRootBlocks(payload.noteId) as any[];
            order = rootBlocks.length > 0 ? Math.max(...rootBlocks.map((b: any) => b.order)) + 1 : 0;
        }

        const userObjectId = new Types.ObjectId(userId);

        let block;
        try {
            block = await this.blockRepo.create({
                noteId: payload.noteId,
                parentBlockId: payload.parentBlockId,
                type: payload.type,
                props: payload.props,
                order,
                createdBy: userObjectId,
                updatedBy: userObjectId,
            });
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ApiError({
                    statusCode: 409,
                    message: "Block order conflict. Please try again.",
                });
            }
            throw error;
        }

        // Publish event
        eventBus.publish(BLOCK_EVENTS.CREATED, {
            //@ts-ignore
            blockId: block._id.toString(),//@ts-ignore
            noteId: block.noteId.toString(),
            vaultId: note.vaultId.toString(),
            createdBy: userId,
        });

        return block;
    };

    // ─────────────────────────────────────────────
    // CREATE MANY BLOCKS
    // ──────────────────────────────────────────────

    createManyBlocks = async (
        payload: CreateBlockDTO[],
        userId: string
    ) => {
        if (payload.length === 0) {
            throw new ApiError({
                statusCode: 400,
                message: "No blocks to create",
            });
        }

        const userObjectId = new Types.ObjectId(userId);

        // Validate all blocks belong to the same note
        const noteId = payload[0].noteId.toString();
        for (const block of payload) {
            if (block.noteId.toString() !== noteId) {
                throw new ApiError({
                    statusCode: 400,
                    message: "All blocks must belong to the same note",
                });
            }
        }

        // Validate note exists and is accessible
        const note = await this.getAccessibleNote(payload[0].noteId, userId);

        // Validate each block
        for (const block of payload) {
            validateObjectId(block.noteId.toString(), "Note");
            if (block.parentBlockId) {
                validateObjectId(block.parentBlockId.toString(), "Parent Block");
            }

            if (!Object.values(BlockType).includes(block.type)) {
                throw new ApiError({
                    statusCode: 400,
                    message: `Invalid block type: ${block.type}`,
                });
            }

            this.validateBlockProps(block.type, block.props);

            if (block.parentBlockId) {
                await this.validateParentBlock(
                    block.parentBlockId,
                    block.noteId,
                    userId
                );
            }
        }

        // Set orders
        const blocksWithOrder = await Promise.all(
            payload.map(async (block, index) => {
                let order = block.order ?? index;
                if (block.parentBlockId) {
                    const siblings = await this.blockRepo.findChildren(
                        block.noteId,
                        block.parentBlockId
                    );
                    order = siblings.length + index;
                } else {
                    const rootBlocks = await this.blockRepo.findRootBlocks(block.noteId);
                    order = rootBlocks.length + index;
                }

                return {
                    ...block,
                    order,
                    createdBy: userObjectId,
                    updatedBy: userObjectId,
                };
            })
        );

        let blocks;
        try {
            blocks = await this.blockRepo.createMany(blocksWithOrder);
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ApiError({
                    statusCode: 409,
                    message: "Block order conflict during bulk creation. Please try again.",
                });
            }
            throw error;
        }

        // Publish events
        blocks.forEach((block) => {
            eventBus.publish(BLOCK_EVENTS.CREATED, {
                blockId: block._id.toString(),
                noteId: block.noteId.toString(),
                vaultId: note.vaultId.toString(),
                createdBy: userId,
            });
        });

        return blocks;
    };

    // ─────────────────────────────────────────────
    // GET BLOCK BY ID
    // ─────────────────────────────────────────────

    getBlockById = async (
        blockId: string,
        userId: string
    ) => {
        validateObjectId(blockId, "Block");

        const block = await this.blockRepo.findActiveById(
            new Types.ObjectId(blockId)
        );

        if (!block) {
            throw new ApiError({
                statusCode: 404,
                message: "Block not found",
            });
        }

        await this.assertUserCanAccessBlock(block, userId);

        return block;
    };

    // ─────────────────────────────────────────────
    // GET NOTE BLOCKS
    // ─────────────────────────────────────────────

    getNoteBlocks = async (
        noteId: string,
        userId: string
    ) => {
        validateObjectId(noteId, "Note");

        // Validate note exists and is accessible
        await this.getAccessibleNote(new Types.ObjectId(noteId), userId);

        return await this.blockRepo.findByNote(
            new Types.ObjectId(noteId)
        );
    };

    // ─────────────────────────────────────────────
    // GET BLOCK CHILDREN
    // ─────────────────────────────────────────────

    getBlockChildren = async (
        blockId: string,
        userId: string
    ) => {
        validateObjectId(blockId, "Block");

        const block = await this.blockRepo.findActiveById(
            new Types.ObjectId(blockId)
        );

        if (!block) {
            throw new ApiError({
                statusCode: 404,
                message: "Block not found",
            });
        }

        await this.assertUserCanAccessBlock(block, userId);

        return await this.blockRepo.findChildren(
            block.noteId,
            block._id
        );
    };

    // ─────────────────────────────────────────────
    // UPDATE BLOCK
    // ─────────────────────────────────────────────

    updateBlock = async (
        blockId: string,
        payload: UpdateBlockDTO,
        userId: string
    ) => {
        validateObjectId(blockId, "Block");

        const block = await this.blockRepo.findActiveById(
            new Types.ObjectId(blockId)
        );

        if (!block) {
            throw new ApiError({
                statusCode: 404,
                message: "Block not found",
            });
        }

        await this.assertUserCanAccessBlock(block, userId);

        // Validate block type if provided
        if (payload.type && !Object.values(BlockType).includes(payload.type)) {
            throw new ApiError({
                statusCode: 400,
                message: `Invalid block type: ${payload.type}`,
            });
        }

        // Validate props if provided
        if (payload.props !== undefined) {
            const blockType = payload.type || block.type;
            this.validateBlockProps(blockType, payload.props);
        }

        // Validate parent block if provided
        if (payload.parentBlockId !== undefined) {
            await this.validateParentBlock(
                payload.parentBlockId,
                block.noteId,
                userId
            );

            // Check for circular reference
            if (payload.parentBlockId) {
                const wouldCreateCircular = await this.blockRepo.wouldCreateCircularReference(
                    block._id,
                    payload.parentBlockId
                );
                if (wouldCreateCircular) {
                    throw new ApiError({
                        statusCode: 400,
                        message: "Cannot create circular reference in block hierarchy",
                    });
                }
            }
        }

        const updatePayload = {
            ...payload,
            updatedBy: new Types.ObjectId(userId),
        };

        let updated;
        try {
            updated = await this.blockRepo.update(
                block._id,
                updatePayload
            );
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ApiError({
                    statusCode: 409,
                    message: "Block order conflict. Please try again.",
                });
            }
            throw error;
        }

        if (!updated) {
            throw new ApiError({
                statusCode: 404,
                message: "Block not found",
            });
        }

        // Publish event
        eventBus.publish(BLOCK_EVENTS.UPDATED, {
            blockId: updated._id.toString(),
            noteId: updated.noteId.toString(),
            updatedBy: userId,
        });

        return updated;
    };

    // ─────────────────────────────────────────────
    // MOVE BLOCK
    // ─────────────────────────────────────────────

    moveBlock = async (
        blockId: string,
        payload: MoveBlockDTO,
        userId: string
    ) => {
        validateObjectId(blockId, "Block");

        const block = await this.blockRepo.findActiveById(
            new Types.ObjectId(blockId)
        );

        if (!block) {
            throw new ApiError({
                statusCode: 404,
                message: "Block not found",
            });
        }

        await this.assertUserCanAccessBlock(block, userId);

        // Validate parent block if provided
        if (payload.parentBlockId) {
            validateObjectId(payload.parentBlockId.toString(), "Parent Block");

            await this.validateParentBlock(
                payload.parentBlockId,
                block.noteId,
                userId
            );

            // Check for circular reference
            const wouldCreateCircular = await this.blockRepo.wouldCreateCircularReference(
                block._id,
                payload.parentBlockId
            );
            if (wouldCreateCircular) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Cannot create circular reference in block hierarchy",
                });
            }
        }

        // Set order - auto-increment if not provided
        let order = payload.order;
        if (order === undefined) {
            if (payload.parentBlockId) {
                const siblings = await this.blockRepo.findChildren(
                    block.noteId,
                    payload.parentBlockId
                );
                order = siblings.length > 0 ? Math.max(...siblings.map(b => b.order)) + 1 : 0;
            } else {
                const rootBlocks = await this.blockRepo.findRootBlocks(block.noteId);
                order = rootBlocks.length > 0 ? Math.max(...rootBlocks.map(b => b.order)) + 1 : 0;
            }
        }

        let updated;
        try {
            updated = await this.blockRepo.move(
                block._id,
                payload.parentBlockId,
                order
            );
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ApiError({
                    statusCode: 409,
                    message: "Block order conflict. Please try again.",
                });
            }
            throw error;
        }

        if (!updated) {
            throw new ApiError({
                statusCode: 404,
                message: "Block not found",
            });
        }

        // Publish event
        eventBus.publish(BLOCK_EVENTS.MOVED, {
            blockId: updated._id.toString(),
            noteId: updated.noteId.toString(),
            parentBlockId: updated.parentBlockId?.toString() || null,
            order: updated.order,
            movedBy: userId,
        });

        return updated;
    };

    // ─────────────────────────────────────────────
    // REORDER BLOCKS
    // ─────────────────────────────────────────────

    reorderBlocks = async (
        noteId: string,
        payload: ReorderBlocksDTO,
        userId: string
    ) => {
        validateObjectId(noteId, "Note");

        // Validate note exists and is accessible
        await this.getAccessibleNote(new Types.ObjectId(noteId), userId);

        // Validate all blocks belong to the same note
        const noteObjectId = new Types.ObjectId(noteId);
        for (const item of payload.blocks) {
            validateObjectId(item.blockId.toString(), "Block");

            const block = await this.blockRepo.findActiveById(item.blockId);
            if (!block) {
                throw new ApiError({
                    statusCode: 404,
                    message: `Block ${item.blockId} not found`,
                });
            }

            if (block.noteId.toString() !== noteId) {
                throw new ApiError({
                    statusCode: 400,
                    message: `Block ${item.blockId} does not belong to note ${noteId}`,
                });
            }
        }

        // Check for duplicate block IDs
        const blockIds = payload.blocks.map(item => item.blockId.toString());
        if (new Set(blockIds).size !== blockIds.length) {
            throw new ApiError({
                statusCode: 400,
                message: "Duplicate block IDs in reorder request",
            });
        }

        // Use transaction for atomicity
        const session = await startSession();
        try {
            await session.withTransaction(async () => {
                await this.blockRepo.batchReorder(
                    noteObjectId,
                    payload,
                    session
                );
            });

            // Publish event
            eventBus.publish(BLOCK_EVENTS.REORDERED, {
                noteId,
                blockIds: payload.blocks.map(b => b.blockId.toString()),
                reorderedBy: userId,
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }

        return { success: true };
    };

    // ─────────────────────────────────────────────
    // DELETE BLOCK
    // ─────────────────────────────────────────────

    deleteBlock = async (
        blockId: string,
        userId: string
    ) => {
        validateObjectId(blockId, "Block");

        const block = await this.blockRepo.findActiveById(
            new Types.ObjectId(blockId)
        );

        if (!block) {
            throw new ApiError({
                statusCode: 404,
                message: "Block not found",
            });
        }

        await this.assertUserCanAccessBlock(block, userId);

        // Check if block has children - soft delete them too
        const childrenCount = await this.blockRepo.countChildren(
            block.noteId,
            block._id
        );

        const session = await startSession();
        try {
            await session.withTransaction(async () => {
                if (childrenCount > 0) {
                    // Soft delete all children recursively
                    await this.deleteBlockAndChildren(block._id, session);
                } else {
                    await this.blockRepo.remove(block._id, session);
                }
            });

            // Publish event
            eventBus.publish(BLOCK_EVENTS.DELETED, {
                blockId: block._id.toString(),
                noteId: block.noteId.toString(),
                deletedBy: userId,
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }

        return { success: true };
    };

    // ─────────────────────────────────────────────
    // RESTORE BLOCK
    // ─────────────────────────────────────────────

    restoreBlock = async (
        blockId: string,
        userId: string
    ) => {
        validateObjectId(blockId, "Block");

        const block = await this.blockRepo.findById(
            new Types.ObjectId(blockId)
        );

        if (!block) {
            throw new ApiError({
                statusCode: 404,
                message: "Block not found",
            });
        }

        if (!block.isDeleted) {
            throw new ApiError({
                statusCode: 400,
                message: "Block is not deleted",
            });
        }

        // Validate note exists and is accessible
        const note = await this.getAccessibleNote(block.noteId, userId);

        // Check if parent block exists and is not deleted (if block has a parent)
        if (block.parentBlockId) {
            const parentBlock = await this.blockRepo.findActiveById(block.parentBlockId);
            if (!parentBlock) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Cannot restore block because its parent block no longer exists or is deleted",
                });
            }
        }

        const restored = await this.blockRepo.restore(block._id);

        if (!restored) {
            throw new ApiError({
                statusCode: 404,
                message: "Block could not be restored",
            });
        }

        // Publish event
        eventBus.publish(BLOCK_EVENTS.RESTORED, {
            blockId: restored._id.toString(),
            noteId: restored.noteId.toString(),
            restoredBy: userId,
        });

        return restored;
    };

    // ─────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────



    private validateBlockProps(type: BlockType, props: Record<string, unknown>) {
        const schema = BLOCK_TYPE_PROPS[type];
        if (!schema) {
            throw new ApiError({
                statusCode: 400,
                message: `Unknown block type: ${type}`,
            });
        }

        // Check required props
        for (const requiredProp of schema.required) {
            if (!(requiredProp in props)) {
                throw new ApiError({
                    statusCode: 400,
                    message: `Block type ${type} requires property: ${requiredProp}`,
                });
            }
        }

        // Type-specific validation
        switch (type) {
            case BlockType.HEADING:
                if (typeof props.level !== "number" || props.level < 1 || props.level > 6) {
                    throw new ApiError({
                        statusCode: 400,
                        message: "Heading level must be between 1 and 6",
                    });
                }
                break;
            case BlockType.CODE:
                if (props.language && typeof props.language !== "string") {
                    throw new ApiError({
                        statusCode: 400,
                        message: "Code language must be a string",
                    });
                }
                break;
            case BlockType.IMAGE:
                if (typeof props.url !== "string" || !props.url.trim()) {
                    throw new ApiError({
                        statusCode: 400,
                        message: "Image URL must be a non-empty string",
                    });
                }
                break;
            case BlockType.TABLE:
                if (!Array.isArray(props.rows) || !Array.isArray(props.columns)) {
                    throw new ApiError({
                        statusCode: 400,
                        message: "Table requires rows and columns arrays",
                    });
                }
                break;
        }
    }

    private async getAccessibleNote(noteId: Types.ObjectId, userId: string) {
        const note = await this.noteRepo.findActiveById(noteId);

        if (!note) {
            throw new ApiError({
                statusCode: 404,
                message: "Note not found",
            });
        }

        await this.assertUserCanAccessNote(note as any, userId);

        return note;
    }

    private async validateParentBlock(
        parentBlockId: Types.ObjectId,
        noteId: Types.ObjectId,
        userId: string
    ) {
        const parentBlock = await this.blockRepo.findActiveById(parentBlockId);

        if (!parentBlock) {
            throw new ApiError({
                statusCode: 404,
                message: "Parent block not found",
            });
        }

        if (parentBlock.noteId.toString() !== noteId.toString()) {
            throw new ApiError({
                statusCode: 400,
                message: "Parent block must belong to the same note",
            });
        }

        // Verify user can access the parent block's note
        await this.assertUserCanAccessNote(
            { vaultId: parentBlock.noteId, workspaceId: new Types.ObjectId(""), ...parentBlock } as any,
            userId
        );
    }

    private async assertWorkspaceAccess(
        workspaceId: string,
        userId: string
    ) {
        const isMember = await this.memberRepo.exists({
            workspaceId: new Types.ObjectId(workspaceId),
            userId: new Types.ObjectId(userId),
        });

        if (!isMember) {
            throw new ApiError({
                statusCode: 403,
                message: "Access denied. You are not a member of this workspace.",
            });
        }
    }

    private async assertVaultAccess(
        vaultId: string,
        userId: string
    ) {
        const vault = await this.vaultRepo.findById(new Types.ObjectId(vaultId));

        if (!vault) {
            throw new ApiError({
                statusCode: 404,
                message: "Vault not found",
            });
        }

        await this.assertWorkspaceAccess(vault.workspaceId.toString(), userId);
    }

    private async assertUserCanAccessNote(
        note: { vaultId: Types.ObjectId; workspaceId: Types.ObjectId } & Partial<IBlock>,
        userId: string
    ) {
        await this.assertVaultAccess(
            note.vaultId.toString(),
            userId
        );
    }

    private async assertUserCanAccessBlock(
        block: IBlock,
        userId: string
    ) {
        const note = await this.noteRepo.findActiveById(block.noteId);
        if (!note) {
            throw new ApiError({
                statusCode: 404,
                message: "Note not found",
            });
        }

        await this.assertUserCanAccessNote(note as any, userId);
    }

    private async deleteBlockAndChildren(
        blockId: Types.ObjectId,
        session: ClientSession
    ) {
        const children = await this.blockRepo.findChildren(
            (await this.blockRepo.findById(blockId))!.noteId,
            blockId
        );

        for (const child of children) {
            await this.deleteBlockAndChildren(child._id, session);
        }

        await this.blockRepo.remove(blockId, session);
    }
}

export default new BlockService(
    blockRepository,
    noteRepository,
    vaultRepository,
    memberRepository
);
