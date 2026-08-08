import { Types } from "mongoose";

export enum BlockType {
    PARAGRAPH = "PARAGRAPH",
    HEADING = "HEADING",
    CODE = "CODE",
    IMAGE = "IMAGE",
    QUOTE = "QUOTE",
    BULLET_LIST = "BULLET_LIST",
    NUMBERED_LIST = "NUMBERED_LIST",
    CHECKLIST = "CHECKLIST",
    TABLE = "TABLE",
    CALLOUT = "CALLOUT",
    DIVIDER = "DIVIDER",
    TOGGLE = "TOGGLE",
    EMBED = "EMBED",
}


export interface IBlock {
    noteId: Types.ObjectId;

    parentBlockId?: Types.ObjectId | null;

    type: BlockType;

    props: Record<string, unknown>;

    order: number;

    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;

    isDeleted: boolean;
}

export type BlockProps = Record<string, unknown>;