import { eventBus } from "@/common/events";
import { WORKSPACE_EVENTS } from "@/modules/Workspace/events/workspace.event";
import { Types } from "mongoose";
import memberService from "@/modules/Members/services/member.service";
import vaultService from "@/modules/vault/services/vault.service";
import { createVaultDTO } from "@/modules/vault/dtos/createVault.dto";
eventBus.subscribe(
    WORKSPACE_EVENTS.CREATED, async (event: {
        workspaceId: string,
        ownerId: string,
        name: string,
        slug: string
    }) => {
    console.log(`Workspace with name ${event.name} created, setting up defaults...`);

    await memberService.createOwnerMembership({
        workspaceId: new Types.ObjectId(event.workspaceId),
        userId: new Types.ObjectId(event.ownerId),
    });

    await vaultService.createVault(
        new Types.ObjectId(event.workspaceId),
        event.ownerId,
        {
            workspaceId: new Types.ObjectId(event.workspaceId),
            coverImage: "",
            name: "default vault",
            icon: "",
            description: "Your default and first vault",
            isDefault: true,
            createdBy: new Types.ObjectId(event.ownerId),
            settings: {
                allowAttachments: true,
                allowWikiLinks: true
            }
        }
    );
    }
);