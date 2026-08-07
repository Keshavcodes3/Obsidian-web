import { sendEmail } from "./email.service";

export async function sendOtpEmail(email: string, otp: number) {
    return sendEmail({
        to: email,
        subject: "Verify your email",
        html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>

        <h1
          style="
            letter-spacing:6px;
            color:#2563eb;
          "
        >
          ${otp}
        </h1>emai

        <p>This code will expire in <strong>15 minutes</strong>.</p>

        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
    });
}