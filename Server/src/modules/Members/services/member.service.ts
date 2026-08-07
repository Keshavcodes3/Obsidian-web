import { Types } from "mongoose";

import { ApiError } from "@/common/utils/apiError";
import { eventBus } from "@/common/events";

import memberRepository from "../repositories/member.repo";
import workspaceRepository from "@/modules/Workspace/repositories/workspace.repository";
import userRepository from "@/modules/users/repositories/user.repo";

import { WorkspaceRole } from "@/modules/Workspace/enum/workspace-role.enum";
import { MEMBER_EVENTS } from "../events/member.events";

class MemberService {
    constructor(
        private readonly memberRepo: typeof memberRepository,
        private readonly workspaceRepo: typeof workspaceRepository,
        private readonly userRepo: typeof userRepository
    ) { }

    createOwnerMembership = async (payload: {
        workspaceId: Types.ObjectId;
        userId: Types.ObjectId;
    }) => {

        const workspace = await this.workspaceRepo.findById(
            payload.workspaceId.toString()
        );

        if (!workspace) {
            throw new ApiError({
                statusCode: 404,
                message: "Workspace not found",
            });
        }

        const user = await this.userRepo.findById(
            payload.userId.toString()
        );

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }

        const exists = await this.memberRepo.findMember({
            workspaceId: payload.workspaceId,
            userId: payload.userId,
        });

        if (exists) {
            throw new ApiError({
                statusCode: 409,
                message: "Member already exists",
            });
        }

        const member = await this.memberRepo.create({
            workspaceId: payload.workspaceId,
            userId: payload.userId,
            role: WorkspaceRole.OWNER,
        });

        eventBus.publish(MEMBER_EVENTS.CREATED, {
            workspaceId: payload.workspaceId.toString(),
            userId: payload.userId.toString(),
            role: WorkspaceRole.OWNER,
        });

        return member;
    };

    createMembership = async (payload: {
        workspaceId: Types.ObjectId;
        userId: Types.ObjectId;
        invitedBy: Types.ObjectId;
        role: WorkspaceRole;
    }) => {

        const exists = await this.memberRepo.findMember({
            workspaceId: payload.workspaceId,
            userId: payload.userId,
        });

        if (exists) {
            throw new ApiError({
                statusCode: 409,
                message: "Member already exists",
            });
        }

        const member = await this.memberRepo.create({
            workspaceId: payload.workspaceId,
            userId: payload.userId,
            invitedBy: payload.invitedBy,
            role: payload.role,
        });

        eventBus.publish(MEMBER_EVENTS.JOINED, {
            workspaceId: payload.workspaceId.toString(),
            userId: payload.userId.toString(),
            invitedBy: payload.invitedBy.toString(),
            role: payload.role,
        });

        return member;
    };

    getWorkspaceMembers = async (
        workspaceId: Types.ObjectId
    ) => {
        return this.memberRepo.findByWorkspace(workspaceId);
    };

    existsMember = async (payload: {
        workspaceId: Types.ObjectId;
        userId: Types.ObjectId;
    }) => {
        return this.memberRepo.exists(payload);
    };

    getMember = async (payload: {
        workspaceId: Types.ObjectId;
        userId: Types.ObjectId;
    }) => {

        const member = await this.memberRepo.findMember(payload);

        if (!member) {
            throw new ApiError({
                statusCode: 404,
                message: "Member not found",
            });
        }

        return member;
    };

    updateMemberRole = async (payload: {
        workspaceId: Types.ObjectId;
        userId: Types.ObjectId;
        role: WorkspaceRole;
    }) => {

        const member = await this.memberRepo.findMember({
            workspaceId: payload.workspaceId,
            userId: payload.userId,
        });

        if (!member) {
            throw new ApiError({
                statusCode: 404,
                message: "Member not found",
            });
        }

        const updated = await this.memberRepo.updateRole({
            workspaceId: payload.workspaceId,
            userId: payload.userId,
            role: payload.role,
        });

        eventBus.publish(MEMBER_EVENTS.ROLE_UPDATED, {
            workspaceId: payload.workspaceId.toString(),
            userId: payload.userId.toString(),
            role: payload.role,
        });

        return updated;
    };

    removeMember = async (payload: {
        workspaceId: Types.ObjectId;
        userId: Types.ObjectId;
    }) => {

        const member = await this.memberRepo.findMember(payload);

        if (!member) {
            throw new ApiError({
                statusCode: 404,
                message: "Member not found",
            });
        }

        await this.memberRepo.remove(member._id as Types.ObjectId);

        eventBus.publish(MEMBER_EVENTS.REMOVED, {
            workspaceId: payload.workspaceId.toString(),
            userId: payload.userId.toString(),
        });

        return true;
    };

    leaveWorkspace = async (payload: {
        workspaceId: Types.ObjectId;
        userId: Types.ObjectId;
    }) => {

        const member = await this.memberRepo.findMember(payload);

        if (!member) {
            throw new ApiError({
                statusCode: 404,
                message: "Member not found",
            });
        }

        if (member.role === WorkspaceRole.OWNER) {
            throw new ApiError({
                statusCode: 400,
                message: "Owner cannot leave the workspace",
            });
        }

        await this.memberRepo.remove(member._id as Types.ObjectId);

        eventBus.publish(MEMBER_EVENTS.LEFT, {
            workspaceId: payload.workspaceId.toString(),
            userId: payload.userId.toString(),
        });

        return true;
    };

    transferOwnership = async (payload: {
        workspaceId: Types.ObjectId;
        currentOwnerId: Types.ObjectId;
        newOwnerId: Types.ObjectId;
    }) => {

        await this.memberRepo.updateRole({
            workspaceId: payload.workspaceId,
            userId: payload.currentOwnerId,
            role: WorkspaceRole.ADMIN,
        });

        await this.memberRepo.updateRole({
            workspaceId: payload.workspaceId,
            userId: payload.newOwnerId,
            role: WorkspaceRole.OWNER,
        });

        eventBus.publish(MEMBER_EVENTS.OWNER_TRANSFERRED, {
            workspaceId: payload.workspaceId.toString(),
            previousOwner: payload.currentOwnerId.toString(),
            newOwner: payload.newOwnerId.toString(),
        });

        return true;
    };

}

export default new MemberService(
    memberRepository,
    workspaceRepository,
    userRepository
);