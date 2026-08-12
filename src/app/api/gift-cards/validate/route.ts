import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/gift-cards/validate
// - { code } → check balance (no mutation)
// - { code, redeemCents } → redeem (deduct from balance)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, redeemCents } = body;

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const card = await db.giftCard.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!card) {
      return NextResponse.json({ valid: false, error: "Invalid gift card code" });
    }

    if (card.status !== "active") {
      return NextResponse.json({ valid: false, error: "This gift card is no longer active" });
    }

    // Pure balance check (no redeem)
    if (redeemCents === undefined) {
      return NextResponse.json({
        valid: true,
        balanceCents: card.balanceCents,
      });
    }

    // Redeem
    const amount = Math.abs(redeemCents);
    if (amount > card.balanceCents) {
      return NextResponse.json({ valid: false, error: "Insufficient balance on gift card" });
    }

    const newBalance = card.balanceCents - amount;
    await db.giftCard.update({
      where: { id: card.id },
      data: {
        balanceCents: newBalance,
        status: newBalance === 0 ? "exhausted" : "active",
      },
    });

    return NextResponse.json({ valid: true, balanceCents: newBalance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
