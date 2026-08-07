import { Router } from "express";
import {
    getWorkspaceMembers,
    getMember,
    updateMemberRole,
    removeMember,
    leaveWorkspace,
    transferOwnership
} from "../controllers/member.controller";
import { requireAuth } from "@/common/middlewares/auth.middleware";

const memberRouter = Router({ mergeParams: true });

// Note: Ensure workspaceRouter mounts this router using app.use('/workspaces/:workspaceId/members', memberRouter) 
// or register it globally and expect :workspaceId in params.

memberRouter.get(
    "/workspaces/:workspaceId/members",
    requireAuth,
    getWorkspaceMembers
);

memberRouter.get(
    "/workspaces/:workspaceId/members/:memberId",
    requireAuth,
    getMember
);

memberRouter.patch(
    "/workspaces/:workspaceId/members/:memberId/role",
    requireAuth,
    updateMemberRole
);

memberRouter.delete(
    "/workspaces/:workspaceId/members/:memberId",
    requireAuth,
    removeMember
);

memberRouter.post(
    "/workspaces/:workspaceId/members/leave",
    requireAuth,
    leaveWorkspace
);

memberRouter.patch(
    "/workspaces/:workspaceId/members/transfer-ownership",
    requireAuth,
    transferOwnership
);

export default memberRouter;
