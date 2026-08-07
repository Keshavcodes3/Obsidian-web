import { Queue } from "bullmq";
import { bullConnection } from "@/config/redis";

export const sendInvitaitonQueue = new Queue("send-invitation-mail", {
    connection: bullConnection
})