import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Brevo SMTP transporter (created once, reused)
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT) || 587,
  secure: false, // TLS via STARTTLS on port 587
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toEmail, toName, subject, html } = body;

    if (!toEmail || !subject) {
      return NextResponse.json({ error: "Missing required fields: toEmail, subject" }, { status: 400 });
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL || "alekseitcheng@gmail.com";

    const result = await transporter.sendMail({
      from: `"BlueBay Auto Care" <${senderEmail}>`,
      to: `"${toName || ""}" <${toEmail}>`,
      subject,
      html,
      replyTo: senderEmail,
    });

    console.log("[Brevo Email sent]", result.messageId);
    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (err: any) {
    console.error("[Brevo Email error]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
