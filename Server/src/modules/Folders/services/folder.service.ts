import { Types, isValidObjectId } from "mongoose";

import { ApiError } from "@/common/utils/apiError";
import { eventBus } from "@/common/events";

import vaultRepository from "@/modules/vault/repositories/vault.repo";
import folderRepository from "../repositories/folder.repo";
import memberRepository from "@/modules/Members/repositories/member.repo";

import { generateSlug } from "@/modules/Workspace/utils/generateSlug";
import { normalizeFolderName } from "../utils/folder.utils";
import { CreateFolderDTO } from "../dtos/createFolder.dto";
import { FOLDER_EVENTS } from "../events/folder.events";

class FolderService {
    constructor(
        private readonly folderRepo: typeof folderRepository,
        private readonly vaultRepo: typeof vaultRepository,
        private readonly memberRepo: typeof memberRepository
    ) { }

    private validateObjectId(id: string, name: string) {
        if (!id || !isValidObjectId(id)) {
            throw new ApiError({
                statusCode: 400,
                message: `Invalid ${name} ID format`,
            });
        }
    }

    private async authorizeVaultAccess(vaultId: string, userId: string) {
        const vault = await this.vaultRepo.findById(new Types.ObjectId(vaultId));
        if (!vault) {
            throw new ApiError({
                statusCode: 404,
                message: "Vault not found",
            });
        }

        const isMember = await this.memberRepo.exists({
            workspaceId: vault.workspaceId,
            userId: new Types.ObjectId(userId),
        });

        if (!isMember) {
            throw new ApiError({
                statusCode: 403,
                message: "Access denied. You are not a member of this workspace.",
            });
        }

        return vault;
    }

    createFolder = async (
        vaultId: string,
        userId: string,
        payload: CreateFolderDTO
    ) => {
        this.validateObjectId(vaultId, "Vault");
        if (payload.parentFolderId) {
            this.validateObjectId(payload.parentFolderId.toString(), "Parent Folder");
        }

        const vault = await this.authorizeVaultAccess(vaultId, userId);

        if (payload.parentFolderId) {
            const parent = await this.folderRepo.findById(new Types.ObjectId(payload.parentFolderId));
            if (!parent) {
                throw new ApiError({
                    statusCode: 404,
                    message: "Parent folder not found",
                });
            }
            if (parent.vaultId.toString() !== vaultId) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Parent folder must belong to the same vault",
                });
            }
        }

        const normalizedName = normalizeFolderName(payload.name);
        if (!normalizedName) {
            throw new ApiError({
                statusCode: 400,
                message: "Folder name cannot be empty",
            });
        }

        let slug = generateSlug(normalizedName);
        const slugExists = await this.folderRepo.existsBySlug({
            vaultId: new Types.ObjectId(vaultId),
            slug,
        });

        if (slugExists) {
            slug = `${slug}-${Date.now()}`;
        }

        const duplicate = await this.folderRepo.existsByName({
            vaultId: new Types.ObjectId(vaultId),
            parentFolderId: payload.parentFolderId ? new Types.ObjectId(payload.parentFolderId) : null,
            name: normalizedName,
        });

        if (duplicate) {
            throw new ApiError({
                statusCode: 409,
                message: "Folder with this name already exists in this directory",
            });
        }

        const folder = await this.folderRepo.create({
            vaultId: new Types.ObjectId(vaultId),
            parentFolderId: payload.parentFolderId ? new Types.ObjectId(payload.parentFolderId) : null,
            name: normalizedName,
            slug,
            color: payload.color,
            icon: payload.icon,
            createdBy: new Types.ObjectId(userId),
            isDeleted: false,
        });

        eventBus.publish(FOLDER_EVENTS.CREATED, {
            folderId: folder._id.toString(),
            vaultId: folder.vaultId.toString(),
            name: folder.name,
            createdBy: userId,
        });

        return folder;
    };

    getFolderById = async (folderId: string, userId: string) => {
        this.validateObjectId(folderId, "Folder");

        const folder = await this.folderRepo.findById(new Types.ObjectId(folderId));
        if (!folder) {
            throw new ApiError({
                statusCode: 404,
                message: "Folder not found",
            });
        }

        await this.authorizeVaultAccess(folder.vaultId.toString(), userId);

        return folder;
    };

    getVaultFolders = async (vaultId: string, userId: string) => {
        this.validateObjectId(vaultId, "Vault");
        await this.authorizeVaultAccess(vaultId, userId);

        return this.folderRepo.findVaultFolders(new Types.ObjectId(vaultId));
    };

    updateFolder = async (
        folderId: string,
        userId: string,
        payload: { name?: string; color?: string; icon?: string }
    ) => {
        this.validateObjectId(folderId, "Folder");

        const folder = await this.folderRepo.findById(new Types.ObjectId(folderId));
        if (!folder) {
            throw new ApiError({
                statusCode: 404,
                message: "Folder not found",
            });
        }

        await this.authorizeVaultAccess(folder.vaultId.toString(), userId);

        const updateData: any = {
            updatedBy: new Types.ObjectId(userId),
        };

        if (payload.name) {
            updateData.name = normalizeFolderName(payload.name);

            if (!updateData.name) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Folder name cannot be empty",
                });
            }

            const duplicate = await this.folderRepo.existsByName({
                vaultId: folder.vaultId,
                parentFolderId: folder.parentFolderId || null,
                name: updateData.name,
            });

            if (duplicate && updateData.name !== folder.name) {
                throw new ApiError({
                    statusCode: 409,
                    message: "Folder with this name already exists in this directory",
                });
            }

            let slug = generateSlug(updateData.name);
            const slugExists = await this.folderRepo.existsBySlug({
                vaultId: folder.vaultId,
                slug,
            });

            if (slugExists && slug !== folder.slug) {
                slug = `${slug}-${Date.now()}`;
            }
            updateData.slug = slug;
        }

        if (payload.color !== undefined) updateData.color = payload.color;
        if (payload.icon !== undefined) updateData.icon = payload.icon;

        const updatedFolder = await this.folderRepo.updateById(folder._id, updateData);

        eventBus.publish(FOLDER_EVENTS.UPDATED, {
            folderId: folder._id.toString(),
            vaultId: folder.vaultId.toString(),
            updatedBy: userId,
        });

        return updatedFolder;
    };

    moveFolder = async (folderId: string, newParentId: string | null, userId: string) => {
        this.validateObjectId(folderId, "Folder");
        if (newParentId) this.validateObjectId(newParentId, "Parent Folder");

        const folder = await this.folderRepo.findById(new Types.ObjectId(folderId));
        if (!folder) {
            throw new ApiError({
                statusCode: 404,
                message: "Folder not found",
            });
        }

        await this.authorizeVaultAccess(folder.vaultId.toString(), userId);

        // Root move
        if (!newParentId) {
            const duplicate = await this.folderRepo.existsByName({
                vaultId: folder.vaultId,
                parentFolderId: null,
                name: folder.name,
            });

            if (duplicate && (!folder.parentFolderId)) {
                throw new ApiError({
                    statusCode: 409,
                    message: "Folder with this name already exists at the root",
                });
            }

            const movedFolder = await this.folderRepo.moveFolder({
                folderId: folder._id,
                parentFolderId: null,
            });

            eventBus.publish(FOLDER_EVENTS.MOVED, {
                folderId: folder._id.toString(),
                newParentId: null,
            });

            return movedFolder;
        }

        // Move to specific parent
        if (folder._id.toString() === newParentId) {
            throw new ApiError({
                statusCode: 400,
                message: "Cannot move a folder into itself",
            });
        }

        const parent = await this.folderRepo.findById(new Types.ObjectId(newParentId));
        if (!parent) {
            throw new ApiError({
                statusCode: 404,
                message: "Target parent folder not found",
            });
        }

        if (parent.vaultId.toString() !== folder.vaultId.toString()) {
            throw new ApiError({
                statusCode: 400,
                message: "Cannot move folder across different vaults",
            });
        }

        // Prevent recursive move (moving into descendant)
        let currentParent = parent.parentFolderId;
        while (currentParent) {
            if (currentParent.toString() === folder._id.toString()) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Cannot move a folder into its own descendant",
                });
            }
            const ancestor = await this.folderRepo.findById(currentParent as Types.ObjectId);
            if (!ancestor) break;
            currentParent = ancestor.parentFolderId;
        }

        const duplicate = await this.folderRepo.existsByName({
            vaultId: folder.vaultId,
            parentFolderId: parent._id,
            name: folder.name,
        });

        if (duplicate) {
            throw new ApiError({
                statusCode: 409,
                message: "Folder with this name already exists in target directory",
            });
        }

        const movedFolder = await this.folderRepo.moveFolder({
            folderId: folder._id,
            parentFolderId: parent._id,
        });

        eventBus.publish(FOLDER_EVENTS.MOVED, {
            folderId: folder._id.toString(),
            newParentId: parent._id.toString(),
        });

        return movedFolder;
    };

    deleteFolder = async (folderId: string, userId: string) => {
        this.validateObjectId(folderId, "Folder");

        const folder = await this.folderRepo.findById(new Types.ObjectId(folderId));
        if (!folder) {
            throw new ApiError({
                statusCode: 404,
                message: "Folder not found",
            });
        }

        await this.authorizeVaultAccess(folder.vaultId.toString(), userId);

        const childrenCount = await this.folderRepo.countChildren(folder._id);
        if (childrenCount > 0) {
            throw new ApiError({
                statusCode: 400,
                message: "Cannot delete folder because it contains child folders. Delete them first.",
            });
        }

        // Note: Check for existing notes here once Notes module is implemented

        await this.folderRepo.softDelete(folder._id);

        eventBus.publish(FOLDER_EVENTS.DELETED, {
            folderId: folder._id.toString(),
            vaultId: folder.vaultId.toString(),
            deletedBy: userId,
        });

        return true;
    };

    restoreFolder = async (folderId: string, userId: string) => {
        this.validateObjectId(folderId, "Folder");

        // Use standard find to get soft-deleted folders, repo.findById ignores isDeleted=true
        const folder = await this.folderRepo.findOne({
            _id: new Types.ObjectId(folderId),
            isDeleted: true
        });

        if (!folder) {
            throw new ApiError({
                statusCode: 404,
                message: "Deleted folder not found",
            });
        }

        await this.authorizeVaultAccess(folder.vaultId.toString(), userId);

        // Check if parent still exists and is not deleted
        if (folder.parentFolderId) {
            const parent = await this.folderRepo.findById(folder.parentFolderId as Types.ObjectId);
            if (!parent) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Cannot restore folder because its parent folder no longer exists or is deleted.",
                });
            }
        }

        // Check for duplicate name conflicts upon restoration
        const duplicate = await this.folderRepo.existsByName({
            vaultId: folder.vaultId,
            parentFolderId: folder.parentFolderId || null,
            name: folder.name,
        });

        if (duplicate) {
            throw new ApiError({
                statusCode: 409,
                message: "Cannot restore folder because another folder with the same name now exists in that directory.",
            });
        }

        const restoredFolder = await this.folderRepo.restore(folder._id);

        eventBus.publish(FOLDER_EVENTS.RESTORED, {
            folderId: folder._id.toString(),
            vaultId: folder.vaultId.toString(),
            restoredBy: userId,
        });

        return restoredFolder;
    };
}

export default new FolderService(
    folderRepository,
    vaultRepository,
    memberRepository
);