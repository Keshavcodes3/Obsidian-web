import { Types } from "mongoose";
import { WorkspaceRole } from "../enum/workspace-role.enum";

import { WorkspaceVisibility } from "../enum/workspace-visibility.enum";

export interface WorkspaceMember {
    userId: Types.ObjectId;
    role: WorkspaceRole;
    joinedAt: Date;
}

export interface WorkspaceSettings {
    allowInvites: boolean;
    defaultVaultName: string;
}

export interface WorkspaceInterface {
    _id: Types.ObjectId;

    name: string;

    slug: string;

    description?: string;

    visibility: WorkspaceVisibility;

    ownerId: Types.ObjectId;

    members: WorkspaceMember[];

    settings: WorkspaceSettings;
}