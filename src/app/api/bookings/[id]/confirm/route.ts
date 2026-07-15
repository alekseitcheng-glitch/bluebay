import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transporter, senderEmail } from "@/lib/email";

// POST /api/bookings/[id]/confirm — admin confirms a booking
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, newDate, newTime } = body;

    // action: "confirm" | "change"
    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: Record<string, any> = {};
    if (action === "confirm") {
      updateData.status = "confirmed";
    } else if (action === "change" && newDate && newTime) {
      updateData.status = "confirmed";
      updateData.dateIso = newDate;
      updateData.timeSlot = newTime;
    }

    const updated = await db.booking.update({
      where: { id },
      data: updateData,
    });

    // Send confirmation email to customer
    const dateStr = new Date(updated.dateIso + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });
    const customerHtml = `
      <div style="font-family: 'Outfit', Arial, sans-serif; max-width:600px; margin:0 auto; background:#0B0F1A; color:#F8FAFC; border-radius:10px; overflow:hidden;">
        <div style="background:#3B82F6; padding:24px 28px; text-align:center;">
          <h1 style="margin:0; font-size:22px; font-weight:800; color:#F8FAFC;">BlueBay Auto Care</h1>
          <p style="margin:6px 0 0; font-size:14px; color:rgba(255,255,255,0.9);">Appointment Confirmed</p>
        </div>
        <div style="padding:28px 32px;">
          <p style="font-size:18px; margin:0 0 20px;">Hi ${updated.customerName},</p>
          <p style="font-size:15px; line-height:1.7; margin:0 0 24px;">Great news! Your appointment has been <strong style="color:#34D399;">confirmed</strong>. Here are the details:</p>
          <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
            <tr><td style="padding:10px 0; border-bottom:1px solid #1E293B; color:#64748B; font-size:12px; width:120px;">Service</td><td style="padding:10px 0; border-bottom:1px solid #1E293B; font-weight:700;">${updated.packageName}</td></tr>
            <tr><td style="padding:10px 0; border-bottom:1px solid #1E293B; color:#64748B; font-size:12px;">Vehicle</td><td style="padding:10px 0; border-bottom:1px solid #1E293B;">${updated.vehicleDesc}</td></tr>
            <tr><td style="padding:10px 0; border-bottom:1px solid #1E293B; color:#64748B; font-size:12px;">Date</td><td style="padding:10px 0; border-bottom:1px solid #1E293B; font-weight:700; color:#60A5FA;">${dateStr} at ${updated.timeSlot}</td></tr>
            <tr><td style="padding:10px 0; border-bottom:1px solid #1E293B; color:#64748B; font-size:12px;">Address</td><td style="padding:10px 0; border-bottom:1px solid #1E293B;">${updated.address}</td></tr>
            <tr><td style="padding:10px 0; border-bottom:1px solid #1E293B; color:#64748B; font-size:12px;">Ref</td><td style="padding:10px 0; border-bottom:1px solid #1E293B;">${updated.ref}</td></tr>
          </table>
          <p style="font-size:13px; color:#94A3B8; line-height:1.6; margin:0 0 20px;"><strong style="color:#FBBF24;">Payment:</strong> Collected after your appointment — card, cash, PayPal, or Venmo.</p>
          <p style="font-size:13px; color:#94A3B8; line-height:1.6; margin:0;">Questions? Call or text <strong style="color:#F8FAFC;">(415) 702-8468</strong></p>
        </div>
        <div style="background:#111827; padding:14px 28px; text-align:center; font-size:11px; color:#475569; border-top:1px solid #1E293B;">
          BlueBay Auto Care / San Francisco, CA
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"BlueBay Auto Care" <${senderEmail}>`,
      to: `"${updated.customerName}" <${updated.customerEmail}>`,
      subject: `Appointment Confirmed — ${dateStr} at ${updated.timeSlot}`,
      html: customerHtml,
      replyTo: senderEmail,
    });

    return NextResponse.json({ ok: true, booking: updated });
  } catch (err: any) {
    console.error("[Confirm booking error]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
