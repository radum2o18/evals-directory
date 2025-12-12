import * as dbSchema from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { path } = body

  if (!path || typeof path !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Path is required'
    })
  }

  if (!path.startsWith('/') || path.includes('..')) {
    throw createError({
      statusCode: 400,
      message: 'Invalid path'
    })
  }

  const db = await getDb(event)
  const now = new Date()

  const headers = getHeaders(event)
  const visitorData = `${headers['user-agent'] || ''}-${headers['accept-language'] || ''}`
  const visitorHash = await hashString(visitorData)
  const viewId = crypto.randomUUID()

  try {
    await db.insert(dbSchema.evalViews).values({
      id: viewId,
      evalPath: path,
      viewedAt: now,
      visitorHash
    })

    const existingStats = await db
      .select()
      .from(dbSchema.evalStats)
      .where(eq(dbSchema.evalStats.evalPath, path))
      .get()

    if (existingStats) {
      await db
        .update(dbSchema.evalStats)
        .set({
          viewCount: existingStats.viewCount + 1,
          lastViewedAt: now,
          updatedAt: now
        })
        .where(eq(dbSchema.evalStats.evalPath, path))
    } else {
      await db.insert(dbSchema.evalStats).values({
        evalPath: path,
        viewCount: 1,
        lastViewedAt: now,
        updatedAt: now
      })
    }

    return { success: true }
  } catch {
    throw createError({
      statusCode: 500,
      message: 'Failed to record view'
    })
  }
})

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

