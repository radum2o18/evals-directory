<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[] | undefined>>('navigation')

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

const filteredNavigation = computed(() => {
  if (!navigation?.value) {
    return []
  }

  const term = searchTerm.value.trim().toLowerCase()
  let items = navigation.value

  // Move "about" to the bottom when not filtering
  if (!term) {
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

  const matches = (item: ContentNavigationItem) => {
    const title = String(item.title || '').toLowerCase()
    const description = String(item.description || '').toLowerCase()
    return title.includes(term) || description.includes(term)
  }

  const filterTree = (items: ContentNavigationItem[]): ContentNavigationItem[] =>
    items
      .map((item) => {
        const children = item.children ? filterTree(item.children as ContentNavigationItem[]) : []
        if (matches(item) || children.length) {
          return { ...item, children }
        }
        return null
      })
      .filter(Boolean) as ContentNavigationItem[]

  const filtered = filterTree(items)
  
  // Move "about" to the bottom when filtering
  if (term) {
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
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <div class="mb-3">
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
          </div>
          <UContentNavigation
            v-if="filteredNavigation.length"
            :navigation="filteredNavigation"
            highlight
          />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>