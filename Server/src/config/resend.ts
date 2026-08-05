import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not configured");
}

export const resend = new Resend(apiKey);

export const emailConfig = {
  from: process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>",
};