import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/blocked-times — list all blocked times
export async function GET() {
  try {
    const blocked = await db.blockedTime.findMany({
      orderBy: { dateIso: "asc" },
    });
    return NextResponse.json({ blocked });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/blocked-times — create a blocked time
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dateIso, timeSlot, reason } = body;

    if (!dateIso) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const blocked = await db.blockedTime.create({
      data: {
        dateIso,
        timeSlot: timeSlot || null, // null = full day
        reason: reason || "",
      },
    });

    return NextResponse.json({ ok: true, blocked });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
