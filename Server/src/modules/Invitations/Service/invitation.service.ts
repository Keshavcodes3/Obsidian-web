import crypto from "crypto";
import { Types } from "mongoose";

import { ApiError } from "@/common/utils/apiError";
import { eventBus } from "@/common/events";

import invitationRepository from "../Repositary/invitation.repo";
import workspaceRepository from "@/modules/Workspace/repositories/workspace.repository";
import userRepository from "@/modules/users/repositories/user.repo";

import { WorkspaceRole } from "@/modules/Workspace/enum/workspace-role.enum";
import { InvitationStatus } from "../Types/invitation.types";
import memberServicee from "@/modules/Members/services/member.service";
import { INVITATION_EVENTS } from "../Events/invitation.events";

class InvitationService {
    constructor(
        private readonly invitationRepo: typeof invitationRepository,
        private readonly workspaceRepo: typeof workspaceRepository,
        private readonly userRepo: typeof userRepository,
        private readonly memberService: typeof memberServicee
    ) { }

    inviteMember = async (payload: {
        workspaceId: string;
        invitedBy: string;
        email: string;
        role: WorkspaceRole;
    }) => {

        const workspace =
            await this.workspaceRepo.findById(payload.workspaceId);

        if (!workspace) {
            throw new ApiError({
                statusCode: 404,
                message: "Workspace not found",
            });
        }

        const user =
            await this.userRepo.findByEmail(payload.email);

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }

        const memberExists =
            await this.memberService.existsMember({
                workspaceId: new Types.ObjectId(payload.workspaceId),
                userId: user._id as Types.ObjectId,
            });

        if (memberExists) {
            throw new ApiError({
                statusCode: 409,
                message: "User is already a member",
            });
        }

        const pending =
            await this.invitationRepo.existsPendingInvitation({
                workspaceId: new Types.ObjectId(payload.workspaceId),
                email: payload.email,
            });

        if (pending) {
            throw new ApiError({
                statusCode: 409,
                message: "Invitation already exists",
            });
        }

        const token = crypto.randomUUID();

        const expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        const invitation =
            await this.invitationRepo.create({
                workspaceId: new Types.ObjectId(payload.workspaceId),
                invitedBy: new Types.ObjectId(payload.invitedBy),
                email: payload.email,
                role: payload.role,
                token,
                expiresAt,
            });

        eventBus.publish(
            INVITATION_EVENTS.CREATED,
            {
                invitationId: invitation._id.toString(),
                workspaceId: payload.workspaceId,
                invitedBy: payload.invitedBy,
                email: payload.email,
                token,
            }
        );

        return invitation;
    };

    acceptInvitation = async (token: string) => {

        const invitation =
            await this.invitationRepo.findByToken(token);

        if (!invitation) {
            throw new ApiError({
                statusCode: 404,
                message: "Invitation not found",
            });
        }

        if (invitation.status !== InvitationStatus.PENDING) {
            throw new ApiError({
                statusCode: 400,
                message: "Invitation is no longer valid",
            });
        }

        if (invitation.expiresAt < new Date()) {

            await this.invitationRepo.updateStatus(
                invitation._id,
                InvitationStatus.EXPIRED
            );

            throw new ApiError({
                statusCode: 400,
                message: "Invitation expired",
            });
        }

        const user =
            await this.userRepo.findByEmail(invitation.email);

        if (!user) {
            throw new ApiError({
                statusCode: 404,
                message: "User not found",
            });
        }

        await this.invitationRepo.updateStatus(
            invitation._id,
            InvitationStatus.ACCEPTED
        );

        eventBus.publish(
            INVITATION_EVENTS.ACCEPTED,
            {
                invitationId: invitation._id.toString(),
                workspaceId: invitation.workspaceId.toString(),
                userId: user._id.toString(),
                invitedBy: invitation.invitedBy.toString(),
                role: invitation.role,
            }
        );

        return true;
    };

    rejectInvitation = async (token: string) => {

        const invitation =
            await this.invitationRepo.findByToken(token);

        if (!invitation) {
            throw new ApiError({
                statusCode: 404,
                message: "Invitation not found",
            });
        }

        await this.invitationRepo.updateStatus(
            invitation._id,
            InvitationStatus.REJECTED
        );

        eventBus.publish(
            INVITATION_EVENTS.REJECTED,
            {
                invitationId: invitation._id.toString(),
                workspaceId: invitation.workspaceId.toString(),
            }
        );

        return true;
    };

    cancelInvitation = async (
        invitationId: string
    ) => {

        const invitation =
            await this.invitationRepo.findById(
                new Types.ObjectId(invitationId)
            );

        if (!invitation) {
            throw new ApiError({
                statusCode: 404,
                message: "Invitation not found",
            });
        }

        await this.invitationRepo.updateStatus(
            invitation._id,
            InvitationStatus.CANCELLED
        );

        eventBus.publish(
            INVITATION_EVENTS.CANCELLED,
            {
                invitationId,
            }
        );

        return true;
    };

    resendInvitation = async (
        invitationId: string
    ) => {

        const invitation =
            await this.invitationRepo.findById(
                new Types.ObjectId(invitationId)
            );

        if (!invitation) {
            throw new ApiError({
                statusCode: 404,
                message: "Invitation not found",
            });
        }

        if (invitation.status !== InvitationStatus.PENDING) {
            throw new ApiError({
                statusCode: 400,
                message: "Only pending invitations can be resent",
            });
        }

        eventBus.publish(
            INVITATION_EVENTS.RESENT,
            {
                invitationId: invitation._id.toString(),
                workspaceId: invitation.workspaceId.toString(),
                invitedBy: invitation.invitedBy.toString(),
                email: invitation.email,
                token: invitation.token,
            }
        );

        return true;
    };

    getWorkspaceInvitations = async (
        workspaceId: string
    ) => {

        return this.invitationRepo.findWorkspaceInvitations(
            new Types.ObjectId(workspaceId)
        );
    };
}

export default new InvitationService(
    invitationRepository,
    workspaceRepository,
    userRepository,
    memberServicee
);