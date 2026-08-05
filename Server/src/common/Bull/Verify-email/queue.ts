import { Queue } from "bullmq";
import { bullConnection } from "@/config/redis";

export const emailVerifyQueue = new Queue("email-verify", {
    connection: bullConnection
})