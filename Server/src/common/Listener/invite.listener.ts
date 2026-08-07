import { eventBus } from "@/common/events";
import { INVITATION_EVENTS } from "@/modules/Invitations/Events/invitation.events";
import { sendInvitaitonQueue } from "../Bull/send-envitation-mail/queue";
import memberService from "@/modules/Members/services/member.service";
import { Types } from "mongoose";
import { WorkspaceRole } from "@/modules/Workspace/enum/workspace-role.enum";


eventBus.subscribe(INVITATION_EVENTS.CREATED, async (event: {
    invitationId: string,
    workspaceId: string,
    email: string,
    token: string
    invitedBy: string
}) => {
    console.log(`invitation mail sent to email ${event.email} with invitation id ${event.invitationId}`)
    await sendInvitaitonQueue.add("send-invitation-mail", {
        invitationId: event.invitationId,
        workspaceId: event.workspaceId,
        invitedBy: event.invitedBy,
        email: event.email,
        token: event.token
    },
        {
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 3000,
            },
            removeOnComplete: 100,
            removeOnFail: 1000,
        })
})

eventBus.subscribe(INVITATION_EVENTS.ACCEPTED, async (event: {
    invitationId: string,
    workspaceId: string,
    userId: string,
    invitedBy: string,
    role: WorkspaceRole,
}) => {
    console.log(`invitation accepted by user ${event.userId} for workspace ${event.workspaceId}`);

    await memberService.createMembership({
        workspaceId: new Types.ObjectId(event.workspaceId),
        userId: new Types.ObjectId(event.userId),
        invitedBy: new Types.ObjectId(event.invitedBy),
        role: event.role,
    });
});