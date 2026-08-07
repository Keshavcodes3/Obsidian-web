import { Router } from "express";

import folderController from "../controllers/folder.controller";
import { requireAuth } from "@/common/middlewares/auth.middleware";

const folderRouter = Router();

folderRouter.use(requireAuth);

folderRouter.post(
    "/vaults/:vaultId/folders",
    folderController.createFolder
);

folderRouter.get(
    "/vaults/:vaultId/folders",
    folderController.getVaultFolders
);

folderRouter.get(
    "/folders/:folderId",
    folderController.getFolderById
);

folderRouter.patch(
    "/folders/:folderId",
    folderController.updateFolder
);

folderRouter.delete(
    "/folders/:folderId",
    folderController.deleteFolder
);

folderRouter.post(
    "/folders/:folderId/move",
    folderController.moveFolder
);

folderRouter.post(
    "/folders/:folderId/restore",
    folderController.restoreFolder
);

export default folderRouter;