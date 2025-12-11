export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const path = query.path as string | undefined
  const limit = Math.min(parseInt(query.limit as string) || 10, 50)

  const db = useDrizzle()

  try {
    if (path) {
      const stats = await db
        .select()
        .from(tables.evalStats)
        .where(eq(tables.evalStats.evalPath, path))
        .get()

      return {
        path,
        viewCount: stats?.viewCount ?? 0,
        lastViewedAt: stats?.lastViewedAt ?? null
      }
    }

    const topEvals = await db
      .select({
        path: tables.evalStats.evalPath,
        viewCount: tables.evalStats.viewCount,
        lastViewedAt: tables.evalStats.lastViewedAt
      })
      .from(tables.evalStats)
      .orderBy(desc(tables.evalStats.viewCount))
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

