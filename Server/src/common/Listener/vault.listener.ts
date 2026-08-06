import { VAULT_EVENTS } from "@/modules/vault/events/vault.event";
import { eventBus } from "../events";
import { Types } from "mongoose";
import { WORKSPACE_EVENTS } from "@/modules/Workspace/events/workspace.event";
import { VaultModel } from "@/modules/vault/models/vault.model";


eventBus.subscribe(VAULT_EVENTS.CREATED, async (event: {
    vaultId: Types.ObjectId,
    createdBy: Types.ObjectId,
    name: string
}) => {
    console.log(event)
    //call to notification service for sending mail
})


eventBus.subscribe(WORKSPACE_EVENTS.CREATED, async (event: {
    workspaceId: Types.ObjectId,
    userId: Types.ObjectId,
    name: string,
    slug: string,
}) => {
    await VaultModel.create({
        workspaceId: event.workspaceId,
        createdBy: event.userId,
        name: event.name,
        slug: event.slug,
        description: "Default Vault",
        isDefault: true,
        settings: {
            allowAttachments: true,
            allowWikiLinks: true
        }
    })
})

