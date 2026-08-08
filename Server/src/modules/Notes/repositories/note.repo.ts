import noteModels from "@/modules/Notes/models/note.model";
import { Types } from "mongoose";
import { CreateNoteDTO, UpdateNoteDTO } from "../types/note.types";

class NoteRepository {
    constructor(
        private readonly noteModel: typeof noteModels
    ) { }

    // CREATE
    createNote = async (payload: CreateNoteDTO) => {
        return await this.noteModel.create(payload);
    };

    // FIND BY ID (includes deleted)
    findById = async (noteId: Types.ObjectId) => {
        return await this.noteModel.findById(noteId);
    };

    // FIND NOTE WITH SOFT-DELETED EXCLUDED
    findActiveById = async (noteId: Types.ObjectId) => {
        return await this.noteModel.findOne({
            _id: noteId,
            isDeleted: false,
        });
    };

    // FIND ALL NOTES IN A VAULT
    findVaultNotes = async (
        vaultId: Types.ObjectId
    ) => {
        return await this.noteModel
            .find({
                vaultId,
                isDeleted: false,
            })
            .sort({
                updatedAt: -1,
            });
    };

    // FIND ALL NOTES IN A FOLDER
    findFolderNotes = async (
        folderId: Types.ObjectId
    ) => {
        return await this.noteModel
            .find({
                folderId,
                isDeleted: false,
            })
            .sort({
                updatedAt: -1,
            });
    };

    // FIND ROOT NOTES OF A VAULT
    findRootNotes = async (
        vaultId: Types.ObjectId
    ) => {
        return await this.noteModel
            .find({
                vaultId,
                folderId: null,
                isDeleted: false,
            })
            .sort({
                updatedAt: -1,
            });
    };

    // FIND BY SLUG INSIDE VAULT
    findBySlug = async (
        vaultId: Types.ObjectId,
        slug: string
    ) => {
        return await this.noteModel.findOne({
            vaultId,
            slug,
            isDeleted: false,
        });
    };

    // CHECK EXISTENCE
    exists = async (
        noteId: Types.ObjectId
    ) => {
        return await this.noteModel.exists({
            _id: noteId,
            isDeleted: false,
        });
    };

    // CHECK EXISTENCE BY VAULT AND SLUG
    existsByVaultAndSlug = async (
        vaultId: Types.ObjectId,
        slug: string,
        excludeNoteId?: Types.ObjectId
    ) => {
        const query: Record<string, unknown> = {
            vaultId,
            slug,
            isDeleted: false,
        };
        if (excludeNoteId) {
            query._id = { $ne: excludeNoteId };
        }
        return await this.noteModel.exists(query);
    };

    // UPDATE
    updateNote = async (
        noteId: Types.ObjectId,
        payload: UpdateNoteDTO
    ) => {
        return await this.noteModel.findOneAndUpdate(
            {
                _id: noteId,
                isDeleted: false,
            },
            {
                $set: payload,
            },
            {
                new: true,
                runValidators: true,
            }
        );
    };

    // SOFT DELETE
    deleteNote = async (
        noteId: Types.ObjectId,
        updatedBy: Types.ObjectId
    ) => {
        return await this.noteModel.findOneAndUpdate(
            {
                _id: noteId,
                isDeleted: false,
            },
            {
                $set: {
                    isDeleted: true,
                    updatedBy,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );
    };

    // RESTORE
    restoreNote = async (
        noteId: Types.ObjectId,
        updatedBy: Types.ObjectId
    ) => {
        return await this.noteModel.findOneAndUpdate(
            {
                _id: noteId,
                isDeleted: true,
            },
            {
                $set: {
                    isDeleted: false,
                    updatedBy,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );
    };

    // PIN / UNPIN
    setPinned = async (
        noteId: Types.ObjectId,
        isPinned: boolean,
        updatedBy: Types.ObjectId
    ) => {
        return await this.noteModel.findOneAndUpdate(
            {
                _id: noteId,
                isDeleted: false,
            },
            {
                $set: {
                    isPinned,
                    updatedBy,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );
    };

    // ARCHIVE / UNARCHIVE
    setArchived = async (
        noteId: Types.ObjectId,
        isArchived: boolean,
        updatedBy: Types.ObjectId
    ) => {
        return await this.noteModel.findOneAndUpdate(
            {
                _id: noteId,
                isDeleted: false,
            },
            {
                $set: {
                    isArchived,
                    updatedBy,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );
    };

    // COUNT NOTES IN VAULT
    countByVault = async (vaultId: Types.ObjectId) => {
        return await this.noteModel.countDocuments({
            vaultId,
            isDeleted: false,
        });
    };

    // COUNT NOTES IN FOLDER
    countByFolder = async (folderId: Types.ObjectId) => {
        return await this.noteModel.countDocuments({
            folderId,
            isDeleted: false,
        });
    };

    // MOVE NOTE TO FOLDER
    moveToFolder = async (
        noteId: Types.ObjectId,
        folderId: Types.ObjectId | null,
        updatedBy: Types.ObjectId
    ) => {
        return await this.noteModel.findOneAndUpdate(
            {
                _id: noteId,
                isDeleted: false,
            },
            {
                $set: {
                    folderId,
                    updatedBy,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );
    };
}

export default new NoteRepository(noteModels);