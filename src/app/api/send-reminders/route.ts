import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

// GET /api/send-reminders — sends day-before reminders
// This should be called by a cron job once daily
export async function GET() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIso = tomorrow.toISOString().split("T")[0];

    // Find confirmed bookings for tomorrow that haven't had reminders sent
    const bookings = await db.booking.findMany({
      where: {
        dateIso: tomorrowIso,
        status: "confirmed",
        reminderSent: false,
      },
    });

    const senderEmail = process.env.BREVO_SENDER_EMAIL || "alekseitcheng@gmail.com";
    let sentCount = 0;

    for (const booking of bookings) {
      const dateStr = new Date(booking.dateIso + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric",
      });

      const reminderHtml = `
        <div style="font-family: 'Outfit', Arial, sans-serif; max-width:600px; margin:0 auto; background:#0B0F1A; color:#fff; border-radius:10px; overflow:hidden;">
          <div style="background:#D4A24E; padding:24px 28px; text-align:center;">
            <h1 style="margin:0; font-size:22px; font-weight:800; color:#0B0F1A;">BlueBay Auto Care</h1>
            <p style="margin:6px 0 0; font-size:14px; color:#0B0F1A;">Tomorrow's Appointment Reminder</p>
          </div>
          <div style="padding:28px 32px;">
            <p style="font-size:18px; margin:0 0 20px;">Hi ${booking.customerName},</p>
            <p style="font-size:15px; line-height:1.7; margin:0 0 24px;">This is a friendly reminder that your detailing appointment is <strong style="color:#FBBF24;">tomorrow</strong>.</p>
            <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
              <tr><td style="padding:10px 0; border-bottom:1px solid #1E293B; color:#64748B; font-size:12px; width:120px;">Service</td><td style="padding:10px 0; border-bottom:1px solid #1E293B; font-weight:700;">${booking.packageName}</td></tr>
              <tr><td style="padding:10px 0; border-bottom:1px solid #1E293B; color:#64748B; font-size:12px;">Date & Time</td><td style="padding:10px 0; border-bottom:1px solid #1E293B; font-weight:700; color:#60A5FA;">${dateStr} at ${booking.timeSlot}</td></tr>
              <tr><td style="padding:10px 0; border-bottom:1px solid #1E293B; color:#64748B; font-size:12px;">Address</td><td style="padding:10px 0; border-bottom:1px solid #1E293B;">${booking.address}</td></tr>
              <tr><td style="padding:10px 0; border-bottom:1px solid #1E293B; color:#64748B; font-size:12px;">Ref</td><td style="padding:10px 0; border-bottom:1px solid #1E293B;">${booking.ref}</td></tr>
            </table>
            <p style="font-size:13px; color:#64748B; line-height:1.6; margin:0 0 20px;"><strong style="color:#FBBF24;">Payment:</strong> Collected after your appointment — card, cash, PayPal, or Venmo.</p>
            <p style="font-size:13px; color:#64748B; line-height:1.6; margin:0;">Need to reschedule? Call or text <strong style="color:#F8FAFC;">(415) 702-8468</strong></p>
          </div>
          <div style="background:#111827; padding:14px 28px; text-align:center; font-size:11px; color:#475569; border-top:1px solid #1E293B;">
            BlueBay Auto Care / San Francisco, CA
          </div>
        </div>
      `;

      // Send to customer
      await transporter.sendMail({
        from: `"BlueBay Auto Care" <${senderEmail}>`,
        to: `"${booking.customerName}" <${booking.customerEmail}>`,
        subject: `Reminder: Your Detailing Appointment is Tomorrow — ${dateStr}`,
        html: reminderHtml,
        replyTo: senderEmail,
      });

      // Send to admin
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:24px; background:#f8f9fa; border-radius:8px;">
          <h2 style="color:#3B82F6; margin-top:0;">Reminder: Appointment Tomorrow</h2>
          <p>You have a confirmed appointment tomorrow:</p>
          <table style="width:100%; border-collapse:collapse;">
            <tr><td style="padding:8px 0; color:#666; width:120px;">Customer</td><td style="padding:8px 0; font-weight:700;">${booking.customerName}</td></tr>
            <tr><td style="padding:8px 0; color:#666;">Service</td><td style="padding:8px 0;">${booking.packageName}</td></tr>
            <tr><td style="padding:8px 0; color:#666;">Time</td><td style="padding:8px 0; color:#3B82F6; font-weight:700;">${dateStr} at ${booking.timeSlot}</td></tr>
            <tr><td style="padding:8px 0; color:#666;">Address</td><td style="padding:8px 0;">${booking.address}</td></tr>
            <tr><td style="padding:8px 0; color:#666;">Phone</td><td style="padding:8px 0;">${booking.customerPhone}</td></tr>
            <tr><td style="padding:8px 0; color:#666;">Ref</td><td style="padding:8px 0;">${booking.ref}</td></tr>
          </table>
        </div>
      `;
      await transporter.sendMail({
        from: `"BlueBay Auto Care" <${senderEmail}>`,
        to: `"BlueBay Team" <alekseitcheng@icloud.com>`,
        subject: `Reminder: ${booking.customerName} tomorrow at ${booking.timeSlot}`,
        html: adminHtml,
        replyTo: booking.customerEmail,
      });

      // Mark reminder as sent
      await db.booking.update({
        where: { id: booking.id },
        data: { reminderSent: true },
      });

      sentCount++;
    }

    return NextResponse.json({ ok: true, sentCount, totalChecked: bookings.length });
  } catch (err: any) {
    console.error("[Reminder error]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
