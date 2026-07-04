import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/bookings — list all bookings (admin)
export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bookings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/bookings — create a new booking (customer)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      vehicleType,
      vehicleDesc,
      address,
      packageId,
      packageName,
      addons,
      dateIso,
      timeSlot,
      notes,
      promoCode,
      discount,
      estimatedCents,
      finalCents,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !vehicleType || !vehicleDesc || !address || !packageId || !dateIso || !timeSlot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ref = "BB" + Date.now().toString(36).toUpperCase();

    const booking = await db.booking.create({
      data: {
        ref,
        status: "pending",
        customerName,
        customerEmail,
        customerPhone,
        vehicleType,
        vehicleDesc,
        address,
        packageId,
        packageName,
        addons: JSON.stringify(addons || []),
        dateIso,
        timeSlot,
        notes: notes || "",
        promoCode: promoCode || null,
        discount: discount || 0,
        estimatedCents: estimatedCents || 0,
        finalCents: finalCents || 0,
      },
    });

    return NextResponse.json({ ok: true, booking });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
