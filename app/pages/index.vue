<script setup lang="ts">
const { frameworks, getFrameworkBySlug } = useFrameworks()
const { open } = useContentSearch()

interface EvalItem {
  path: string
  title: string
  description: string
  use_case?: string
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

useSeoMeta({
  title: 'Evals Directory',
  description: 'The npm registry for AI evaluation patterns'
})
</script>

<template>
  <UMain>
    <UContainer class="py-16">
      <!-- Hero Section -->
      <div class="max-w-3xl mx-auto text-center mb-16">
        <div class="inline-flex flex-col items-stretch gap-4 mx-auto w-max">
          <h1 class="text-5xl md:text-6xl font-bold">
            <span class="font-mono">evals.directory</span>
          </h1>
          <p class="text-lg md:text-2xl text-muted">
            The npm registry for AI evaluation patterns.
          </p>
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
      </div>

      <!-- Recent Additions -->
      <div v-if="recentEvals.length" id="recent-evals">
        <h2 class="text-3xl font-bold mb-8">Recently Added</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="evalItem in recentEvals"
            :key="evalItem.path"
            :to="evalItem.path"
            class="block"
          >
            <UCard>
              <div class="flex items-center gap-2 mb-3">
                <UBadge
                  v-if="evalItem.path && getFrameworkBySlug(evalItem.path.split('/')[1] || '')"
                  :color="getFrameworkBySlug(evalItem.path.split('/')[1] || '')!.color"
                  size="xs"
                >
                  {{ getFrameworkBySlug(evalItem.path.split('/')[1] || '')!.name }}
                </UBadge>
                <UBadge v-if="evalItem.use_case" color="neutral" variant="subtle" size="xs">
                  {{ evalItem.use_case }}
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
            <UCard>
              <div class="flex items-center gap-2 mb-3">
                <UBadge
                  v-if="evalItem.path && getFrameworkBySlug(evalItem.path.split('/')[1] || '')"
                  :color="getFrameworkBySlug(evalItem.path.split('/')[1] || '')!.color"
                  size="xs"
                >
                  {{ getFrameworkBySlug(evalItem.path.split('/')[1] || '')!.name }}
                </UBadge>
                <UBadge v-if="evalItem.use_case" color="neutral" variant="subtle" size="xs">
                  {{ evalItem.use_case }}
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

