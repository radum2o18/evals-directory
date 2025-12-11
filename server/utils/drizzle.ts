import { drizzle } from 'drizzle-orm/d1'

import * as schema from '../database/schema'
export { sql, eq, and, or, desc, asc } from 'drizzle-orm'

export const tables = schema

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema })
}

export type EvalView = typeof schema.evalViews.$inferSelect
export type EvalStats = typeof schema.evalStats.$inferSelect

