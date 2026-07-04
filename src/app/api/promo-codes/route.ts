import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/promo-codes — list all promo codes
export async function GET() {
  try {
    const codes = await db.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ codes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/promo-codes — create a promo code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, label, discount, type, maxUses, expiresAt, active } = body;

    if (!code || !label || !discount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const promoCode = await db.promoCode.create({
      data: {
        code: code.toUpperCase().trim(),
        label,
        discount,
        type,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: active !== false,
      },
    });

    return NextResponse.json({ ok: true, promoCode });
  } catch (err: any) {
    if (err.message?.includes("Unique")) {
      return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
