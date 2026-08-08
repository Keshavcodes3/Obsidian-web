import { Types } from "mongoose";
import { BlockType } from "../Types/block.types";

export interface CreateBlockDTO {
    noteId: Types.ObjectId;
    parentBlockId?: Types.ObjectId | null;
    type: BlockType;
    props: Record<string, unknown>;
    order?: number;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}

export interface UpdateBlockDTO {
    type?: BlockType;
    props?: Record<string, unknown>;
    parentBlockId?: Types.ObjectId | null;
    order?: number;
    updatedBy?: Types.ObjectId;
}

export interface MoveBlockDTO {
    parentBlockId?: Types.ObjectId | null;
    order: number;
}

export interface ReorderBlockItemDTO {
    blockId: Types.ObjectId;
    order: number;
}

export interface ReorderBlocksDTO {
    blocks: ReorderBlockItemDTO[];
}

export interface RestoreBlockDTO {
    blockId: Types.ObjectId;
}