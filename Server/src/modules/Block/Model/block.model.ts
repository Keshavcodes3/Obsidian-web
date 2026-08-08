import {
    Document,
    Schema,
    Types,
    model,
} from "mongoose";

import {
    BlockType,
    IBlock,
} from "../Types/block.types";

export interface IBlockDocument extends IBlock, Document {
    createdAt: Date;
    updatedAt: Date;
}

const blockSchema = new Schema<IBlockDocument>(
    {
        noteId: {
            type: Schema.Types.ObjectId,
            ref: "Note",
            required: true,
            index: true,
        },

        parentBlockId: {
            type: Schema.Types.ObjectId,
            ref: "Block",
            default: null,
            index: true,
        },

        type: {
            type: String,
            enum: Object.values(BlockType),
            required: true,
        },

        props: {
            type: Schema.Types.Mixed,
            required: true,
            default: {},
        },

        order: {
            type: Number,
            required: true,
            default: 0,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

blockSchema.index({
    noteId: 1,
    parentBlockId: 1,
    order: 1,
}, {
    unique: true,
    partialFilterExpression: { isDeleted: false },
});

blockSchema.index({
    noteId: 1,
    isDeleted: 1,
});

blockSchema.index({
    parentBlockId: 1,
    isDeleted: 1,
});

blockSchema.index({
    createdBy: 1,
    isDeleted: 1,
});

const blockModel = model<IBlockDocument>("Block", blockSchema)
export default blockModel