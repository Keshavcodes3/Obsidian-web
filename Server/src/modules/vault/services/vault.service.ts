import { Types } from "mongoose";

import { ApiError } from "@/common/utils/apiError";
import { eventBus } from "@/common/events";

import workspaceRepository from "@/modules/Workspace/repositories/workspace.repository";

import vaultRepository from "../repositories/vault.repo";

import { generateSlug } from "../utils/generateSlug";
import { normalizeVaultName } from "../utils/normalizeVaultName";

import { createVaultDTO } from "../dtos/createVault.dto";
import { VAULT_EVENTS } from "../events/vault.event";

class VaultService {
    constructor(
        private readonly vaultRepo: typeof vaultRepository,
        private readonly workspaceRepo: typeof workspaceRepository
    ) { }

    createVault = async (
        workspaceId: string,
        userId: string,
        payload: createVaultDTO
    ) => {

        const workspace =
            await this.workspaceRepo.findById(
                workspaceId as string
            );

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

        const vault =
            await this.vaultRepo.create({
                ...payload,
                name: normalizedName,
                slug,
                workspaceId: new Types.ObjectId(workspaceId),
                createdBy: new Types.ObjectId(userId),
                isDefault: false,
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
        vaultId: string
    ) => {

        const vault = await this.vaultRepo.findById(
            new Types.ObjectId(vaultId)
        );

        if (!vault) {
            throw new ApiError({
                statusCode: 404,
                message: "Vault not found",
            });
        }

        return vault;
    };

    getWorkspaceVaults = async (
        workspaceId: string
    ) => {

        const workspace = await this.workspaceRepo.findById(
            workspaceId
        );

        if (!workspace) {
            throw new ApiError({
                statusCode: 404,
                message: "Workspace not found",
            });
        }

        return this.vaultRepo.findByWorkspace(
            new Types.ObjectId(workspaceId)
        );
    };

    updateVault = async (
        vaultId: string,
        payload: Partial<createVaultDTO>
    ) => {

        const vault = await this.vaultRepo.findById(
            new Types.ObjectId(vaultId)
        );

        if (!vault) {
            throw new ApiError({
                statusCode: 404,
                message: "Vault not found",
            });
        }

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
        vaultId: string
    ) => {

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
        workspaceId: string
    ) => {

        const vault =
            await this.vaultRepo.findDefaultVault(
                new Types.ObjectId(workspaceId)
            );

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
        vaultId: string
    ) => {

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
            workspaceId: new Types.ObjectId(workspaceId),
            vaultId: new Types.ObjectId(vaultId),
        });
    };
}

export default new VaultService(
    vaultRepository,
    workspaceRepository
);