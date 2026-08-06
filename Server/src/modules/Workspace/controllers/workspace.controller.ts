import { Request, Response } from "express";

import { asyncHandler } from "@/common/utils/asyncHandler";
import { ApiSuccess } from "@/common/utils/apiSuccess";

import workspaceService from "../services/workspace.service";

class WorkspaceController {

    /**
     * POST /workspaces
     */
    createWorkspace = asyncHandler(async (req: Request, res: Response) => {

        const workspace = await workspaceService.createWorkspace(
            req.user!.userId.toString(),
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Workspace created",
            data: workspace
        })
    });

    /**
     * GET /workspaces
     */
    getMyWorkspaces = asyncHandler(async (req: Request, res: Response) => {

        const workspaces = await workspaceService.getMyWorkspaces(
            req.user!.userId.toString()
        );

        return res.status(200).json({
            success: true,
            message: "Workspace fetched ",
            data: workspaces
        })
    });

    /**
     * GET /workspaces/:workspaceId
     */
    getWorkspaceById = asyncHandler(async (req: Request, res: Response) => {

        const workspace = await workspaceService.getWorkspaceById(
            //@ts-ignore
            req.params.workspaceId
        );

        return res.status(200).json({
            success: true,
            message: "Workspace fetched ",
            data: workspace
        })
    });

    /**
     * PATCH /workspaces/:workspaceId
     */
    updateWorkspace = asyncHandler(async (req: Request, res: Response) => {

        const workspace = await workspaceService.updateWorkspace(
            //@ts-ignore
            req.params.workspaceId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Workspace updated ",
            data: workspace
        })
    });

    /**
     * DELETE /workspaces/:workspaceId
     */
    deleteWorkspace = asyncHandler(async (req: Request, res: Response) => {

        await workspaceService.deleteWorkspace(
            //@ts-ignore
            req.params.workspaceId
        );

        return res.status(200).json({
            success: true,
            message: "Workspace deleted ",
            data: null
        })
    });
}

export default new WorkspaceController();