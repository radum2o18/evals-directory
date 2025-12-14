export interface FacetedFilters {
  tags: string[]
  frameworks: string[]
  useCases: string[]
  languages: string[]
  difficulties: string[]
}

const USE_CASES = ['rag', 'chatbot', 'code-gen', 'classification', 'prompt-engineering', 'experimentation', 'other'] as const
const LANGUAGES = ['typescript', 'python', 'yaml'] as const
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const

export const useFacetedFilter = () => {
  const route = useRoute()
  const router = useRouter()

  const parseArrayParam = (param: string | string[] | undefined): string[] => {
    if (!param) return []
    if (Array.isArray(param)) return param
    return param.split(',').filter(Boolean)
  }

  const filters = reactive<FacetedFilters>({
    tags: parseArrayParam(route.query.tags as string),
    frameworks: parseArrayParam(route.query.frameworks as string),
    useCases: parseArrayParam(route.query.use_cases as string),
    languages: parseArrayParam(route.query.languages as string),
    difficulties: parseArrayParam(route.query.difficulties as string)
  })

  const syncToUrl = useDebounceFn(() => {
    const query: Record<string, string | undefined> = {}
    
    if (filters.tags.length) query.tags = filters.tags.join(',')
    if (filters.frameworks.length) query.frameworks = filters.frameworks.join(',')
    if (filters.useCases.length) query.use_cases = filters.useCases.join(',')
    if (filters.languages.length) query.languages = filters.languages.join(',')
    if (filters.difficulties.length) query.difficulties = filters.difficulties.join(',')

    router.replace({ query })
  }, 100)

  watch(() => [filters.tags, filters.frameworks, filters.useCases, filters.languages, filters.difficulties], syncToUrl, { deep: true })

  watch(() => route.query, (newQuery) => {
    filters.tags = parseArrayParam(newQuery.tags as string)
    filters.frameworks = parseArrayParam(newQuery.frameworks as string)
    filters.useCases = parseArrayParam(newQuery.use_cases as string)
    filters.languages = parseArrayParam(newQuery.languages as string)
    filters.difficulties = parseArrayParam(newQuery.difficulties as string)
  })

  const toggleTag = (tag: string) => {
    const idx = filters.tags.indexOf(tag)
    if (idx === -1) {
      filters.tags.push(tag)
    } else {
      filters.tags.splice(idx, 1)
    }
  }

  const toggleFramework = (slug: string) => {
    const idx = filters.frameworks.indexOf(slug)
    if (idx === -1) {
      filters.frameworks.push(slug)
    } else {
      filters.frameworks.splice(idx, 1)
    }
  }

  const toggleUseCase = (useCase: string) => {
    const idx = filters.useCases.indexOf(useCase)
    if (idx === -1) {
      filters.useCases.push(useCase)
    } else {
      filters.useCases.splice(idx, 1)
    }
  }

  const toggleLanguage = (lang: string) => {
    const idx = filters.languages.indexOf(lang)
    if (idx === -1) {
      filters.languages.push(lang)
    } else {
      filters.languages.splice(idx, 1)
    }
  }

  const toggleDifficulty = (difficulty: string) => {
    const idx = filters.difficulties.indexOf(difficulty)
    if (idx === -1) {
      filters.difficulties.push(difficulty)
    } else {
      filters.difficulties.splice(idx, 1)
    }
  }

  const hasTag = (tag: string) => filters.tags.includes(tag)
  const hasFramework = (slug: string) => filters.frameworks.includes(slug)
  const hasUseCase = (useCase: string) => filters.useCases.includes(useCase)
  const hasLanguage = (lang: string) => filters.languages.includes(lang)
  const hasDifficulty = (difficulty: string) => filters.difficulties.includes(difficulty)

  const clearTags = () => { filters.tags = [] }
  const clearFrameworks = () => { filters.frameworks = [] }
  const clearUseCases = () => { filters.useCases = [] }
  const clearLanguages = () => { filters.languages = [] }
  const clearDifficulties = () => { filters.difficulties = [] }

  const clearAll = () => {
    filters.tags = []
    filters.frameworks = []
    filters.useCases = []
    filters.languages = []
    filters.difficulties = []
  }

  const hasActiveFilters = computed(() => 
    filters.tags.length > 0 ||
    filters.frameworks.length > 0 ||
    filters.useCases.length > 0 ||
    filters.languages.length > 0 ||
    filters.difficulties.length > 0
  )

  const activeFilterCount = computed(() =>
    filters.tags.length +
    filters.frameworks.length +
    filters.useCases.length +
    filters.languages.length +
    filters.difficulties.length
  )

  const copyFilterLink = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    return url
  }

  const filterItems = <T extends { 
    path?: string
    tags?: string[]
    use_case?: string
    languages?: string[]
    difficulty?: string 
  }>(items: T[]): T[] => {
    return items.filter(item => {
      if (filters.frameworks.length > 0) {
        const itemFramework = item.path?.split('/')[1]
        if (!itemFramework || !filters.frameworks.includes(itemFramework)) return false
      }

      if (filters.useCases.length > 0) {
        if (!item.use_case || !filters.useCases.includes(item.use_case)) return false
      }

      if (filters.languages.length > 0) {
        if (!item.languages || !filters.languages.some(lang => item.languages!.includes(lang))) return false
      }

      if (filters.difficulties.length > 0) {
        if (!item.difficulty || !filters.difficulties.includes(item.difficulty)) return false
      }

      if (filters.tags.length > 0) {
        if (!item.tags || !filters.tags.every(tag => item.tags!.includes(tag))) return false
      }

      return true
    })
  }

  return {
    filters,
    USE_CASES,
    LANGUAGES,
    DIFFICULTIES,
    toggleTag,
    toggleFramework,
    toggleUseCase,
    toggleLanguage,
    toggleDifficulty,
    hasTag,
    hasFramework,
    hasUseCase,
    hasLanguage,
    hasDifficulty,
    clearTags,
    clearFrameworks,
    clearUseCases,
    clearLanguages,
    clearDifficulties,
    clearAll,
    hasActiveFilters,
    activeFilterCount,
    copyFilterLink,
    filterItems
  }
}

