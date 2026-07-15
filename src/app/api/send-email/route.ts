import { NextRequest, NextResponse } from "next/server";
import { transporter, senderEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toEmail, toName, subject, html } = body;

    if (!toEmail || !subject) {
      return NextResponse.json({ error: "Missing required fields: toEmail, subject" }, { status: 400 });
    }

    const result = await transporter.sendMail({
      from: `"BlueBay Auto Care" <${senderEmail}>`,
      to: `"${toName || ""}" <${toEmail}>`,
      subject,
      html,
      replyTo: senderEmail,
    });

    console.log("[Email sent]", result.messageId);
    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (err: any) {
    console.error("[Email error]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
