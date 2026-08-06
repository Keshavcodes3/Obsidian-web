import { Router } from "express";

import vaultController from "../controllers/vault.controller";
import { requireAuth } from "@/common/middlewares/auth.middleware";

const vaultRouter = Router();

vaultRouter.use(requireAuth);

vaultRouter.post(
    "/:workspaceId",
    vaultController.createVault
);

vaultRouter.get(
    "/:workspaceId",
    vaultController.getWorkspaceVaults
);

vaultRouter.get(
    "/:workspaceId/default",
    vaultController.getDefaultVault
);

vaultRouter.patch(
    "/:workspaceId/default/:vaultId",
    vaultController.setDefaultVault
);

vaultRouter.get(
    "/vault/:vaultId",
    vaultController.getVaultById
);

vaultRouter.patch(
    "/vault/:vaultId",
    vaultController.updateVault
);

vaultRouter.delete(
    "/vault/:vaultId",
    vaultController.deleteVault
);

export default vaultRouter;