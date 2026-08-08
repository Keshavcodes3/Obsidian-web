import { Types } from "mongoose";

export interface UpdateNoteDTO {
    title?: string;
    folderId?: Types.ObjectId | null;
    icon?: string;
    coverImage?: string;
    isPinned?: boolean;
    isArchived?: boolean;
}

export class UpdateNoteDTOClass implements UpdateNoteDTO {
    title?: string;
    folderId?: Types.ObjectId | null;
    icon?: string;
    coverImage?: string;
    isPinned?: boolean;
    isArchived?: boolean;

    constructor(data: UpdateNoteDTO) {
        this.title = data.title?.trim();
        this.folderId = data.folderId;
        this.icon = data.icon;
        this.coverImage = data.coverImage;
        this.isPinned = data.isPinned;
        this.isArchived = data.isArchived;
    }
}
