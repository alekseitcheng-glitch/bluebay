import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/gift-cards/[id] — toggle status / adjust balance (admin)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updateData: Record<string, any> = {};

    if (body.status !== undefined) {
      updateData.status = body.status;
    } else if (body.active !== undefined) {
      updateData.status = body.active ? "active" : "inactive";
    }

    if (body.addCents) {
      const card = await db.giftCard.findUnique({ where: { id } });
      if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const newBalance = card.balanceCents + body.addCents;
      updateData.balanceCents = newBalance;
      updateData.status = newBalance > 0 ? "active" : "exhausted";
    }

    const card = await db.giftCard.update({ where: { id }, data: updateData });
    return NextResponse.json({ ok: true, card });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/gift-cards/[id] — delete gift card (admin)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.giftCard.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
