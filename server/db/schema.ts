import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const evalViews = sqliteTable('eval_views', {
  id: text('id').primaryKey(),
  evalPath: text('eval_path').notNull(),
  viewedAt: integer('viewed_at', { mode: 'timestamp' }).notNull(),
  visitorHash: text('visitor_hash')
}, (table) => [
  index('eval_views_path_idx').on(table.evalPath),
  index('eval_views_viewed_at_idx').on(table.viewedAt)
])

export const evalStats = sqliteTable('eval_stats', {
  evalPath: text('eval_path').primaryKey(),
  viewCount: integer('view_count').notNull().default(0),
  lastViewedAt: integer('last_viewed_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
}, (table) => [
  index('eval_stats_view_count_idx').on(table.viewCount)
])

export type EvalView = typeof evalViews.$inferSelect
export type NewEvalView = typeof evalViews.$inferInsert
export type EvalStats = typeof evalStats.$inferSelect
export type NewEvalStats = typeof evalStats.$inferInsert



