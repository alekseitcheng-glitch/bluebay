import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ALL_SLOTS = [
  "8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM",
];

// GET /api/available-slots?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    if (!date) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
    }

    // Get blocked times for this date
    const blocked = await db.blockedTime.findMany({
      where: { dateIso: date },
    });

    // If full day is blocked (timeSlot === null), no slots available
    const fullDayBlocked = blocked.some(b => b.timeSlot === null);
    if (fullDayBlocked) {
      return NextResponse.json({ slots: [], blockedSlots: ALL_SLOTS });
    }

    const blockedSlots = blocked.map(b => b.timeSlot).filter(Boolean) as string[];
    const availableSlots = ALL_SLOTS.filter(s => !blockedSlots.includes(s));

    return NextResponse.json({ slots: availableSlots, blockedSlots });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
