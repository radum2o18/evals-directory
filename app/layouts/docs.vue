<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[] | undefined>>('navigation')
const { selectedTags, toggleTag, clearTags } = useTagFilter()
const { tagCategories } = useTagCategories()

const searchTerm = ref('')

const route = useRoute()
const input = useTemplateRef('navFilter')

defineShortcuts({
  '/': {
    usingInput: true,
    handler: () => {
      if (!route.path) return
      input.value?.inputRef?.focus()
    }
  }
})

const { data: allEvals } = await useAsyncData(
  'all-evals-docs',
  async () => {
    const items = await queryCollection('content').select('path', 'tags').all()
    return items.filter((item) => !!item.path)
  },
  { default: () => [] }
)

const usedTags = computed(() => {
  if (!allEvals.value) return []
  const tags = new Set<string>()
  allEvals.value.forEach((item) => {
    item.tags?.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags).sort()
})

const tagItems = computed(() => {
  return Object.entries(tagCategories).flatMap(([, category]) => {
    const categoryTags = category.tags.filter(tag => usedTags.value.includes(tag))
    if (categoryTags.length === 0) return []
    
    return [
      { type: 'label' as const, label: category.label },
      ...categoryTags.map(tag => ({ label: tag, value: tag }))
    ]
  })
})

const matchingPaths = computed(() => {
  if (!allEvals.value || selectedTags.value.length === 0) return null
  
  const paths = new Set<string>()
  allEvals.value.forEach((item) => {
    if (selectedTags.value.every(tag => (item.tags as string[] | undefined)?.includes(tag))) {
      paths.add(item.path)
    }
  })
  return paths
})

const filteredNavigation = computed(() => {
  if (!navigation?.value) {
    return []
  }

  const term = searchTerm.value.trim().toLowerCase()
  let items = navigation.value

  if (!term && !matchingPaths.value) {
    const aboutIndex = items.findIndex(item => 
      item.path === '/about' || item.title?.toLowerCase() === 'about'
    )
    if (aboutIndex !== -1) {
      const aboutItem = items[aboutIndex]
      if (aboutItem) {
        items = [...items.filter((_, i) => i !== aboutIndex), aboutItem]
      }
    }
  }

  const matchesText = (item: ContentNavigationItem) => {
    const title = String(item.title || '').toLowerCase()
    const description = String(item.description || '').toLowerCase()
    return title.includes(term) || description.includes(term)
  }

  const matchesTag = (item: ContentNavigationItem) => {
    if (!matchingPaths.value) return true
    return matchingPaths.value.has(item.path || '')
  }

  const filterTree = (items: ContentNavigationItem[]): ContentNavigationItem[] =>
    items
      .map((item) => {
        const children = item.children ? filterTree(item.children as ContentNavigationItem[]) : []
        const textMatch = !term || matchesText(item)
        const tagMatch = matchesTag(item)
        
        if ((textMatch && tagMatch) || children.length) {
          return { ...item, children }
        }
        return null
      })
      .filter(Boolean) as ContentNavigationItem[]

  const filtered = filterTree(items)

  if (term || matchingPaths.value) {
    const aboutIndex = filtered.findIndex(item => 
      item.path === '/about' || item.title?.toLowerCase() === 'about'
    )
    if (aboutIndex !== -1) {
      const aboutItem = filtered[aboutIndex]
      if (aboutItem) {
        return [...filtered.filter((_, i) => i !== aboutIndex), aboutItem]
      }
    }
  }

  return filtered
})

const handleTagSelect = (tags: string[]) => {
  clearTags()
  tags.forEach(tag => toggleTag(tag))
}
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <div class="space-y-3 mb-3">
            <UInput
              ref="navFilter"
              v-model="searchTerm"
              variant="soft"
              placeholder="Filter..."
              class="group"
            >
              <template #trailing>
                <UKbd value="/" variant="subtle" class="ring-muted bg-transparent text-muted" />
              </template>
            </UInput>
            
            <!-- Tag Filter Dropdown -->
            <USelectMenu
              :model-value="selectedTags as any"
              :items="tagItems as any"
              placeholder="Filter by tags..."
              multiple
              icon="i-heroicons-tag"
              size="sm"
              variant="soft"
              class="w-full"
              value-key="value"
              :ui="{
                label: 'text-highlighted font-semibold',
                item: 'text-muted'
              }"
              @update:model-value="handleTagSelect"
            >
              <template #trailing>
                <UIcon
                  v-if="selectedTags.length > 0"
                  name="i-heroicons-x-circle"
                  class="w-4 h-4 text-muted hover:text-highlighted cursor-pointer"
                  @click.stop="clearTags"
                />
              </template>
              <template #empty>
                <span class="text-muted text-sm">No tags found</span>
              </template>
            </USelectMenu>
            
            <!-- Filter active indicator -->
            <p 
              class="text-xs text-muted h-4 transition-opacity"
              :class="selectedTags.length > 0 ? 'opacity-100' : 'opacity-0'"
            >
              {{ matchingPaths?.size || 0 }} matching evals
            </p>
          </div>
          
          <UContentNavigation
            :navigation="filteredNavigation"
            highlight
          />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
