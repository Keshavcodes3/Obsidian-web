import { Router } from "express";
import {
    inviteMember,
    acceptInvitation,
    rejectInvitation,
    cancelInvitation,
    getWorkspaceInvitations
} from "../Controllers/invitation.controller";
import { requireAuth } from "@/common/middlewares/auth.middleware";

const invitationRouter = Router();

invitationRouter.post(
    "/workspaces/:workspaceId/invitations",
    requireAuth,
    inviteMember
);

invitationRouter.get(
    "/workspaces/:workspaceId/invitations",
    requireAuth,
    getWorkspaceInvitations
);

invitationRouter.post(
    "/invitations/accept/:token",
    requireAuth,
    acceptInvitation
);

invitationRouter.post(
    "/invitations/reject/:token",
    requireAuth,
    rejectInvitation
);

invitationRouter.delete(
    "/invitations/:invitationId",
    requireAuth,
    cancelInvitation
);

export default invitationRouter;
