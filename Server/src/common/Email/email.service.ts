import { emailConfig } from "@/config/resend";
import { envConfig } from "@/config/env";
import { resend } from "@/config/resend";
interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({
    to,
    subject,
    html,
}: SendEmailOptions) {
    try {
        const { data, error } = await resend.emails.send({
            from: emailConfig.from,
            to,
            subject,
            html,
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error("Failed to send email:", error);
        throw error;
    }
}