import { WorkspaceVisibility } from "../enum/workspace-visibility.enum";

export interface CreateWorkspaceDto {
    name: string;
    description?: string;
    visibility?: WorkspaceVisibility;
}