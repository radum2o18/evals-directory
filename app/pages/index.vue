<script setup lang="ts">
const { frameworks, getFrameworkBySlug } = useFrameworks()
const { open } = useContentSearch()
const { tagCategories } = useTagCategories()
const {
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
  clearAll,
  hasActiveFilters,
  activeFilterCount,
  filterItems
} = useFacetedFilter()
const {
  comparisonCount,
  canCompare,
  canAddMore,
  isInComparison,
  toggleComparison,
  clearComparison,
  openCompareModal,
  registerItems
} = useComparison()

const { copy, copied } = useClipboard()

const { data: allEvals, status } = await useAsyncData(
  'all-evals',
  () => queryCollection('content')
    .select('path', 'title', 'description', 'use_case', 'languages', 'tags', 'github_username', 'created_at', 'difficulty', 'changelog', 'models', 'metrics', 'setup_time', 'runtime_cost', 'data_requirements', 'eval_type')
    .all(),
  { default: () => [], server: false }
)

type EvalItem = NonNullable<typeof allEvals.value>[number]

const getLastUpdated = (item: EvalItem): number => {
  const date = item.changelog?.[0]?.date
  return date ? new Date(date).getTime() : 0
}

const getCreatedAt = (item: EvalItem): number => {
  if (item.created_at) return new Date(item.created_at).getTime()
  const oldest = item.changelog?.[item.changelog.length - 1]?.date
  return oldest ? new Date(oldest).getTime() : 0
}

const wasUpdated = (item: EvalItem): boolean => {
  return (item.changelog?.length || 0) >= 2
}

watch(allEvals, (items) => {
  if (items) registerItems(items)
}, { immediate: true })

const usedTagsByCategory = computed(() => {
  if (!allEvals.value) return {}
  
  const usedTags = new Set<string>()
  allEvals.value.forEach((item) => {
    item.tags?.forEach((tag) => usedTags.add(tag))
  })
  
  return Object.entries(tagCategories).reduce((acc, [key, category]) => {
    const categoryTags = category.tags.filter(tag => usedTags.has(tag))
    if (categoryTags.length > 0) {
      acc[key] = { ...category, tags: categoryTags }
    }
    return acc
  }, {} as Record<string, { label: string; tags: string[] }>)
})

const availableUseCases = computed(() => {
  if (!allEvals.value) return []
  const cases = new Set<string>()
  allEvals.value.forEach(item => {
    if (item.use_case) cases.add(item.use_case)
  })
  return Array.from(cases)
})

const availableLanguages = computed(() => {
  if (!allEvals.value) return []
  const langs = new Set<string>()
  allEvals.value.forEach(item => {
    item.languages?.forEach(lang => langs.add(lang))
  })
  return Array.from(langs)
})

const availableDifficulties = computed(() => {
  if (!allEvals.value) return []
  const diffs = new Set<string>()
  allEvals.value.forEach(item => {
    if (item.difficulty) diffs.add(item.difficulty)
  })
  return Array.from(diffs)
})

const availableFrameworks = computed(() => {
  if (!allEvals.value) return []
  const knownFrameworks = Object.keys(frameworks)
  const frameworkSlugs = new Set<string>()
  allEvals.value.forEach(item => {
    const fw = item.path?.split('/')[1]
    if (fw && knownFrameworks.includes(fw)) frameworkSlugs.add(fw)
  })
  return Array.from(frameworkSlugs)
})

const filteredEvals = computed(() => {
  if (!allEvals.value) return []
  if (!hasActiveFilters.value) return allEvals.value
  
  return filterItems(allEvals.value)
})

const recentlyUpdated = computed(() => {
  if (!filteredEvals.value) return []

  return [...filteredEvals.value]
    .filter(item => wasUpdated(item))
    .sort((a, b) => getLastUpdated(b) - getLastUpdated(a))
    .slice(0, 3)
})

const recentlyAdded = computed(() => {
  if (!filteredEvals.value) return []

  return [...filteredEvals.value]
    .sort((a, b) => getCreatedAt(b) - getCreatedAt(a))
    .slice(0, 3)
})

const featuredSections = computed(() => {
  if (!filteredEvals.value) return []

  const sections: { id: string; title: string; items: EvalItem[]; updatedOnly?: boolean }[] = []

  if (!hasActiveFilters.value && recentlyUpdated.value.length > 0) {
    sections.push({
      id: 'recently-updated',
      title: 'Recently Updated',
      items: recentlyUpdated.value,
      updatedOnly: true
    })
  }

  if (recentlyAdded.value.length) {
    sections.push({
      id: 'recently-added',
      title: hasActiveFilters.value ? 'Filtered Results' : 'Recently Added',
      items: recentlyAdded.value
    })
  }

  return sections
})

const handleCopyLink = () => {
  copy(window.location.href)
}

const formatDifficulty = (d: string) => d.charAt(0).toUpperCase() + d.slice(1)

const formatUseCase = (uc: string) => {
  const labels: Record<string, string> = {
    'rag': 'RAG',
    'chatbot': 'Chatbot',
    'code-gen': 'Code Gen',
    'classification': 'Classification',
    'prompt-engineering': 'Prompt Engineering',
    'experimentation': 'Experimentation',
    'other': 'Other'
  }
  return labels[uc] || uc
}

const getLanguageIcon = (lang: string) => {
  const icons: Record<string, string> = {
    typescript: 'i-simple-icons-typescript',
    python: 'i-simple-icons-python',
    yaml: 'i-heroicons-code-bracket'
  }
  return icons[lang.toLowerCase()] || 'i-heroicons-code-bracket'
}

const frameworkSections = computed(() => {
  if (!filteredEvals.value) return []

  return Object.values(frameworks).map((framework) => {
    const evals = filteredEvals.value!
      .filter((item) => item.path?.startsWith(`/${framework.slug}/`))
      .sort((a, b) => {
        const mostRecentA = Math.max(getLastUpdated(a), getCreatedAt(a))
        const mostRecentB = Math.max(getLastUpdated(b), getCreatedAt(b))
        return mostRecentB - mostRecentA
      })
      .slice(0, 3)

    return {
      framework,
      evals,
      firstPath: evals[0]?.path
    }
  }).filter(section => section.evals.length > 0)
})

const openSearch = () => {
  (open as Ref<boolean>).value = true
}

useSeoMeta({
  title: 'Evals Directory - Find the Perfect AI Evaluation Pattern',
  description: 'Discover and explore AI evaluation patterns across multiple frameworks. Search through a curated collection of evals for RAG, chatbots, code generation, and more.',
  ogTitle: 'Evals Directory',
  ogDescription: 'Discover and explore AI evaluation patterns across multiple frameworks.',
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Evals Directory',
        description: 'A curated collection of LLM evaluation patterns across popular evaluation frameworks',
        url: 'https://evals.directory',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://evals.directory/?search={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      })
    }
  ]
})
</script>

<template>
  <UMain>
    <UPageHero
      title="Find the perfect evaluation pattern"
      description="Discover and explore AI evaluation patterns across multiple frameworks. Search through a curated collection of evals for your next project."
      orientation="vertical"
    >
      <template #body>
        <div class="max-w-2xl mx-auto w-full">
          <UInput
            readonly
            size="xl"
            class="cursor-pointer w-full"
            placeholder="Search evals (Cmd + K)"
            icon="i-heroicons-magnifying-glass"
            @click="openSearch"
          />
        </div>
      </template>
    </UPageHero>

    <UContainer class="py-16">
      <div class="mb-8">
        <div class="flex items-center justify-between gap-3 mb-5">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-funnel" class="w-5 h-5 text-muted" />
            <span class="text-base font-medium text-muted">Filter evals</span>
            <UBadge v-if="activeFilterCount > 0" color="primary" size="md">
              {{ activeFilterCount }} active
            </UBadge>
          </div>
          <div class="flex items-center gap-2">
<UButton
                  v-if="hasActiveFilters"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
                  @click="handleCopyLink"
                >
                  {{ copied ? 'Copied!' : 'Copy link' }}
                </UButton>
            <UButton
              size="sm"
              color="primary"
              variant="ghost"
              class="transition-opacity"
              :class="hasActiveFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'"
              @click="clearAll"
            >
              Clear all
            </UButton>
          </div>
        </div>
        
        <!-- Faceted Filters Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-4">
          <div v-if="availableFrameworks.length > 0" class="space-y-2.5">
            <span class="text-sm font-medium text-muted uppercase tracking-wider">Framework</span>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="fw in availableFrameworks"
                :key="fw"
                :color="hasFramework(fw) ? (getFrameworkBySlug(fw)?.color || 'primary') : 'neutral'"
                :variant="hasFramework(fw) ? 'solid' : 'subtle'"
                size="md"
                class="cursor-pointer transition-colors"
                @click="toggleFramework(fw)"
              >
                {{ getFrameworkBySlug(fw)?.name || fw }}
              </UBadge>
            </div>
          </div>

          <div v-if="availableUseCases.length > 0" class="space-y-2.5">
            <span class="text-sm font-medium text-muted uppercase tracking-wider">Use Case</span>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="uc in availableUseCases"
                :key="uc"
                :color="hasUseCase(uc) ? 'primary' : 'neutral'"
                :variant="hasUseCase(uc) ? 'solid' : 'subtle'"
                size="md"
                class="cursor-pointer transition-colors"
                @click="toggleUseCase(uc)"
              >
                {{ formatUseCase(uc) }}
              </UBadge>
            </div>
          </div>

          <div v-if="availableLanguages.length > 0" class="space-y-2.5">
            <span class="text-sm font-medium text-muted uppercase tracking-wider">Language</span>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="lang in availableLanguages"
                :key="lang"
                :color="hasLanguage(lang) ? 'primary' : 'neutral'"
                :variant="hasLanguage(lang) ? 'solid' : 'outline'"
                size="md"
                class="cursor-pointer transition-colors"
                :icon="getLanguageIcon(lang)"
                @click="toggleLanguage(lang)"
              >
                {{ lang }}
              </UBadge>
            </div>
          </div>

          <div v-if="availableDifficulties.length > 0" class="space-y-2.5">
            <span class="text-sm font-medium text-muted uppercase tracking-wider">Difficulty</span>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="diff in availableDifficulties"
                :key="diff"
                :color="hasDifficulty(diff) ? 'primary' : 'neutral'"
                :variant="hasDifficulty(diff) ? 'solid' : 'subtle'"
                size="md"
                class="cursor-pointer transition-colors"
                @click="toggleDifficulty(diff)"
              >
                {{ formatDifficulty(diff) }}
              </UBadge>
            </div>
          </div>
        </div>

        <UCollapsible v-if="Object.keys(usedTagsByCategory).length > 0" class="mt-4">
          <button class="group flex items-center gap-2 text-muted hover:text-default transition-colors">
            <UIcon
              name="i-lucide-chevron-right"
              class="w-5 h-5 transition-transform group-data-[state=open]:rotate-90"
            />
            <span class="uppercase tracking-wider text-sm font-medium">More Tags</span>
          </button>

          <template #content>
            <div class="mt-4 ml-6 space-y-4">
              <div
                v-for="(category, key) in usedTagsByCategory"
                :key="key"
                class="flex flex-wrap items-center gap-3"
              >
                <span class="text-sm font-medium text-muted w-24 shrink-0">{{ category.label }}:</span>
                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="tag in category.tags"
                    :key="tag"
                    :color="hasTag(tag) ? 'primary' : 'neutral'"
                    :variant="hasTag(tag) ? 'solid' : 'subtle'"
                    size="md"
                    class="cursor-pointer transition-colors"
                    @click="toggleTag(tag)"
                  >
                    {{ tag }}
                  </UBadge>
                </div>
              </div>
            </div>
          </template>
        </UCollapsible>
        
        <p 
          class="mt-4 text-sm text-muted h-5 transition-opacity"
          :class="hasActiveFilters ? 'opacity-100' : 'opacity-0'"
        >
          Showing {{ filteredEvals.length }} of {{ allEvals?.length || 0 }} evals
        </p>
      </div>

      <div v-if="status === 'pending' || status === 'idle'" id="loading-state">
        <h2 class="text-3xl font-bold mb-8">Recently Added</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard v-for="i in 3" :key="i">
            <div class="space-y-4">
              <div class="flex gap-2">
                <USkeleton class="h-5 w-16 rounded-full" />
                <USkeleton class="h-5 w-20 rounded-full" />
              </div>
              <USkeleton class="h-6 w-3/4" />
              <div class="space-y-2">
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-4 w-2/3" />
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <div v-else-if="status === 'success' && recentlyAdded.length === 0" id="empty-state">
        <UEmpty
          icon="i-heroicons-beaker"
          :title="hasActiveFilters ? 'No matching evals' : 'No evals yet'"
          :description="hasActiveFilters ? 'Try removing some filters' : 'Be the first to contribute an evaluation pattern to the directory.'"
          :actions="hasActiveFilters ? [{
            label: 'Clear filters',
            icon: 'i-heroicons-x-mark',
            onClick: clearAll
          }] : [{
            label: 'Contribute an eval',
            icon: 'i-heroicons-plus',
            to: 'https://github.com/radum2o18/evals-directory',
            target: '_blank'
          }]"
        />
      </div>

      <template v-else>
        <div
          v-for="section in featuredSections"
          :id="section.id"
          :key="section.id"
          class="mb-16 last:mb-0"
        >
          <h2 class="text-3xl font-bold mb-8">
            {{ section.title }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EvalCard
              v-for="evalItem in section.items"
              :key="evalItem.path"
              :item="evalItem"
              :show-updated="section.updatedOnly"
              :is-in-comparison="isInComparison(evalItem.path)"
              :can-add-more="canAddMore"
              @toggle-comparison="toggleComparison"
              @toggle-tag="toggleTag"
            />
          </div>
        </div>
      </template>

      <div
        v-for="section in frameworkSections"
        v-show="!hasActiveFilters"
        :key="section.framework.slug"
        class="mt-16"
      >
        <div class="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-semibold">
              {{ section.framework.name }}
            </h2>
            <p class="text-sm text-muted">
              {{ section.framework.description }}
            </p>
          </div>
          <UButton
            v-if="section.firstPath"
            :to="section.firstPath"
            size="sm"
            color="neutral"
            variant="ghost"
            trailing-icon="i-heroicons-arrow-right"
          >
            View all
          </UButton>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EvalCard
            v-for="evalItem in section.evals"
            :key="evalItem.path"
            :item="evalItem"
            :is-in-comparison="isInComparison(evalItem.path)"
            :can-add-more="canAddMore"
            @toggle-comparison="toggleComparison"
            @toggle-tag="toggleTag"
          />
        </div>
      </div>
    </UContainer>

    <!-- Comparison bar -->
    <ClientOnly>
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-full"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-full"
      >
        <div
          v-if="comparisonCount > 0"
          class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div class="flex items-center gap-3 px-4 py-2.5 bg-elevated/95 backdrop-blur-md rounded-full shadow-xl border border-default">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-scale" class="w-4 h-4 text-primary" />
              <span class="text-sm font-medium">{{ comparisonCount }} selected</span>
            </div>
            <div class="w-px h-4 bg-default" />
            <div class="flex items-center gap-1">
              <UButton
                size="sm"
                color="neutral"
                variant="ghost"
                @click="clearComparison"
              >
                Clear
              </UButton>
              <UButton
                size="sm"
                color="primary"
                :disabled="!canCompare"
                @click="openCompareModal"
              >
                Compare
              </UButton>
            </div>
          </div>
        </div>
      </Transition>
    </ClientOnly>
  </UMain>
</template>
