import { Types } from "mongoose";

import { MemberModel } from "../models/member.model";
import { CreateMemberDTO } from "../types/member.types";
import { WorkspaceRole } from "@/modules/Workspace/enum/workspace-role.enum";

class MemberRepository {
    create = async (payload: CreateMemberDTO) => {
        return MemberModel.create(payload);
    };

    findById = async (memberId: Types.ObjectId) => {
        return MemberModel.findById(memberId);
    };

    findMember = async (payload: {
        workspaceId: Types.ObjectId;
        userId: Types.ObjectId;
    }) => {
        return MemberModel.findOne(payload);
    };

    findByWorkspace = async (workspaceId: Types.ObjectId) => {
        return MemberModel.find({ workspaceId });
    };

    findByUser = async (userId: Types.ObjectId) => {
        return MemberModel.find({ userId });
    };

    findOwners = async (workspaceId: Types.ObjectId) => {
        return MemberModel.find({
            workspaceId,
            role: WorkspaceRole.OWNER,
        });
    };

    findAdmins = async (workspaceId: Types.ObjectId) => {
        return MemberModel.find({
            workspaceId,
            role: WorkspaceRole.ADMIN,
        });
    };

    exists = async (payload: {
        workspaceId: Types.ObjectId;
        userId: Types.ObjectId;
    }) => {
        return !!(await MemberModel.exists(payload));
    };

    countMembers = async (workspaceId: Types.ObjectId) => {
        return MemberModel.countDocuments({
            workspaceId,
        });
    };

    countOwners = async (workspaceId: Types.ObjectId) => {
        return MemberModel.countDocuments({
            workspaceId,
            role: WorkspaceRole.OWNER,
        });
    };

    updateRole = async (payload: {
        workspaceId: Types.ObjectId;
        userId: Types.ObjectId;
        role: WorkspaceRole;
    }) => {
        return MemberModel.findOneAndUpdate(
            {
                workspaceId: payload.workspaceId,
                userId: payload.userId,
            },
            {
                role: payload.role,
            },
            {
                new: true,
                runValidators: true,
            }
        );
    };

    updateLastActive = async (
        memberId: Types.ObjectId
    ) => {
        return MemberModel.findByIdAndUpdate(
            memberId,
            {
                lastActiveAt: new Date(),
            },
            { new: true }
        );
    };

    remove = async (memberId: Types.ObjectId) => {
        return MemberModel.findByIdAndDelete(memberId);
    };

    removeByWorkspace = async (
        workspaceId: Types.ObjectId
    ) => {
        return MemberModel.deleteMany({
            workspaceId,
        });
    };

    removeByUser = async (
        userId: Types.ObjectId
    ) => {
        return MemberModel.deleteMany({
            userId,
        });
    };
}

const memberRepository = new MemberRepository();

export default memberRepository;