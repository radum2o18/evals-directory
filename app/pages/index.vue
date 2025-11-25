<script setup lang="ts">
const { frameworks, getFrameworkBySlug } = useFrameworks()
const { open } = useContentSearch()

interface EvalItem {
  path: string
  title: string
  description: string
  use_case?: string
  languages?: string[]
  author?: string
  created_at?: string
}

// Fetch all evals
const { data: allEvals } = await useAsyncData<EvalItem[]>(
  'all-evals',
  async () => {
    const items = await queryCollection('content').all() as unknown as EvalItem[]
    return items.filter((item) => !!item.path)
  },
  { default: () => [] }
)

const heroQuery = ref('')

// Recent evals
const recentEvals = computed(() => {
  if (!allEvals.value) return []

  return [...allEvals.value]
    .sort((a: EvalItem, b: EvalItem) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 6)
})

const frameworkSections = computed(() => {
  if (!allEvals.value) return []

  return Object.values(frameworks).map((framework) => {
    const evals = allEvals.value!
      .filter((item) => item.path?.startsWith(`/${framework.slug}/`))
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
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
  // useContentSearch exposes `open` as a ref controlling visibility
  // setting it to true opens the command palette
  ;(open as Ref<boolean>).value = true
}

// Helper to get language icon
const getLanguageIcon = (lang: string) => {
  const icons: Record<string, string> = {
    typescript: 'i-simple-icons-typescript',
    python: 'i-simple-icons-python',
    yaml: 'i-heroicons-code-bracket'
  }
  return icons[lang.toLowerCase()] || 'i-heroicons-code-bracket'
}

useSeoMeta({
  title: 'Evals Directory - Find the Perfect AI Evaluation Pattern',
  description: 'Discover and explore AI evaluation patterns across multiple frameworks. Search through a curated collection of evals for RAG, chatbots, code generation, and more.',
  ogTitle: 'Evals Directory',
  ogDescription: 'Discover and explore AI evaluation patterns across multiple frameworks.',
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

// OG Image for homepage
defineOgImage({
  component: 'OgImageDefault',
  props: {
    title: 'Evals Directory',
    description: 'Find the perfect evaluation pattern for your AI application'
  }
})

// JSON-LD Structured Data
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
            v-model="heroQuery"
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

      <!-- Loading State -->
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

      <!-- Empty State -->
      <div v-else-if="allEvals && recentEvals.length === 0" id="empty-state">
        <UEmpty
          icon="i-heroicons-beaker"
          title="No evals yet"
          description="Be the first to contribute an evaluation pattern to the directory."
          :actions="[{
            label: 'Contribute',
            icon: 'i-heroicons-plus',
            to: 'https://github.com/radum2o18/evals-directory',
            target: '_blank'
          }]"
        />
      </div>

      <!-- Recent Additions -->
      <div v-else-if="recentEvals.length" id="recent-evals">
        <h2 class="text-3xl font-bold mb-8">Recently Added</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="evalItem in recentEvals"
            :key="evalItem.path"
            :to="evalItem.path"
            class="block"
          >
            <UCard :ui="{ root: 'transition-all duration-200 hover:bg-accented hover:ring-2 hover:ring-primary' }">
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
              <h3 class="text-lg font-semibold mb-2">{{ evalItem.title }}</h3>
              <p class="text-sm text-muted line-clamp-2">{{ evalItem.description }}</p>
            </UCard>
          </NuxtLink>
        </div>
      </div>

      <!-- Framework Sections -->
      <div
        v-for="section in frameworkSections"
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
            <UCard :ui="{ root: 'transition-all duration-200 hover:bg-accented hover:ring-2 hover:ring-primary' }">
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
              <h3 class="text-lg font-semibold mb-2">{{ evalItem.title }}</h3>
              <p class="text-sm text-muted line-clamp-2">{{ evalItem.description }}</p>
            </UCard>
          </NuxtLink>
        </div>
      </div>
    </UContainer>
  </UMain>
</template>

