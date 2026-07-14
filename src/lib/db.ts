import { PrismaClient } from '@prisma/client'

// Cache the client on the global so Next.js dev hot-reloading and the
// serverless function warm instances don't open a new pool on every call.
// On Vercel (serverless), each warm instance keeps one pooled connection
// to Neon — Neon's pooler handles the rest.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    // `query` logging is noisy and slightly costly in production; keep it dev-only.
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'error', 'warn'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db