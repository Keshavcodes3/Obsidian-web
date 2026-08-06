import { eventBus } from "@/common/events";
import { WORKSPACE_EVENTS } from "@/modules/Workspace/events/workspace.event";
import { Types } from "mongoose";



eventBus.subscribe(
    WORKSPACE_EVENTS.CREATED, async (event: {
        workspaceId: Types.ObjectId,
        name: string,
        slug: string
    }) => {
    console.log(`Workspace with name ${event.name} created , welcome now you can edit`)
}
)