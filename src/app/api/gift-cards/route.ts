import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/gift-cards — list all gift cards (admin)
export async function GET() {
  try {
    const cards = await db.giftCard.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ cards });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/gift-cards — create / purchase a gift card
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amountCents, purchaserName, recipientName, recipientEmail, message } = body;

    if (!amountCents || amountCents < 500) {
      return NextResponse.json({ error: "Minimum value is $5" }, { status: 400 });
    }

    const rand = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `BB-${rand()}-${rand()}`;

    const card = await db.giftCard.create({
      data: {
        code,
        amountCents: amountCents,
        balanceCents: amountCents,
        status: "active",
        purchaserName: purchaserName || "",
        purchaserEmail: "",
        recipientName: recipientName || "",
        recipientEmail: recipientEmail || "",
        message: message || "",
      },
    });

    return NextResponse.json({ ok: true, card });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
