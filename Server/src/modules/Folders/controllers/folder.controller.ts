import { Request, Response } from "express";
//@ts-ignore
import { asyncHandler } from "@/common/utils/asyncHandler";
//@ts-ignore
import { ApiSuccess } from "@/common/utils/apiSuccess";

import folderService from "../services/folder.service";

class FolderController {
    createFolder = asyncHandler(async (req: Request, res: Response) => {
        const folder = await folderService.createFolder(
            req.params.vaultId as string,
            (req as any).user.userId,
            req.body
        );

        return res.status(201).json(
            new ApiSuccess({
                message: "Folder created successfully",
                data: folder,
            })
        );
    });

    getFolderById = asyncHandler(async (req: Request, res: Response) => {
        const folder = await folderService.getFolderById(
            req.params.folderId as string,
            (req as any).user.userId
        );

        return res.status(200).json(
            new ApiSuccess({
                message: "Folder fetched successfully",
                data: folder,
            })
        );
    });

    getVaultFolders = asyncHandler(async (req: Request, res: Response) => {
        const folders = await folderService.getVaultFolders(
            req.params.vaultId as string,
            (req as any).user.userId
        );

        return res.status(200).json(
            new ApiSuccess({
                message: "Folders fetched successfully",
                data: folders,
            })
        );
    });

    updateFolder = asyncHandler(async (req: Request, res: Response) => {
        const folder = await folderService.updateFolder(
            req.params.folderId as string,
            (req as any).user.userId,
            req.body
        );

        return res.status(200).json(
            new ApiSuccess({
                message: "Folder updated successfully",
                data: folder,
            })
        );
    });

    deleteFolder = asyncHandler(async (req: Request, res: Response) => {
        await folderService.deleteFolder(
            req.params.folderId as string,
            (req as any).user.userId
        );

        return res.status(200).json(
            new ApiSuccess({
                message: "Folder deleted successfully",
                data: null,
            })
        );
    });

    moveFolder = asyncHandler(async (req: Request, res: Response) => {
        const folder = await folderService.moveFolder(
            req.params.folderId as string,
            req.body.parentFolderId || null,
            (req as any).user.userId
        );

        return res.status(200).json(
            new ApiSuccess({
                message: "Folder moved successfully",
                data: folder,
            })
        );
    });

    restoreFolder = asyncHandler(async (req: Request, res: Response) => {
        const folder = await folderService.restoreFolder(
            req.params.folderId as string,
            (req as any).user.userId
        );

        return res.status(200).json(
            new ApiSuccess({
                message: "Folder restored successfully",
                data: folder,
            })
        );
    });
}

export default new FolderController();