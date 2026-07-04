import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/promo-codes/[id] — update promo code
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updateData: Record<string, any> = {};
    
    if (body.code) updateData.code = body.code.toUpperCase().trim();
    if (body.label) updateData.label = body.label;
    if (body.discount !== undefined) updateData.discount = body.discount;
    if (body.type) updateData.type = body.type;
    if (body.maxUses !== undefined) updateData.maxUses = body.maxUses;
    if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    if (body.active !== undefined) updateData.active = body.active;

    const promoCode = await db.promoCode.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true, promoCode });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/promo-codes/[id] — delete promo code
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.promoCode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
