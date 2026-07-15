import nodemailer from "nodemailer";

/**
 * Shared SMTP transporter for outbound email.
 *
 * Env var names (SMTP_*) match what's configured in Vercel. Works with
 * Brevo or any other SMTP relay. `createTransport` only builds the config
 * object — it doesn't open a connection until `sendMail` is called — so
 * creating it at module load is safe on serverless.
 */
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // STARTTLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/** "From" address — must be a sender verified inside your SMTP provider. */
export const senderEmail = process.env.SMTP_FROM || "alekseitcheng@gmail.com";
