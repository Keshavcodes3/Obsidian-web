import { Request, Response } from "express";
import { Types } from "mongoose";

import { asyncHandler } from "@/common/utils/asyncHandler";
import { ApiSuccess } from "@/common/utils/apiSuccess";
import { ApiError } from "@/common/utils/apiError";
import memberService from "../services/member.service";

export const getWorkspaceMembers = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;

    if (!workspaceId) {
        throw new ApiError({ statusCode: 400, message: "Workspace ID is required" });
    }

    const members = await memberService.getWorkspaceMembers(new Types.ObjectId(workspaceId as string));

    res.status(200).json(
        new ApiSuccess({
            message: "Workspace members retrieved successfully",
            data: members,
        })
    );
});

export const getMember = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId, memberId } = req.params;

    if (!workspaceId || !memberId) {
        throw new ApiError({ statusCode: 400, message: "Workspace ID and Member ID are required" });
    }

    const member = await memberService.getMember({
        workspaceId: new Types.ObjectId(workspaceId as string),
        userId: new Types.ObjectId(memberId as string),
    });

    res.status(200).json(
        new ApiSuccess({
            message: "Member retrieved successfully",
            data: member,
        })
    );
});

export const updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId, memberId } = req.params;
    const { role } = req.body;

    if (!workspaceId || !memberId) {
        throw new ApiError({ statusCode: 400, message: "Workspace ID and Member ID are required" });
    }

    if (!role) {
        throw new ApiError({ statusCode: 400, message: "Role is required" });
    }

    const updatedMember = await memberService.updateMemberRole({
        workspaceId: new Types.ObjectId(workspaceId as string),
        userId: new Types.ObjectId(memberId as string),
        role,
    });

    res.status(200).json(
        new ApiSuccess({
            message: "Member role updated successfully",
            data: updatedMember,
        })
    );
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId, memberId } = req.params;

    if (!workspaceId || !memberId) {
        throw new ApiError({ statusCode: 400, message: "Workspace ID and Member ID are required" });
    }

    await memberService.removeMember({
        workspaceId: new Types.ObjectId(workspaceId as string),
        userId: new Types.ObjectId(memberId as string),
    });

    res.status(200).json(
        new ApiSuccess({
            message: "Member removed successfully",
            data: null,
        })
    );
});

export const leaveWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user?.userId;

    if (!workspaceId) {
        throw new ApiError({ statusCode: 400, message: "Workspace ID is required" });
    }

    if (!userId) {
        throw new ApiError({ statusCode: 401, message: "Unauthorized" });
    }

    await memberService.leaveWorkspace({
        workspaceId: new Types.ObjectId(workspaceId as string),
        userId: new Types.ObjectId(userId),
    });

    res.status(200).json(
        new ApiSuccess({
            message: "Successfully left the workspace",
            data: null,
        })
    );
});

export const transferOwnership = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const { newOwnerId } = req.body;
    const currentOwnerId = req.user?.userId;

    if (!workspaceId) {
        throw new ApiError({ statusCode: 400, message: "Workspace ID is required" });
    }

    if (!newOwnerId) {
        throw new ApiError({ statusCode: 400, message: "New Owner ID is required" });
    }

    if (!currentOwnerId) {
        throw new ApiError({ statusCode: 401, message: "Unauthorized" });
    }

    await memberService.transferOwnership({
        workspaceId: new Types.ObjectId(workspaceId as string),
        currentOwnerId: new Types.ObjectId(currentOwnerId as string),
        newOwnerId: new Types.ObjectId(newOwnerId as string),
    });

    res.status(200).json(
        new ApiSuccess({
            message: "Ownership transferred successfully",
            data: null,
        })
    );
});
