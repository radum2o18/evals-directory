import { db, schema } from 'hub:db'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const path = query.path as string | undefined
  const limit = Math.min(parseInt(query.limit as string) || 10, 50)

  try {
    if (path) {
      const stats = await db
        .select()
        .from(schema.evalStats)
        .where(eq(schema.evalStats.evalPath, path))
        .get()

      return {
        path,
        viewCount: stats?.viewCount ?? 0,
        lastViewedAt: stats?.lastViewedAt ?? null
      }
    }

    const topEvals = await db
      .select({
        path: schema.evalStats.evalPath,
        viewCount: schema.evalStats.viewCount,
        lastViewedAt: schema.evalStats.lastViewedAt
      })
      .from(schema.evalStats)
      .orderBy(desc(schema.evalStats.viewCount))
      .limit(limit)
      .all()

    return {
      evals: topEvals
    }
  } catch {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch stats'
    })
  }
})
