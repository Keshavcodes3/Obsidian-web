import { Types } from "mongoose";

import { ApiError } from "@/common/utils/apiError";
import { eventBus } from "@/common/events";

import workspaceRepositoryClass from "../repositories/workspace.repository";

import { CreateWorkspaceDto } from "../dtos/workspace.dto";

import { WorkspaceRole } from "../enum/workspace-role.enum";
import { WorkspaceVisibility } from "../enum/workspace-visibility.enum";

import { WORKSPACE_EVENTS } from "../events/workspace.event";

import { generateSlug } from "../utils/generateSlug";
import { normalizeWorkspaceName } from "../utils/normalizeWorkspaceName";

class WorkspaceService {
    constructor(
        private readonly workspaceRepository: typeof workspaceRepositoryClass
    ) { }

    /**
     * Create Workspace
     */
    createWorkspace = async (
        ownerId: string,
        payload: CreateWorkspaceDto
    ) => {

        // Normalize name
        const normalizedName = normalizeWorkspaceName(payload.name);

        // Generate slug
        let slug = generateSlug(normalizedName);

        // Ensure slug uniqueness
        const existingWorkspace =
            await this.workspaceRepository.findBySlug(slug);

        if (existingWorkspace) {
            slug = `${slug}-${Date.now()}`;
        }

        // Create workspace
        const workspace =
            await this.workspaceRepository.create({
                name: normalizedName,

                slug,

                description: payload.description ?? "",

                visibility:
                    payload.visibility ??
                    WorkspaceVisibility.PRIVATE,

                ownerId: new Types.ObjectId(ownerId),

                settings: {
                    allowInvites: true,
                    defaultVaultName: "My Vault",
                },
            });

        if (!workspace) {
            throw new ApiError({
                statusCode: 400,
                message: "Workspace could not be created",
            });
        }

        // Publish event
        eventBus.publish(
            WORKSPACE_EVENTS.CREATED,
            {
                workspaceId: workspace._id.toString(),
                ownerId,
                name: workspace.name,
                slug: workspace.slug,
            }
        );

        return workspace;
    };

    /**
     * Get Workspace By Id
     */
    getWorkspaceById = async (
        workspaceId: string
    ) => {

        const workspace =
            await this.workspaceRepository.findById(new Types.ObjectId(workspaceId));

        if (!workspace) {
            throw new ApiError({
                statusCode: 404,
                message: "Workspace not found",
            });
        }

        return workspace;
    };

    /**
     * Get My Workspaces
     */
    getMyWorkspaces = async (
        ownerId: string
    ) => {

        return this.workspaceRepository.findByOwner(ownerId);
    };

    /**
     * Update Workspace
     */
    updateWorkspace = async (
        workspaceId: string,
        payload: Partial<CreateWorkspaceDto>
    ) => {

        const workspace =
            await this.workspaceRepository.findById(new Types.ObjectId(workspaceId));

        if (!workspace) {
            throw new ApiError({
                statusCode: 404,
                message: "Workspace not found",
            });
        }

        if (payload.name) {
            workspace.name = normalizeWorkspaceName(payload.name);
        }

        if (payload.description !== undefined) {
            workspace.description = payload.description;
        }

        if (payload.visibility) {
            workspace.visibility = payload.visibility;
        }

        await workspace.save();

        eventBus.publish(
            WORKSPACE_EVENTS.UPDATED,
            {
                workspaceId: workspace._id.toString(),
            }
        );

        return workspace;
    };

    /**
     * Delete Workspace
     */
    deleteWorkspace = async (
        workspaceId: string
    ) => {

        const workspace =
            await this.workspaceRepository.findById(new Types.ObjectId(workspaceId));

        if (!workspace) {
            throw new ApiError({
                statusCode: 404,
                message: "Workspace not found",
            });
        }

        await this.workspaceRepository.deleteById(workspaceId);

        eventBus.publish(
            WORKSPACE_EVENTS.DELETED,
            {
                workspaceId,
            }
        );

        return true;
    };
}

export default new WorkspaceService(
    workspaceRepositoryClass
);