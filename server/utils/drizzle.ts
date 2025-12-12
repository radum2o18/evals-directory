import { drizzle } from 'drizzle-orm/d1'
import type { H3Event } from 'h3'
import { createError } from 'h3'

import * as dbSchema from '../db/schema'
export { sql, eq, and, or, desc, asc } from 'drizzle-orm'

export async function getDb(event: H3Event) {
  type D1Client = Parameters<typeof drizzle>[0]
  const ctx = event.context as { cloudflare?: { env?: Record<string, unknown> } }
  const d1 = ctx.cloudflare?.env?.DB as unknown as D1Client
  if (d1) return drizzle(d1, { schema: dbSchema })
  try {
    const hubDb = await import('hub:db')
    return hubDb.db
  } catch {
    throw createError({
      statusCode: 500,
      message: 'Missing DB: no Cloudflare D1 binding `DB` and cannot import `hub:db`'
    })
  }
}

export type EvalView = typeof dbSchema.evalViews.$inferSelect
export type EvalStats = typeof dbSchema.evalStats.$inferSelect

