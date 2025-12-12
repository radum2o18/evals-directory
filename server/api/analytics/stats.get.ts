import * as dbSchema from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const path = query.path as string | undefined
  const limit = Math.min(parseInt(query.limit as string) || 10, 50)

  const db = await getDb(event)

  try {
    if (path) {
      const stats = await db
        .select()
        .from(dbSchema.evalStats)
        .where(eq(dbSchema.evalStats.evalPath, path))
        .get()

      return {
        path,
        viewCount: stats?.viewCount ?? 0,
        lastViewedAt: stats?.lastViewedAt ?? null
      }
    }

    const topEvals = await db
      .select({
        path: dbSchema.evalStats.evalPath,
        viewCount: dbSchema.evalStats.viewCount,
        lastViewedAt: dbSchema.evalStats.lastViewedAt
      })
      .from(dbSchema.evalStats)
      .orderBy(desc(dbSchema.evalStats.viewCount))
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

