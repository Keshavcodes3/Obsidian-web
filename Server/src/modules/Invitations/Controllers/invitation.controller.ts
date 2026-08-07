import { Request, Response } from "express";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { ApiSuccess } from "@/common/utils/apiSuccess";
import { ApiError } from "@/common/utils/apiError";
import invitationService from "../Service/invitation.service";

export const inviteMember = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const { email, role } = req.body;
    const invitedBy = req.user?.userId;

    if (!workspaceId) {
        throw new ApiError({ statusCode: 400, message: "Workspace ID is required" });
    }

    if (!email || !role) {
        throw new ApiError({ statusCode: 400, message: "Email and Role are required" });
    }

    if (!invitedBy) {
        throw new ApiError({ statusCode: 401, message: "Unauthorized" });
    }

    const invitation = await invitationService.inviteMember({
        workspaceId: workspaceId.toString(),
        invitedBy,
        email,
        role,
    });

    res.status(201).json(
        new ApiSuccess({
            message: "Invitation sent successfully",
            data: invitation,
        })
    );
});

export const acceptInvitation = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token) {
        throw new ApiError({ statusCode: 400, message: "Invitation token is required" });
    }

    await invitationService.acceptInvitation(token as string);

    res.status(200).json(
        new ApiSuccess({
            message: "Invitation accepted successfully",
            data: null,
        })
    );
});

export const rejectInvitation = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token) {
        throw new ApiError({ statusCode: 400, message: "Invitation token is required" });
    }

    await invitationService.rejectInvitation(token as string);

    res.status(200).json(
        new ApiSuccess({
            message: "Invitation rejected successfully",
            data: null,
        })
    );
});

export const cancelInvitation = asyncHandler(async (req: Request, res: Response) => {
    const { invitationId } = req.params;

    if (!invitationId) {
        throw new ApiError({ statusCode: 400, message: "Invitation ID is required" });
    }

    await invitationService.cancelInvitation(invitationId.toString());

    res.status(200).json(
        new ApiSuccess({
            message: "Invitation cancelled successfully",
            data: null,
        })
    );
});

export const getWorkspaceInvitations = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;

    if (!workspaceId) {
        throw new ApiError({ statusCode: 400, message: "Workspace ID is required" });
    }

    const invitations = await invitationService.getWorkspaceInvitations(workspaceId as string);

    res.status(200).json(
        new ApiSuccess({
            message: "Workspace invitations retrieved successfully",
            data: invitations,
        })
    );
});
