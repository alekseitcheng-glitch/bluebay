import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/promo-codes/validate — customer validates a promo code at checkout
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, estimatedCents } = body;

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const promo = await db.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!promo) {
      return NextResponse.json({ valid: false, error: "Invalid promo code" });
    }

    if (!promo.active) {
      return NextResponse.json({ valid: false, error: "This code is no longer active" });
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: "This code has reached its usage limit" });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "This code has expired" });
    }

    // Calculate discount
    let discountCents = 0;
    if (promo.type === "fixed") {
      discountCents = promo.discount;
    } else if (promo.type === "percent") {
      discountCents = Math.round((estimatedCents * promo.discount) / 100);
    }

    return NextResponse.json({
      valid: true,
      label: promo.label,
      discountCents,
      type: promo.type,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
