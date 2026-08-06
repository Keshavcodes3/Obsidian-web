import { WorkspaceModel } from "@/modules/Workspace/models/workspace.model";
import UserModel from "@/modules/users/models/user.model";
import { VaultModel } from "../models/vault.model";
import { createVaultDTO } from "../dtos/createVault.dto";
import { Types } from "mongoose";



class VaultRepositaryClass {
    constructor() { }
    //Crud
    create = async (payload: createVaultDTO) => {
        return VaultModel.create(payload);
    }

    findById = async (
        vaultId: Types.ObjectId
    ) => {
        return VaultModel.findById(vaultId);
    }

    findByWorkspace = async (
        workspaceId: Types.ObjectId
    ) => {
        return VaultModel.find({
            workspaceId,
        });
    }

    findBySlug = async (payload: {
        workspaceId: Types.ObjectId;
        slug: string;
    }) => {
        return VaultModel.findOne({
            workspaceId: payload.workspaceId,
            slug: payload.slug,
        });
    }

    findDefaultVault = async (
        workspaceId: Types.ObjectId
    ) => {
        return VaultModel.findOne({
            workspaceId,
            isDefault: true,
        });
    }

    delete = async (
        vaultId: Types.ObjectId
    ) => {
        return VaultModel.findByIdAndDelete(vaultId);
    }
    existsById = async (vaultId: Types.ObjectId) => {
        return !!(await VaultModel.exists({
            _id: vaultId,
        }));
    }

    existsBySlug = async (payload: {
        workspaceId: Types.ObjectId;
        slug: string;
    }) => {
        return !!(await VaultModel.exists({
            workspaceId: payload.workspaceId,
            slug: payload.slug,
        }));
    }

    existsByName = async (payload: {
        workspaceId: Types.ObjectId;
        name: string;
    }) => {
        return !!(await VaultModel.exists({
            workspaceId: payload.workspaceId,
            name: payload.name,
        }));
    }

    updateById = async (
        vaultId: Types.ObjectId,
        payload: Partial<createVaultDTO>
    ) => {
        return VaultModel.findByIdAndUpdate(
            vaultId,
            payload,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    updateDefaultVault = async (payload: {
        workspaceId: Types.ObjectId;
        vaultId: Types.ObjectId;
    }) => {
        await VaultModel.updateMany(
            {
                workspaceId: payload.workspaceId,
                isDefault: true,
            },
            {
                isDefault: false,
            }
        );

        return VaultModel.findByIdAndUpdate(
            payload.vaultId,
            {
                isDefault: true,
            },
            {
                new: true,
            }
        );
    }

    deleteById = async (
        vaultId: Types.ObjectId
    ) => {
        return VaultModel.findByIdAndDelete(vaultId);
    }

    countByWorkspace = async (
        workspaceId: Types.ObjectId
    ) => {
        return VaultModel.countDocuments({
            workspaceId,
        });
    }

    countByCreator = async (
        createdBy: Types.ObjectId
    ) => {
        return VaultModel.countDocuments({
            createdBy,
        });
    }

    findOne = async (
        filter: Record<string, unknown>
    ) => {
        return VaultModel.findOne(filter);
    }

    findMany = async (
        filter: Record<string, unknown>
    ) => {
        return VaultModel.find(filter);
    }

    findByIds = async (
        vaultIds: Types.ObjectId[]
    ) => {
        return VaultModel.find({
            _id: {
                $in: vaultIds,
            },
        });
    }

}


const vaultRepository = new VaultRepositaryClass()
export default vaultRepository