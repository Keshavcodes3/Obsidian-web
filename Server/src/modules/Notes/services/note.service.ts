import { Types } from "mongoose";
import { validateObjectId } from "@/common/utils/objectId.util";

import noteRepository from "../repositories/note.repo";
import {
    CreateNoteDTO,
    UpdateNoteDTO,
    INote,
} from "../types/note.types";

import vaultRepository from "@/modules/vault/repositories/vault.repo";
import folderRepository from "@/modules/Folders/repositories/folder.repo";
import memberRepository from "@/modules/Members/repositories/member.repo";

import { ApiError } from "@/common/utils/apiError";
import { eventBus } from "@/common/events";
import { NOTE_EVENTS } from "../events/note.events";

class NoteService {
    constructor(
        private readonly noteRepo: typeof noteRepository,
        private readonly vaultRepo: typeof vaultRepository,
        private readonly folderRepo: typeof folderRepository,
        private readonly memberRepo: typeof memberRepository,
    ) { }

    // ─────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────

    createNote = async (
        payload: CreateNoteDTO,
        userId: string
    ) => {
        // Validate ObjectId formats
        validateObjectId(payload.vaultId.toString(), "Vault");
        if (payload.folderId) {
            validateObjectId(payload.folderId.toString(), "Folder");
        }

        // Validate title
        if (!payload.title || payload.title.trim().length === 0) {
            throw new ApiError({
                statusCode: 400,
                message: "Note title cannot be empty",
            });
        }

        if (payload.title.length > 200) {
            throw new ApiError({
                statusCode: 400,
                message: "Note title cannot exceed 200 characters",
            });
        }

        const userObjectId = new Types.ObjectId(userId);

        // Validate vault
        const vault = await this.vaultRepo.findById(
            payload.vaultId
        );

        if (!vault) {
            throw new ApiError({
                statusCode: 404,
                message: "Vault not found",
            });
        }

        // Validate workspace access using vault's workspaceId
        await this.assertWorkspaceAccess(vault.workspaceId.toString(), userId);

        // Use vault's workspaceId instead of client-provided one
        const workspaceId = vault.workspaceId;

        // Validate folder if supplied
        if (payload.folderId) {
            await this.validateFolderForNote(
                payload.folderId,
                payload.vaultId
            );
        }

        const slug = this.generateSlug(payload.title);

        // Prevent duplicate slug inside same vault
        const existing = await this.noteRepo.existsByVaultAndSlug(
            payload.vaultId,
            slug
        );

        if (existing) {
            throw new ApiError({
                statusCode: 409,
                message: "A note with this title already exists in this vault",
            });
        }

        let note;
        try {
            note = await this.noteRepo.createNote({
                ...payload,
                workspaceId,
                slug,
                createdBy: userObjectId,
                updatedBy: userObjectId,
            } as CreateNoteDTO);
        } catch (error: any) {
            if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
                throw new ApiError({
                    statusCode: 409,
                    message: "A note with this title already exists in this vault",
                });
            }
            throw error;
        }

        // Publish event
        eventBus.publish(NOTE_EVENTS.CREATED, {
            noteId: note._id.toString(),
            vaultId: note.vaultId.toString(),
            workspaceId: note.workspaceId.toString(),
            folderId: note.folderId?.toString() || null,
            title: note.title,
            createdBy: userId,
        });

        return note;
    };

    // ─────────────────────────────────────────────
    // GET BY ID
    // ─────────────────────────────────────────────

    getNoteById = async (
        noteId: string,
        userId: string
    ) => {
        validateObjectId(noteId, "Note");

        const note = await this.noteRepo.findActiveById(
            new Types.ObjectId(noteId)
        );

        if (!note) {
            throw new ApiError({
                statusCode: 404,
                message: "Note not found",
            });
        }

        await this.assertUserCanAccessNote(note, userId);

        return note;
    };

    // ─────────────────────────────────────────────
    // GET VAULT NOTES
    // ─────────────────────────────────────────────

    getVaultNotes = async (
        vaultId: string,
        userId: string
    ) => {
        validateObjectId(vaultId, "Vault");

        const vault = await this.vaultRepo.findById(new Types.ObjectId(vaultId));
        if (!vault) {
            throw new ApiError({
                statusCode: 404,
                message: "Vault not found",
            });
        }

        await this.assertWorkspaceAccess(vault.workspaceId.toString(), userId);

        return await this.noteRepo.findVaultNotes(
            new Types.ObjectId(vaultId)
        );
    };

    // ─────────────────────────────────────────────
    // GET FOLDER NOTES
    // ─────────────────────────────────────────────

    getFolderNotes = async (
        folderId: string,
        userId: string
    ) => {
        validateObjectId(folderId, "Folder");

        const folder = await this.folderRepo.findById(
            new Types.ObjectId(folderId)
        );

        if (!folder || folder.isDeleted) {
            throw new ApiError({
                statusCode: 404,
                message: "Folder not found",
            });
        }

        await this.assertWorkspaceAccess(folder.vaultId.toString(), userId);

        return await this.noteRepo.findFolderNotes(
            new Types.ObjectId(folderId)
        );
    };

    // ─────────────────────────────────────────────
    // GET ROOT NOTES (no folder)
    // ─────────────────────────────────────────────

    getRootNotes = async (
        vaultId: string,
        userId: string
    ) => {
        validateObjectId(vaultId, "Vault");

        const vault = await this.vaultRepo.findById(new Types.ObjectId(vaultId));
        if (!vault) {
            throw new ApiError({
                statusCode: 404,
                message: "Vault not found",
            });
        }

        await this.assertWorkspaceAccess(vault.workspaceId.toString(), userId);

        return await this.noteRepo.findRootNotes(
            new Types.ObjectId(vaultId)
        );
    };

    // ─────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────

    updateNote = async (
        noteId: string,
        payload: UpdateNoteDTO,
        userId: string
    ) => {
        validateObjectId(noteId, "Note");

        const note = await this.noteRepo.findActiveById(
            new Types.ObjectId(noteId)
        );

        if (!note) {
            throw new ApiError({
                statusCode: 404,
                message: "Note not found",
            });
        }

        await this.assertUserCanAccessNote(note, userId);

        // Validate title if provided
        if (payload.title !== undefined) {
            if (!payload.title || payload.title.trim().length === 0) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Note title cannot be empty",
                });
            }

            if (payload.title.length > 200) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Note title cannot exceed 200 characters",
                });
            }
        }

        // If moving note to another folder
        if (payload.folderId !== undefined) {
            await this.validateFolderForNote(
                payload.folderId,
                note.vaultId
            );
        }

        // Regenerate slug if title changed
        let updatePayload: UpdateNoteDTO & { updatedBy: Types.ObjectId; slug?: string } = {
            ...payload,
            updatedBy: new Types.ObjectId(userId),
        };

        if (
            payload.title &&
            payload.title.trim() !== note.title
        ) {
            const slug = this.generateSlug(payload.title);

            const existing =
                await this.noteRepo.existsByVaultAndSlug(
                    note.vaultId,
                    slug,
                    note._id
                );

            if (existing) {
                throw new ApiError({
                    statusCode: 409,
                    message:
                        "A note with this title already exists in this vault",
                });
            }

            updatePayload = {
                ...updatePayload,
                slug,
            };
        }

        let updated;
        try {
            updated =
                await this.noteRepo.updateNote(
                    new Types.ObjectId(noteId),
                    updatePayload
                );
        } catch (error: any) {
            if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
                throw new ApiError({
                    statusCode: 409,
                    message: "A note with this title already exists in this vault",
                });
            }
            throw error;
        }

        if (!updated) {
            throw new ApiError({
                statusCode: 404,
                message: "Note not found",
            });
        }

        // Publish event
        eventBus.publish(NOTE_EVENTS.UPDATED, {
            noteId: updated._id.toString(),
            vaultId: updated.vaultId.toString(),
            updatedBy: userId,
        });

        return updated;
    };

    // ─────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────

    deleteNote = async (
        noteId: string,
        userId: string
    ) => {
        validateObjectId(noteId, "Note");

        const note = await this.noteRepo.findActiveById(
            new Types.ObjectId(noteId)
        );

        if (!note) {
            throw new ApiError({
                statusCode: 404,
                message: "Note not found",
            });
        }

        await this.assertUserCanAccessNote(note, userId);

        const deleted = await this.noteRepo.deleteNote(
            new Types.ObjectId(noteId),
            new Types.ObjectId(userId)
        );

        if (!deleted) {
            throw new ApiError({
                statusCode: 404,
                message: "Note not found",
            });
        }

        // Publish event
        eventBus.publish(NOTE_EVENTS.DELETED, {
            noteId: deleted._id.toString(),
            vaultId: deleted.vaultId.toString(),
            deletedBy: userId,
        });

        return deleted;
    };

    // ─────────────────────────────────────────────
    // RESTORE
    // ─────────────────────────────────────────────

    restoreNote = async (
        noteId: string,
        userId: string
    ) => {
        validateObjectId(noteId, "Note");

        const note = await this.noteRepo.findById(
            new Types.ObjectId(noteId)
        );

        if (!note) {
            throw new ApiError({
                statusCode: 404,
                message: "Note not found",
            });
        }

        if (!note.isDeleted) {
            throw new ApiError({
                statusCode: 400,
                message: "Note is not deleted",
            });
        }

        await this.assertUserCanAccessNote(note, userId);

        // Check if folder still exists and is not deleted (if note has a folder)
        if (note.folderId) {
            const folder = await this.folderRepo.findById(note.folderId);
            if (!folder || folder.isDeleted) {
                throw new ApiError({
                    statusCode: 400,
                    message: "Cannot restore note because its folder no longer exists or is deleted",
                });
            }
        }

        const restored =
            await this.noteRepo.restoreNote(
                new Types.ObjectId(noteId),
                new Types.ObjectId(userId)
            );

        if (!restored) {
            throw new ApiError({
                statusCode: 404,
                message: "Note could not be restored",
            });
        }

        // Publish event
        eventBus.publish(NOTE_EVENTS.RESTORED, {
            noteId: restored._id.toString(),
            vaultId: restored.vaultId.toString(),
            restoredBy: userId,
        });

        return restored;
    };

    // ─────────────────────────────────────────────
    // PIN
    // ─────────────────────────────────────────────

    togglePin = async (
        noteId: string,
        userId: string
    ) => {
        validateObjectId(noteId, "Note");

        const note = await this.noteRepo.findActiveById(
            new Types.ObjectId(noteId)
        );

        if (!note) {
            throw new ApiError({
                statusCode: 404,
                message: "Note not found",
            });
        }

        await this.assertUserCanAccessNote(note, userId);

        const updated = await this.noteRepo.setPinned(
            new Types.ObjectId(noteId),
            !note.isPinned,
            new Types.ObjectId(userId)
        );

        // Publish event
        eventBus.publish(NOTE_EVENTS.UPDATED, {
            noteId: updated?._id.toString(),
            vaultId: updated?.vaultId.toString(),
            updatedBy: userId,
        });

        return updated;
    };

    // ─────────────────────────────────────────────
    // ARCHIVE
    // ─────────────────────────────────────────────

    toggleArchive = async (
        noteId: string,
        userId: string
    ) => {
        validateObjectId(noteId, "Note");

        const note = await this.noteRepo.findActiveById(
            new Types.ObjectId(noteId)
        );

        if (!note) {
            throw new ApiError({
                statusCode: 404,
                message: "Note not found",
            });
        }

        await this.assertUserCanAccessNote(note, userId);

        const updated = await this.noteRepo.setArchived(
            new Types.ObjectId(noteId),
            !note.isArchived,
            new Types.ObjectId(userId)
        );

        // Publish event
        eventBus.publish(NOTE_EVENTS.UPDATED, {
            noteId: updated?._id.toString(),
            vaultId: updated?.vaultId.toString(),
            updatedBy: userId,
        });

        return updated;
    };

    // ─────────────────────────────────────────────
    // MOVE NOTE
    // ─────────────────────────────────────────────

    moveNote = async (
        noteId: string,
        folderId: Types.ObjectId | null,
        userId: string
    ) => {
        validateObjectId(noteId, "Note");

        const note = await this.noteRepo.findActiveById(
            new Types.ObjectId(noteId)
        );

        if (!note) {
            throw new ApiError({
                statusCode: 404,
                message: "Note not found",
            });
        }

        await this.assertUserCanAccessNote(note, userId);

        // Validate target folder
        await this.validateFolderForNote(folderId, note.vaultId);

        const updated = await this.noteRepo.moveToFolder(
            new Types.ObjectId(noteId),
            folderId,
            new Types.ObjectId(userId)
        );

        if (!updated) {
            throw new ApiError({
                statusCode: 404,
                message: "Note not found",
            });
        }

        // Publish event
        eventBus.publish(NOTE_EVENTS.UPDATED, {
            noteId: updated._id.toString(),
            vaultId: updated.vaultId.toString(),
            updatedBy: userId,
        });

        return updated;
    };

    // ─────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────



    private generateSlug(title: string): string {
        return title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    }

    private async validateFolderForNote(
        folderId: Types.ObjectId | null,
        vaultId: Types.ObjectId
    ) {
        if (!folderId) return;

        const folder = await this.folderRepo.findById(folderId);

        if (!folder || folder.isDeleted) {
            throw new ApiError({
                statusCode: 404,
                message: "Folder not found",
            });
        }

        if (folder.vaultId.toString() !== vaultId.toString()) {
            throw new ApiError({
                statusCode: 400,
                message: "Cannot move note to a folder from another vault",
            });
        }
    }

    private async assertWorkspaceAccess(
        workspaceId: string,
        userId: string
    ) {
        const isMember = await this.memberRepo.exists({
            workspaceId: new Types.ObjectId(workspaceId),
            userId: new Types.ObjectId(userId),
        });

        if (!isMember) {
            throw new ApiError({
                statusCode: 403,
                message: "Access denied. You are not a member of this workspace.",
            });
        }
    }

    private async assertVaultAccess(
        vaultId: string,
        userId: string
    ) {
        const vault = await this.vaultRepo.findById(new Types.ObjectId(vaultId));

        if (!vault) {
            throw new ApiError({
                statusCode: 404,
                message: "Vault not found",
            });
        }

        await this.assertWorkspaceAccess(vault.workspaceId.toString(), userId);
    }

    private async assertUserCanAccessNote(
        note: INote,
        userId: string
    ) {
        await this.assertVaultAccess(
            note.vaultId.toString(),
            userId
        );
    }
}

export default new NoteService(
    noteRepository,
    vaultRepository,
    folderRepository,
    memberRepository
);