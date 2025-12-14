export interface ComparisonEval {
  path: string
  title: string
  description: string
  use_case?: string
  languages?: string[]
  difficulty?: string
  tags?: string[]
  models?: string[]
  setup_time?: string
  runtime_cost?: string
  data_requirements?: string
  eval_type?: string
  metrics?: string[]
}

const MAX_COMPARISON_ITEMS = 4

export const useComparison = () => {
  const route = useRoute()
  const router = useRouter()

  const isCompareModalOpen = useState<boolean>('compare-modal-open', () => false)
  const itemsRegistry = useState<Record<string, ComparisonEval>>('comparison-items-registry', () => ({}))
  const comparePaths = useState<string[]>('compare-paths', () => [])
  const isInitialized = useState<boolean>('compare-initialized', () => false)
  
  if (import.meta.client && !isInitialized.value) {
    const param = route.query.compare as string | undefined
    if (param) {
      comparePaths.value = param.split(',').filter(Boolean)
    }
    isInitialized.value = true
  }

  const syncToUrl = async (paths: string[]) => {
    if (!import.meta.client) return
    
    const query = { ...route.query } as Record<string, string | undefined>
    if (paths.length > 0) {
      query.compare = paths.join(',')
    } else {
      delete query.compare
    }
    await router.replace({ query })
  }

  const comparisonItems = computed<ComparisonEval[]>(() => {
    return comparePaths.value
      .map(path => itemsRegistry.value[path])
      .filter((item): item is ComparisonEval => !!item)
  })

  const registerItems = (items: Array<{ path: string; title: string; description: string } & Partial<ComparisonEval>>) => {
    const registry: Record<string, ComparisonEval> = {}
    items.forEach(item => {
      if (item.path && item.title && item.description) {
        registry[item.path] = {
          path: item.path,
          title: item.title,
          description: item.description,
          use_case: item.use_case,
          languages: item.languages,
          difficulty: item.difficulty,
          tags: item.tags,
          models: item.models,
          setup_time: item.setup_time,
          runtime_cost: item.runtime_cost,
          data_requirements: item.data_requirements,
          eval_type: item.eval_type,
          metrics: item.metrics
        }
      }
    })
    itemsRegistry.value = registry
  }

  const isInComparison = (path: string) => {
    return comparePaths.value.includes(path)
  }

  const addToComparison = async (path: string) => {
    if (isInComparison(path)) return false
    if (comparePaths.value.length >= MAX_COMPARISON_ITEMS) return false

    const newPaths = [...comparePaths.value, path]
    comparePaths.value = newPaths
    await syncToUrl(newPaths)
    return true
  }

  const removeFromComparison = async (path: string) => {
    const newPaths = comparePaths.value.filter(p => p !== path)
    comparePaths.value = newPaths
    await syncToUrl(newPaths)
  }

  const toggleComparison = async (item: { path: string }) => {
    if (isInComparison(item.path)) {
      await removeFromComparison(item.path)
    } else {
      await addToComparison(item.path)
    }
  }

  const clearComparison = async () => {
    comparePaths.value = []
    await syncToUrl([])
  }

  const openCompareModal = () => {
    if (comparePaths.value.length >= 2) {
      isCompareModalOpen.value = true
    }
  }

  const closeCompareModal = () => {
    isCompareModalOpen.value = false
  }

  const comparisonCount = computed(() => comparePaths.value.length)
  const canCompare = computed(() => comparePaths.value.length >= 2)
  const canAddMore = computed(() => comparePaths.value.length < MAX_COMPARISON_ITEMS)

  return {
    comparePaths,
    comparisonItems,
    isCompareModalOpen,
    comparisonCount,
    canCompare,
    canAddMore,
    MAX_COMPARISON_ITEMS,
    isInComparison,
    addToComparison,
    removeFromComparison,
    toggleComparison,
    clearComparison,
    openCompareModal,
    closeCompareModal,
    registerItems
  }
}
