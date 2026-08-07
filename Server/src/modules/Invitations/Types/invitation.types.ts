import { Types } from "mongoose";

import { WorkspaceRole } from "@/modules/Workspace/enum/workspace-role.enum";

export enum InvitationStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
}

export interface IInvitation {
    _id: Types.ObjectId;

    workspaceId: Types.ObjectId;

    email: string;

    role: WorkspaceRole;

    invitedBy: Types.ObjectId;

    token: string;

    status: InvitationStatus;

    expiresAt: Date;

    acceptedAt?: Date;

    rejectedAt?: Date;

    cancelledAt?: Date;

    createdAt: Date;

    updatedAt: Date;
}

export interface CreateInvitationDTO {
    workspaceId: Types.ObjectId;

    email: string;

    role: WorkspaceRole;

    invitedBy: Types.ObjectId;
}