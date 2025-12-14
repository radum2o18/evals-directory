interface EvalStats {
  path: string
  viewCount: number
  lastViewedAt: string | null
}

export const usePopularity = () => {
  const trackView = async (path: string) => {
    await $fetch('/api/analytics/view', {
      method: 'POST',
      body: { path }
    }).catch(() => {})
  }

  const getStats = async (path: string): Promise<EvalStats | null> => {
    return await $fetch<{ path: string; viewCount: number; lastViewedAt: string | null }>('/api/analytics/stats', {
      query: { path }
    }).catch(() => null)
  }

  const getTopEvals = async (limit = 10): Promise<EvalStats[]> => {
    const data = await $fetch<{ evals: EvalStats[] }>('/api/analytics/stats', {
      query: { limit }
    }).catch(() => ({ evals: [] }))
    return data.evals || []
  }

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const getPopularityTier = (count: number): 'hot' | 'popular' | 'rising' | null => {
    if (count >= 100) return 'hot'
    if (count >= 50) return 'popular'
    if (count >= 10) return 'rising'
    return null
  }

  return {
    trackView,
    getStats,
    getTopEvals,
    formatViewCount,
    getPopularityTier
  }
}

