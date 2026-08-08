import { Types } from "mongoose";

import { ApiError } from "@/common/utils/apiError";
import { eventBus } from "@/common/events";

import workspaceRepository from "@/modules/Workspace/repositories/workspace.repository";
import memberRepositoryClass from "@/modules/Members/repositories/member.repo";
import { validateObjectId } from "@/common/utils/objectId.util";

import vaultRepository from "../repositories/vault.repo";

import { generateSlug } from "../utils/generateSlug";
import { normalizeVaultName } from "../utils/normalizeVaultName";

import { createVaultDTO } from "../dtos/createVault.dto";
import { VAULT_EVENTS } from "../events/vault.event";

class VaultService {
    constructor(
        private readonly vaultRepo: typeof vaultRepository,
        private readonly workspaceRepo: typeof workspaceRepository,
        private readonly memberRepo: typeof memberRepositoryClass
    ) { }

    private async authorizeWorkspaceAccess(workspaceId: Types.ObjectId, userId: string) {
        const isMember = await this.memberRepo.exists({
            workspaceId,
            userId: new Types.ObjectId(userId)
        });
        if (!isMember) {
            const workspace = await this.workspaceRepo.findById(workspaceId);
            if (!workspace || workspace.ownerId.toString() !== userId) {
                throw new ApiError({
                    statusCode: 403,
                    message: "Access denied to workspace",
                });
            }
        }
    }

    createVault = async (
        workspaceId: string,
        userId: string,
        payload: createVaultDTO
    ) => {
        validateObjectId(workspaceId, "Workspace");
        validateObjectId(userId, "User");

        const workspaceObjId = new Types.ObjectId(workspaceId);

        await this.authorizeWorkspaceAccess(workspaceObjId, userId);

        const workspace =
            await this.workspaceRepo.findById(workspaceObjId);

        if (!workspace) {
            throw new ApiError({
                statusCode: 404,
                message: "Workspace not found",
            });
        }

        const normalizedName =
            normalizeVaultName(payload.name);

        let slug =
            generateSlug(normalizedName);

        const slugExists =
            await this.vaultRepo.existsBySlug({
                workspaceId: new Types.ObjectId(workspaceId),
                slug,
            });

        if (slugExists) {
            slug = `${slug}-${Date.now()}`;
        }

        const totalVaults = await this.vaultRepo.countByWorkspace(workspaceObjId);

        const vault =
            await this.vaultRepo.create({
                ...payload,
                name: normalizedName,
                slug,
                workspaceId: workspaceObjId,
                createdBy: new Types.ObjectId(userId),
                isDefault: totalVaults === 0,
                settings: {
                    allowAttachments: true,
                    allowWikiLinks: true,
                },
            });

        if (!vault) {
            throw new ApiError({
                statusCode: 400,
                message: "Unable to create vault",
            });
        }

        eventBus.publish(
            VAULT_EVENTS.CREATED,
            {
                vaultId: vault._id.toString(),
                workspaceId,
                createdBy: userId,
                name: vault.name,
            }
        );

        return vault;
    };

    getVaultById = async (
        vaultId: string,
        userId: string
    ) => {
        validateObjectId(vaultId, "Vault");
        validateObjectId(userId, "User");

        const vault = await this.vaultRepo.findById(
            new Types.ObjectId(vaultId)
        );

        if (!vault) {
            throw new ApiError({
                statusCode: 404,
                message: "Vault not found",
            });
        }

        await this.authorizeWorkspaceAccess(vault.workspaceId, userId);

        return vault;
    };

     getWorkspaceVaults = async (
         workspaceId: string,
         userId: string
     ) => {
         validateObjectId(workspaceId, "Workspace");
         validateObjectId(userId, "User");

         const workspaceObjId = new Types.ObjectId(workspaceId);
         await this.authorizeWorkspaceAccess(workspaceObjId, userId);

         const workspace = await this.workspaceRepo.findById(workspaceObjId);

         if (!workspace) {
             throw new ApiError({
                 statusCode: 404,
                 message: "Workspace not found",
                 errorCode: "WORKSPACE_NOT_FOUND"
             });
         }

        return this.vaultRepo.findByWorkspace(workspaceObjId);
    };

    updateVault = async (
        vaultId: string,
        userId: string,
        payload: Partial<createVaultDTO>
    ) => {
        validateObjectId(vaultId, "Vault");
        validateObjectId(userId, "User");

        const vault = await this.vaultRepo.findById(
            new Types.ObjectId(vaultId)
        );

        if (!vault) {
            throw new ApiError({
                statusCode: 404,
                message: "Vault not found",
            });
        }

        await this.authorizeWorkspaceAccess(vault.workspaceId, userId);

        let slug = vault.slug;

        if (payload.name) {

            payload.name = normalizeVaultName(
                payload.name
            );

            slug = generateSlug(payload.name);

            const exists =
                await this.vaultRepo.existsBySlug({
                    workspaceId: vault.workspaceId,
                    slug,
                });

            if (exists && slug !== vault.slug) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        const updatedVault =
            await this.vaultRepo.updateById(
                vault._id,
                {
                    ...payload,
                    slug,
                }
            );

        eventBus.publish(
            VAULT_EVENTS.UPDATED,
            {
                vaultId: vault._id.toString(),
                workspaceId: vault.workspaceId.toString(),
            }
        );

        return updatedVault;
    };

    deleteVault = async (
        vaultId: string,
        userId: string
    ) => {
        validateObjectId(vaultId, "Vault");
        validateObjectId(userId, "User");

        const vault =
            await this.vaultRepo.findById(
                new Types.ObjectId(vaultId)
            );

        if (!vault) {
            throw new ApiError({
                statusCode: 404,
                message: "Vault not found",
            });
        }

        await this.authorizeWorkspaceAccess(vault.workspaceId, userId);

        if (vault.isDefault) {
            throw new ApiError({
                statusCode: 400,
                message: "Default vault cannot be deleted",
            });
        }

        const totalVaults =
            await this.vaultRepo.countByWorkspace(
                vault.workspaceId
            );

        if (totalVaults <= 1) {
            throw new ApiError({
                statusCode: 400,
                message: "Workspace must contain at least one vault",
            });
        }

        await this.vaultRepo.deleteById(
            vault._id
        );

        eventBus.publish(
            VAULT_EVENTS.DELETED,
            {
                vaultId: vault._id.toString(),
                workspaceId: vault.workspaceId.toString(),
            }
        );
    };

    getDefaultVault = async (
        workspaceId: string,
        userId: string
    ) => {
        validateObjectId(workspaceId, "Workspace");
        validateObjectId(userId, "User");

        const workspaceObjId = new Types.ObjectId(workspaceId);
        await this.authorizeWorkspaceAccess(workspaceObjId, userId);

        const vault =
            await this.vaultRepo.findDefaultVault(workspaceObjId);

        if (!vault) {
            throw new ApiError({
                statusCode: 404,
                message: "Default vault not found",
            });
        }

        return vault;
    };

    setDefaultVault = async (
        workspaceId: string,
        vaultId: string,
        userId: string
    ) => {
        validateObjectId(workspaceId, "Workspace");
        validateObjectId(vaultId, "Vault");
        validateObjectId(userId, "User");

        const workspaceObjId = new Types.ObjectId(workspaceId);
        await this.authorizeWorkspaceAccess(workspaceObjId, userId);

        const vault =
            await this.vaultRepo.findById(
                new Types.ObjectId(vaultId)
            );

        if (!vault) {
            throw new ApiError({
                statusCode: 404,
                message: "Vault not found",
            });
        }

        return this.vaultRepo.updateDefaultVault({
            workspaceId: workspaceObjId,
            vaultId: new Types.ObjectId(vaultId),
        });
    };
}

export default new VaultService(
    vaultRepository,
    workspaceRepository,
    memberRepositoryClass
);