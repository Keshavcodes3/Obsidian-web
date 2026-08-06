import { Types } from "mongoose";

export interface VaultSettings {
    allowAttachments: boolean;
    allowWikiLinks: boolean;
}

export interface VaultInterface {
    _id: Types.ObjectId;

    workspaceId: Types.ObjectId;

    createdBy: Types.ObjectId;
    coverImage?: string;
    name: string;

    slug: string;

    description?: string;

    icon?: string;

    color?: string;

    isDefault: boolean;

    settings: VaultSettings;
}