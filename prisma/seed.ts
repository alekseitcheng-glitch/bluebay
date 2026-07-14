import { PrismaClient } from '@prisma/client'

// Seed data for BlueBay Auto Care.
// Run with: `npx prisma db seed` (after `prisma migrate deploy` / `db push`).
// Safe to re-run — upserts by unique key, so existing rows are updated, not duplicated.
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding BlueBay database…')

  // ── Promo codes ──
  // `discount` is in cents (fixed) or a whole-number percent (type: "percent").
  const promos = [
    { code: 'WELCOME10', label: '10% off — new customer', discount: 10, type: 'percent', maxUses: null },
    { code: 'RETURN15',  label: '15% off — returning customer', discount: 15, type: 'percent', maxUses: null },
    { code: 'SUMMER25',  label: '$25 off — summer special', discount: 2500, type: 'fixed',  maxUses: 100 },
  ]

  for (const p of promos) {
    await prisma.promoCode.upsert({
      where: { code: p.code },
      update: { label: p.label, discount: p.discount, type: p.type, maxUses: p.maxUses, active: true },
      create: p,
    })
    console.log(`  ✓ promo ${p.code}`)
  }

  console.log('✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
