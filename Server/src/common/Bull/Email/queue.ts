import { envConfig } from "@/config/env";
import redis, { bullConnection } from "@/config/redis";
import { Queue } from "bullmq";

export const emailQueue = new Queue("email", {
    connection: bullConnection
});
