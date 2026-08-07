import { Worker } from "bullmq";

import { bullConnection } from "@/config/redis";
import { sendEmail } from "@/common/Email/email.service";

type InvitationJob = {
    invitationId: string;
    workspaceId: string;
    invitedBy: string;
    email: string;
    token: string;
};

export const emailInvitationWorker = new Worker<InvitationJob>(
    "send-invitation-mail",
    async (job) => {
        const inviteLink = `${process.env.CLIENT_URL}/invite/${job.data.token}`;

        await sendEmail({
            to: job.data.email,
            subject: "You're invited to join a workspace",
            html: `
                <div style="font-family: Arial, sans-serif; line-height:1.6;">
                    <h2>Workspace Invitation</h2>

                    <p>You've been invited to collaborate on a workspace.</p>

                    <p>
                        Click the button below to accept your invitation.
                    </p>

                    <a
                        href="${inviteLink}"
                        style="
                            display:inline-block;
                            padding:12px 20px;
                            background:#000;
                            color:#fff;
                            text-decoration:none;
                            border-radius:6px;
                        "
                    >
                        Accept Invitation
                    </a>

                    <p style="margin-top:20px;">
                        Or copy this link:
                    </p>

                    <p>${inviteLink}</p>

                    <p>
                        If you weren't expecting this invitation, you can safely ignore this email.
                    </p>
                </div>
            `,
        });

        console.log(
            `Invitation mail sent to ${job.data.email}`
        );
    },
    {
        connection: bullConnection,
        concurrency: 5,
    }
);

emailInvitationWorker.on("completed", (job) => {
    console.log(`Invitation email job ${job.id} completed`);
});

emailInvitationWorker.on("failed", (job, err) => {
    console.error(
        `Invitation email job ${job?.id} failed:`,
        err.message
    );
});