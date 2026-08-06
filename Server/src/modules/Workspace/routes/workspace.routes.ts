import { Router } from "express";

import workspaceController from "../controllers/workspace.controller";

import { requireAuth } from "@/common/middlewares/auth.middleware";

const workspaceRouter = Router();



workspaceRouter.post(
    "/",
    requireAuth,
    workspaceController.createWorkspace
);

workspaceRouter.get(
    "/",
    requireAuth,
    workspaceController.getMyWorkspaces
);

workspaceRouter.get(
    "/:workspaceId",
    requireAuth,
    workspaceController.getWorkspaceById
);

workspaceRouter.patch(
    "/:workspaceId",
    requireAuth,
    workspaceController.updateWorkspace
);

workspaceRouter.delete(
    "/:workspaceId",
    requireAuth,
    workspaceController.deleteWorkspace
);

export default workspaceRouter;