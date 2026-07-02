import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/bookings/[id] — get single booking
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ booking });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/bookings/[id] — update booking (status change, time change, etc.)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updateData: Record<string, any> = {};
    
    if (body.status) updateData.status = body.status;
    if (body.dateIso) updateData.dateIso = body.dateIso;
    if (body.timeSlot) updateData.timeSlot = body.timeSlot;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const booking = await db.booking.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true, booking });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/bookings/[id] — cancel booking
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.booking.update({
      where: { id },
      data: { status: "cancelled" },
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
