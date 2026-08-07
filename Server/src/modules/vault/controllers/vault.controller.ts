import { Types } from "mongoose";
import { Request, Response } from "express";

import { asyncHandler } from "@/common/utils/asyncHandler";
import { ApiSuccess } from "@/common/utils/apiSuccess";
import vaultServicee from "../services/vault.service";

class VaultController {
    constructor(
        private readonly vaultService: typeof vaultServicee
    ) { }

    createVault = asyncHandler(
        async (req: Request, res: Response) => {
            const vault = await this.vaultService.createVault(
                //@ts-ignore
                req.params.workspaceId,
                req.user!.userId,
                req.body
            );

            return res.status(201).json({
                success: true,
                message: "vault created successfully",
                data: vault
            })
        }
    );

    getVaultById = asyncHandler(
        async (req: Request, res: Response) => {
            const vault = await this.vaultService.getVaultById(
                //@ts-ignore
                req.params.vaultId
            );

            return res.status(201).json({
                success: true,
                message: "vault fetched successfully",
                data: vault
            })
        }
    );

    getWorkspaceVaults = asyncHandler(
        async (req: Request, res: Response) => {
            const vaults =
                await this.vaultService.getWorkspaceVaults(
                    //@ts-ignore
                    new Types.ObjectId(req.params.workspaceId)
                );

            return res.status(201).json({
                success: true,
                message: "vault fetched successfully",
                data: vaults
            })
        }
    );

    updateVault = asyncHandler(
        async (req: Request, res: Response) => {
            const vault =
                await this.vaultService.updateVault(
                    req.params.vaultId[0],
                    req.body
                );

            return res.status(201).json({
                success: true,
                message: "vault updated successfully",
                data: vault
            })
        }
    );

    deleteVault = asyncHandler(
        async (req: Request, res: Response) => {
            await this.vaultService.deleteVault(
                req.params.vaultId[0]
            );

            return res.status(201).json({
                success: true,
                message: "vault deleted successfully",
            })
        }
    );

    getDefaultVault = asyncHandler(
        async (req: Request, res: Response) => {
            const vault =
                await this.vaultService.getDefaultVault(
                    req.params.workspaceId[0]
                );

            return res.status(201).json({
                success: true,
                message: "Default vault updated successfully",
                data: vault
            })
        }
    );

    setDefaultVault = asyncHandler(
        async (req: Request, res: Response) => {
            const vault =
                await this.vaultService.setDefaultVault(
                    req.params.workspaceId[0],
                    req.params.vaultId[0]
                );

            return res.status(201).json({
                success: true,
                message: "default vault updated successfully",
                data: vault
            })
        }
    );
}

export default new VaultController(vaultServicee);