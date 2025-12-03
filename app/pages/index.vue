<script setup lang="ts">
const { frameworks, getFrameworkBySlug } = useFrameworks()
const { open } = useContentSearch()
const { selectedTags, toggleTag, clearTags, hasTag } = useTagFilter()
const { tagCategories } = useTagCategories()

interface ChangelogEntry {
  version: string
  date: string
  changes: string
  author?: string
}

interface EvalItem {
  path: string
  title: string
  description: string
  use_case?: string
  languages?: string[]
  tags?: string[]
  author?: string
  changelog?: ChangelogEntry[]
}

const getLastUpdated = (item: EvalItem): number => {
  const date = item.changelog?.[0]?.date
  return date ? new Date(date).getTime() : 0
}

const wasUpdated = (item: EvalItem): boolean => {
  return (item.changelog?.length || 0) >= 2
}

const { data: allEvals } = await useAsyncData<EvalItem[]>(
  'all-evals',
  () => queryCollection('content').all() as Promise<EvalItem[]>,
  { default: () => [] }
)

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

const filteredEvals = computed(() => {
  if (!allEvals.value) return []
  if (selectedTags.value.length === 0) return allEvals.value
  
  return allEvals.value.filter((item) =>
    selectedTags.value.every((tag) => item.tags?.includes(tag))
  )
})

const recentEvals = computed(() => {
  if (!filteredEvals.value) return []

  const sorted = [...filteredEvals.value]
    .sort((a, b) => getLastUpdated(b) - getLastUpdated(a))
  
  return selectedTags.value.length > 0 ? sorted : sorted.slice(0, 6)
})

const frameworkSections = computed(() => {
  if (!filteredEvals.value) return []

  return Object.values(frameworks).map((framework) => {
    const evals = filteredEvals.value!
      .filter((item) => item.path?.startsWith(`/${framework.slug}/`))
      .sort((a, b) => getLastUpdated(b) - getLastUpdated(a))
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

const getLanguageIcon = (lang: string) => {
  const icons: Record<string, string> = {
    typescript: 'i-simple-icons-typescript',
    python: 'i-simple-icons-python',
    yaml: 'i-heroicons-code-bracket'
  }
  return icons[lang.toLowerCase()] || 'i-heroicons-code-bracket'
}

const getDisplayTags = (tags: string[] | undefined, limit = 3) => {
  if (!tags) return []
  
  // Put selected tags first, then others
  const selected = tags.filter(t => hasTag(t))
  const others = tags.filter(t => !hasTag(t))
  
  return [...selected, ...others].slice(0, limit)
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
      <!-- Tag Filter Section -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <UIcon name="i-heroicons-funnel" class="w-4 h-4 text-muted" />
          <span class="text-sm text-muted">Filter by tag</span>
          <UButton
            size="xs"
            color="primary"
            variant="link"
            class="transition-opacity"
            :class="selectedTags.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            @click="clearTags"
          >
            Clear all
          </UButton>
        </div>
        
        <!-- Grouped tags by category -->
        <div class="space-y-3">
          <div
            v-for="(category, key) in usedTagsByCategory"
            :key="key"
            class="flex flex-wrap items-center gap-2"
          >
            <span class="text-xs font-medium text-muted w-20 shrink-0">{{ category.label }}:</span>
            <div class="flex flex-wrap gap-1.5">
              <UBadge
                v-for="tag in category.tags"
                :key="tag"
                :color="hasTag(tag) ? 'primary' : 'neutral'"
                :variant="hasTag(tag) ? 'solid' : 'subtle'"
                size="sm"
                class="cursor-pointer transition-colors"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </UBadge>
            </div>
          </div>
        </div>
        
        <p 
          class="mt-4 text-sm text-muted h-5 transition-opacity"
          :class="selectedTags.length > 0 ? 'opacity-100' : 'opacity-0'"
        >
          Showing {{ filteredEvals.length }} of {{ allEvals?.length || 0 }} evals
        </p>
      </div>

      <div v-if="!allEvals" id="loading-state">
        <h2 class="text-3xl font-bold mb-8">Recently Added</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard v-for="i in 6" :key="i">
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

      <div v-else-if="allEvals && recentEvals.length === 0" id="empty-state">
        <UEmpty
          icon="i-heroicons-beaker"
          :title="selectedTags.length > 0 ? 'No matching evals' : 'No evals yet'"
          :description="selectedTags.length > 0 ? 'Try removing some filters' : 'Be the first to contribute an evaluation pattern to the directory.'"
          :actions="selectedTags.length > 0 ? [{
            label: 'Clear filters',
            icon: 'i-heroicons-x-mark',
            onClick: clearTags
          }] : [{
            label: 'Contribute',
            icon: 'i-heroicons-plus',
            to: 'https://github.com/radum2o18/evals-directory',
            target: '_blank'
          }]"
        />
      </div>

      <div v-else-if="recentEvals.length" id="recent-evals">
        <h2 class="text-3xl font-bold mb-8">
          {{ selectedTags.length > 0 ? 'Filtered Results' : 'Recently Added' }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="evalItem in recentEvals"
            :key="evalItem.path"
            :to="evalItem.path"
            class="block"
          >
            <UCard :ui="{ root: 'h-full transition-all duration-200 hover:bg-accented hover:ring-2 hover:ring-primary' }">
              <div class="flex items-center gap-2 mb-4 flex-wrap">
                <UBadge
                  v-if="evalItem.path && getFrameworkBySlug(evalItem.path.split('/')[1] || '')"
                  :color="getFrameworkBySlug(evalItem.path.split('/')[1] || '')!.color"
                  size="sm"
                >
                  {{ getFrameworkBySlug(evalItem.path.split('/')[1] || '')!.name }}
                </UBadge>
                <UBadge
                  v-if="evalItem.use_case"
                  color="neutral"
                  variant="soft"
                  size="sm"
                >
                  {{ evalItem.use_case }}
                </UBadge>
                <UBadge
                  v-for="lang in evalItem.languages"
                  :key="lang"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  :icon="getLanguageIcon(lang)"
                >
                  {{ lang }}
                </UBadge>
              </div>
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-lg font-semibold">{{ evalItem.title }}</h3>
                <UBadge v-if="wasUpdated(evalItem)" color="info" variant="subtle" size="sm">
                  updated
                </UBadge>
              </div>
              <p class="text-sm text-muted line-clamp-2 mb-3">{{ evalItem.description }}</p>
              
              <div v-if="evalItem.tags?.length" class="flex flex-wrap gap-1.5">
                <UBadge
                  v-for="tag in getDisplayTags(evalItem.tags)"
                  :key="tag"
                  :color="hasTag(tag) ? 'primary' : 'neutral'"
                  :variant="hasTag(tag) ? 'subtle' : 'outline'"
                  size="xs"
                  class="cursor-pointer"
                  @click.prevent.stop="toggleTag(tag)"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </div>

      <div
        v-for="section in frameworkSections"
        v-show="selectedTags.length === 0"
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
          <NuxtLink
            v-for="evalItem in section.evals"
            :key="evalItem.path"
            :to="evalItem.path"
            class="block"
          >
            <UCard :ui="{ root: 'h-full transition-all duration-200 hover:bg-accented hover:ring-2 hover:ring-primary' }">
              <div class="flex items-center gap-2 mb-4 flex-wrap">
                <UBadge
                  :color="section.framework.color"
                  size="sm"
                >
                  {{ section.framework.name }}
                </UBadge>
                <UBadge
                  v-if="evalItem.use_case"
                  color="neutral"
                  variant="soft"
                  size="sm"
                >
                  {{ evalItem.use_case }}
                </UBadge>
                <UBadge
                  v-for="lang in evalItem.languages"
                  :key="lang"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  :icon="getLanguageIcon(lang)"
                >
                  {{ lang }}
                </UBadge>
              </div>
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-lg font-semibold">{{ evalItem.title }}</h3>
                <UBadge v-if="wasUpdated(evalItem)" color="info" variant="subtle" size="sm">
                  updated
                </UBadge>
              </div>
              <p class="text-sm text-muted line-clamp-2 mb-3">{{ evalItem.description }}</p>
              
              <div v-if="evalItem.tags?.length" class="flex flex-wrap gap-1.5">
                <UBadge
                  v-for="tag in getDisplayTags(evalItem.tags)"
                  :key="tag"
                  :color="hasTag(tag) ? 'primary' : 'neutral'"
                  :variant="hasTag(tag) ? 'subtle' : 'outline'"
                  size="xs"
                  class="cursor-pointer"
                  @click.prevent.stop="toggleTag(tag)"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </div>
    </UContainer>
  </UMain>
</template>
