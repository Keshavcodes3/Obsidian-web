import { Types } from "mongoose";

import { WorkspaceRole } from "@/modules/Workspace/enum/workspace-role.enum";

export enum MemberStatus {
    PENDING = "pending",
    ACTIVE = "active",
    SUSPENDED = "suspended",
    REMOVED = "removed",
}

export interface MemberInterface {
    _id: Types.ObjectId;

    workspaceId: Types.ObjectId;

    userId: Types.ObjectId;

    role: WorkspaceRole;

    status: MemberStatus;

    invitedBy?: Types.ObjectId;

    joinedAt?: Date;

    lastActiveAt?: Date;
}

export interface CreateMemberDTO {
    workspaceId: Types.ObjectId;

    userId: Types.ObjectId;

    role: WorkspaceRole;

    invitedBy?: Types.ObjectId;
}