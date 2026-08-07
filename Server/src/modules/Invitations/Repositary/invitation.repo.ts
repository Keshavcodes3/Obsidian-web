import { Types } from "mongoose";

import { InvitationModel } from "../Models/invitation.model";
import { type CreateInvitationDTO, InvitationStatus } from "../Types/invitation.types";

class InvitationRepository {
    create = async (payload: CreateInvitationDTO & {
        token: string;
        expiresAt: Date;
    }) => {
        return InvitationModel.create(payload);
    };

    findById = async (
        invitationId: Types.ObjectId
    ) => {
        return InvitationModel.findById(invitationId);
    };

    findByToken = async (
        token: string
    ) => {
        return InvitationModel.findOne({ token });
    };

    findPendingByEmail = async (payload: {
        workspaceId: Types.ObjectId;
        email: string;
    }) => {
        return InvitationModel.findOne({
            workspaceId: payload.workspaceId,
            email: payload.email,
            status: InvitationStatus.PENDING,
        });
    };

    findWorkspaceInvitations = async (
        workspaceId: Types.ObjectId
    ) => {
        return InvitationModel.find({
            workspaceId,
        });
    };

    existsPendingInvitation = async (payload: {
        workspaceId: Types.ObjectId;
        email: string;
    }) => {
        return !!(
            await InvitationModel.exists({
                workspaceId: payload.workspaceId,
                email: payload.email,
                status: InvitationStatus.PENDING,
            })
        );
    };

    updateStatus = async (
        invitationId: Types.ObjectId,
        status: InvitationStatus
    ) => {
        const update: Record<string, unknown> = {
            status,
        };

        switch (status) {
            case InvitationStatus.ACCEPTED:
                update.acceptedAt = new Date();
                break;

            case InvitationStatus.REJECTED:
                update.rejectedAt = new Date();
                break;

            case InvitationStatus.CANCELLED:
                update.cancelledAt = new Date();
                break;
        }

        return InvitationModel.findByIdAndUpdate(
            invitationId,
            update,
            {
                new: true,
                runValidators: true,
            }
        );
    };

    delete = async (
        invitationId: Types.ObjectId
    ) => {
        return InvitationModel.findByIdAndDelete(
            invitationId
        );
    };

    deleteExpired = async () => {
        return InvitationModel.deleteMany({
            expiresAt: {
                $lt: new Date(),
            },
            status: InvitationStatus.PENDING,
        });
    };

    expireInvitations = async () => {
        return InvitationModel.updateMany(
            {
                expiresAt: {
                    $lt: new Date(),
                },
                status: InvitationStatus.PENDING,
            },
            {
                status: InvitationStatus.EXPIRED,
            }
        );
    };

    countPending = async (
        workspaceId: Types.ObjectId
    ) => {
        return InvitationModel.countDocuments({
            workspaceId,
            status: InvitationStatus.PENDING,
        });
    };

    findMany = async (
        filter: Record<string, unknown>
    ) => {
        return InvitationModel.find(filter);
    };

    findOne = async (
        filter: Record<string, unknown>
    ) => {
        return InvitationModel.findOne(filter);
    };
}

const invitationRepository =
    new InvitationRepository();

export default invitationRepository;