import { eventBus } from "@/common/events";
import { WORKSPACE_EVENTS } from "@/modules/Workspace/events/workspace.event";
import { Types } from "mongoose";
import memberService from "@/modules/Members/services/member.service";
import vaultService from "@/modules/vault/services/vault.service";

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
            event.workspaceId,
            event.ownerId,
            {
                name: "My Vault",
                description: "Default vault for " + event.name,
            }
        );
    }   
);