import { Types } from "mongoose";

export interface CreateNoteDTO {
    vaultId: Types.ObjectId;
    folderId?: Types.ObjectId | null;
    workspaceId: Types.ObjectId;
    title: string;
    icon?: string;
    coverImage?: string;
}

export class CreateNoteDTOClass implements CreateNoteDTO {
    vaultId: Types.ObjectId;
    folderId?: Types.ObjectId | null;
    workspaceId: Types.ObjectId;
    title: string;
    icon?: string;
    coverImage?: string;

    constructor(data: CreateNoteDTO) {
        this.vaultId = data.vaultId;
        this.folderId = data.folderId;
        this.workspaceId = data.workspaceId;
        this.title = data.title.trim();
        this.icon = data.icon;
        this.coverImage = data.coverImage;
    }
}
