import { Types } from "mongoose";

import { FolderModel } from "../models/folder.model";
import { IFolder } from "../types/folder.types";

class FolderRepository {
    constructor() { }

    // -----------------------------
    // Create
    // -----------------------------

    create = async (
        payload: Partial<IFolder>
    ) => {
        return FolderModel.create(payload);
    };

    // -----------------------------
    // Exists
    // -----------------------------

    existsById = async (
        folderId: Types.ObjectId
    ) => {
        return !!(await FolderModel.exists({
            _id: folderId,
            isDeleted: false,
        }));
    };

    existsByName = async (payload: {
        vaultId: Types.ObjectId;
        parentFolderId?: Types.ObjectId | null;
        name: string;
    }) => {
        return !!(await FolderModel.exists({
            vaultId: payload.vaultId,
            parentFolderId: payload.parentFolderId ?? null,
            name: payload.name,
            isDeleted: false,
        }));
    };

    existsBySlug = async (payload: {
        vaultId: Types.ObjectId;
        slug: string;
    }) => {
        return !!(await FolderModel.exists({
            vaultId: payload.vaultId,
            slug: payload.slug,
            isDeleted: false,
        }));
    };

    // -----------------------------
    // Find
    // -----------------------------

    findById = async (
        folderId: Types.ObjectId
    ) => {
        return FolderModel.findOne({
            _id: folderId,
            isDeleted: false,
        }).lean();
    };

    findOne = async (
        filter: Record<string, unknown>
    ) => {
        return FolderModel.findOne(filter).lean();
    };

    findBySlug = async (payload: {
        vaultId: Types.ObjectId;
        slug: string;
    }) => {
        return FolderModel.findOne({
            vaultId: payload.vaultId,
            slug: payload.slug,
            isDeleted: false,
        });
    };

    findVaultFolders = async (
        vaultId: Types.ObjectId
    ) => {
        return FolderModel.find({
            vaultId,
            isDeleted: false,
        })
        .sort({ createdAt: 1 })
        .lean();
    };

    findRootFolders = async (
        vaultId: Types.ObjectId
    ) => {
        return FolderModel.find({
            vaultId,
            parentFolderId: null,
            isDeleted: false,
        }).sort({
            name: 1,
        });
    };

    findChildren = async (
        parentFolderId: Types.ObjectId
    ) => {
        return FolderModel.find({
            parentFolderId,
            isDeleted: false,
        }).sort({
            name: 1,
        });
    };

    // -----------------------------
    // Update
    // -----------------------------

    updateById = async (
        folderId: Types.ObjectId,
        payload: Partial<IFolder>
    ) => {
        return FolderModel.findByIdAndUpdate(
            folderId,
            payload,
            {
                new: true,
                runValidators: true,
            }
        );
    };

    moveFolder = async (payload: {
        folderId: Types.ObjectId;
        parentFolderId: Types.ObjectId | null;
    }) => {
        return FolderModel.findByIdAndUpdate(
            payload.folderId,
            {
                parentFolderId: payload.parentFolderId,
            },
            {
                new: true,
            }
        );
    };

    // -----------------------------
    // Delete
    // -----------------------------

    softDelete = async (
        folderId: Types.ObjectId
    ) => {
        return FolderModel.findByIdAndUpdate(
            folderId,
            {
                isDeleted: true,
            },
            {
                new: true,
            }
        );
    };

    restore = async (
        folderId: Types.ObjectId
    ) => {
        return FolderModel.findByIdAndUpdate(
            folderId,
            {
                isDeleted: false,
            },
            {
                new: true,
            }
        );
    };

    deleteById = async (
        folderId: Types.ObjectId
    ) => {
        return FolderModel.findByIdAndDelete(folderId);
    };

    // -----------------------------
    // Counts
    // -----------------------------

    countChildren = async (
        parentFolderId: Types.ObjectId
    ) => {
        return FolderModel.countDocuments({
            parentFolderId,
            isDeleted: false,
        });
    };

    countVaultFolders = async (
        vaultId: Types.ObjectId
    ) => {
        return FolderModel.countDocuments({
            vaultId,
            isDeleted: false,
        });
    };
}

const folderRepository = new FolderRepository();

export default folderRepository;