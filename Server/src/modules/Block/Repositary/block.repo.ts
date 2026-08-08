import { Types, ClientSession } from "mongoose";
import blockModell from "../Model/block.model";
import { CreateBlockDTO, UpdateBlockDTO, ReorderBlocksDTO } from "../Dto/block.dto";

class BlockRepository {
    constructor(
        private readonly blockModel: typeof blockModell
    ) { }

    // CREATE
    create = async (payload: CreateBlockDTO, session?: ClientSession) => {
        if (session) {
            return await this.blockModel.create([payload], { session });
        }
        return await this.blockModel.create(payload);
    };

    // CREATE MANY
    createMany = async (payload: CreateBlockDTO[], session?: ClientSession) => {
        if (session) {
            return await this.blockModel.insertMany(payload, { session });
        }
        return await this.blockModel.insertMany(payload);
    };

    // FIND BY ID (includes deleted)
    findById = async (
        blockId: Types.ObjectId
    ) => {
        return await this.blockModel.findById(blockId);
    };

    // FIND ACTIVE BLOCK
    findActiveById = async (
        blockId: Types.ObjectId
    ) => {
        return await this.blockModel.findOne({
            _id: blockId,
            isDeleted: false,
        });
    };

    // FIND ALL BLOCKS OF A NOTE
    findByNote = async (
        noteId: Types.ObjectId
    ) => {
        return await this.blockModel
            .find({
                noteId,
                isDeleted: false,
            })
            .sort({
                order: 1,
            });
    };

    // FIND CHILDREN OF A BLOCK
    findChildren = async (
        noteId: Types.ObjectId,
        parentBlockId: Types.ObjectId
    ) => {
        return await this.blockModel
            .find({
                noteId,
                parentBlockId,
                isDeleted: false,
            })
            .sort({
                order: 1,
            });
    };

    // FIND ROOT BLOCKS
    findRootBlocks = async (
        noteId: Types.ObjectId
    ) => {
        return await this.blockModel
            .find({
                noteId,
                parentBlockId: null,
                isDeleted: false,
            })
            .sort({
                order: 1,
            });
    };

    // CHECK EXISTENCE
    exists = async (
        blockId: Types.ObjectId
    ) => {
        return await this.blockModel.exists({
            _id: blockId,
            isDeleted: false,
        });
    };

    // CHECK IF BLOCK BELONGS TO NOTE
    existsByNote = async (
        blockId: Types.ObjectId,
        noteId: Types.ObjectId
    ) => {
        return await this.blockModel.exists({
            _id: blockId,
            noteId,
            isDeleted: false,
        });
    };

    // UPDATE BLOCK
    update = async (
        blockId: Types.ObjectId,
        payload: UpdateBlockDTO,
        session?: ClientSession
    ) => {
        const options = session ? { session, new: true, runValidators: true } : { new: true, runValidators: true };
        return await this.blockModel.findOneAndUpdate(
            {
                _id: blockId,
                isDeleted: false,
            },
            {
                $set: payload,
            },
            options
        );
    };

    // MOVE BLOCK
    move = async (
        blockId: Types.ObjectId,
        parentBlockId: Types.ObjectId | null,
        order: number,
        session?: ClientSession
    ) => {
        const options = session ? { session, new: true, runValidators: true } : { new: true, runValidators: true };
        return await this.blockModel.findOneAndUpdate(
            {
                _id: blockId,
                isDeleted: false,
            },
            {
                $set: {
                    parentBlockId,
                    order,
                },
            },
            options
        );
    };

    // REORDER BLOCK
    updateOrder = async (
        blockId: Types.ObjectId,
        order: number,
        session?: ClientSession
    ) => {
        const options = session ? { session, new: true, runValidators: true } : { new: true, runValidators: true };
        return await this.blockModel.findOneAndUpdate(
            {
                _id: blockId,
                isDeleted: false,
            },
            {
                $set: {
                    order,
                },
            },
            options
        );
    };

    // BATCH REORDER BLOCKS
    batchReorder = async (
        noteId: Types.ObjectId,
        reorderData: ReorderBlocksDTO,
        session?: ClientSession
    ) => {
        const operations = reorderData.blocks.map((item) => ({
            updateOne: {
                filter: {
                    _id: item.blockId,
                    noteId,
                    isDeleted: false,
                },
                update: {
                    $set: {
                        order: item.order,
                    },
                },
            },
        }));

        const options = session ? { session } : {};
        return await this.blockModel.bulkWrite(operations, options);
    };

    // SOFT DELETE
    remove = async (
        blockId: Types.ObjectId,
        session?: ClientSession
    ) => {
        const options = session ? { session, new: true, runValidators: true } : { new: true, runValidators: true };
        return await this.blockModel.findOneAndUpdate(
            {
                _id: blockId,
                isDeleted: false,
            },
            {
                $set: {
                    isDeleted: true,
                },
            },
            options
        );
    };

    // RESTORE
    restore = async (
        blockId: Types.ObjectId,
        session?: ClientSession
    ) => {
        const options = session ? { session, new: true, runValidators: true } : { new: true, runValidators: true };
        return await this.blockModel.findOneAndUpdate(
            {
                _id: blockId,
                isDeleted: true,
            },
            {
                $set: {
                    isDeleted: false,
                },
            },
            options
        );
    };

    // DELETE ALL BLOCKS OF A NOTE
    removeByNote = async (
        noteId: Types.ObjectId,
        session?: ClientSession
    ) => {
        const options = session ? { session } : {};
        return await this.blockModel.updateMany(
            {
                noteId,
                isDeleted: false,
            },
            {
                $set: {
                    isDeleted: true,
                },
            },
            options
        );
    };

    // RESTORE ALL BLOCKS OF A NOTE
    restoreByNote = async (
        noteId: Types.ObjectId,
        session?: ClientSession
    ) => {
        const options = session ? { session } : {};
        return await this.blockModel.updateMany(
            {
                noteId,
                isDeleted: true,
            },
            {
                $set: {
                    isDeleted: false,
                },
            },
            options
        );
    };

    // COUNT BLOCKS IN NOTE
    countByNote = async (noteId: Types.ObjectId) => {
        return await this.blockModel.countDocuments({
            noteId,
            isDeleted: false,
        });
    };

    // COUNT CHILDREN OF BLOCK
    countChildren = async (
        noteId: Types.ObjectId,
        parentBlockId: Types.ObjectId
    ) => {
        return await this.blockModel.countDocuments({
            noteId,
            parentBlockId,
            isDeleted: false,
        });
    };

    // GET BLOCK WITH CHILDREN (for tree structure)
    findWithChildren = async (
        noteId: Types.ObjectId,
        parentBlockId: Types.ObjectId | null = null
    ) => {
        return await this.blockModel
            .find({
                noteId,
                parentBlockId,
                isDeleted: false,
            })
            .sort({
                order: 1,
            });
    };

    // CHECK FOR CIRCULAR REFERENCE
    wouldCreateCircularReference = async (
        blockId: Types.ObjectId,
        newParentBlockId: Types.ObjectId
    ) => {
        if (blockId.toString() === newParentBlockId.toString()) {
            return true;
        }

        let currentParent = newParentBlockId;
        while (currentParent) {
            const parentBlock = await this.blockModel.findById(currentParent);
            if (!parentBlock) break;
            if (parentBlock._id.toString() === blockId.toString()) {
                return true;
            }
            currentParent = parentBlock.parentBlockId as Types.ObjectId;
        }
        return false;
    };
}

export default new BlockRepository(blockModell);