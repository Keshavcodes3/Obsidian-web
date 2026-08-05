import { emailQueue } from "@/common/Bull/Email/queue";
import { eventBus } from "@/common/events";
import { USER_EVENTS } from "@/common/events/EventTypes";
import { Types } from "mongoose";

eventBus.subscribe(
    USER_EVENTS.userCreated,
    async (event: {
        userId: Types.ObjectId,
        email: string,
        username: string
    }) => {
        console.log('Verfication mail sent successfully')
        await emailQueue.add("send-email", {
            username: event.username,
            email: event.email
        })
    }
)