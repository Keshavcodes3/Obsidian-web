import redis, { bullConnection } from "@/config/redis";
import { Worker, Job } from "bullmq";

interface SendEmailPayload {
    username: string;
    email: string;
    otp: number;
}

export const emailWorker = new Worker<SendEmailPayload>("email", async (job: Job<SendEmailPayload>) => {
    const { username, email,otp } = job.data;

    console.log(`Email sent successfully to ${email}, username: ${username}`);
},
    {
        connection: bullConnection
    });



emailWorker.on("ready", () => {
    console.log("✅ Email worker is ready");
});

emailWorker.on("active", (job) => {
    console.log("🚀 Processing:", job.name);
});

emailWorker.on("completed", (job) => {
    console.log("✅ Completed:", job.name);
});

emailWorker.on("failed", (job, err) => {
    console.error("❌ Failed:", job?.name, err);
});

emailWorker.on("error", (err) => {
    console.error("Worker error:", err);
});