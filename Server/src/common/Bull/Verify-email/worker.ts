import { Worker } from "bullmq";
import { emailVerifyQueue } from "./queue";
import { bullConnection } from "@/config/redis";
import { connection } from "mongoose";
import { sendOtpEmail } from "@/common/Email/sendEmailVerification";


interface Job {
    email: string,
    username: string,
    otp: number
}

export const emailVerifyWorker = new Worker<Job>("email-verify", async (job) => {
    const { email, username, otp } = job.data
    console.log(`otp ${otp} sent to use ${email}`)
    await sendOtpEmail(email, otp)
}, {
    connection: bullConnection
})