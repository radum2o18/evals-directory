<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

// Inject the content navigation from app.vue
const navigation = inject<Ref<ContentNavigationItem[] | undefined>>('navigation')

const processedNavigation = computed(() => {
  if (!navigation?.value) return []
  
  const items = [...navigation.value]
  const aboutIndex = items.findIndex(item => 
    item.path === '/about' || item.title?.toLowerCase() === 'about'
  )
  
  if (aboutIndex !== -1) {
    const aboutItem = items[aboutIndex]
    if (aboutItem) {
      return [...items.filter((_, i) => i !== aboutIndex), aboutItem]
    }
  }
  
  return items
})
</script>

<template>
  <UHeader title="evals.directory">
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-2">
        <UIcon name="i-heroicons-beaker" class="w-6 h-6" />
        <span class="font-bold text-xl font-mono">evals.directory</span>
      </NuxtLink>
    </template>

    <template #default />

    <template #right>
      <UTooltip text="Search" :kbds="['meta', 'K']">
        <UContentSearchButton />
      </UTooltip>

      <UTooltip text="Submit an eval">
        <UButton
          to="https://github.com/radum2o18/evals-directory"
          target="_blank"
          icon="i-heroicons-plus"
          color="neutral"
          variant="ghost"
          aria-label="Submit an eval"
        />
      </UTooltip>

      <UColorModeButton />

      <UButton
        to="https://github.com/radum2o18/evals-directory"
        target="_blank"
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        aria-label="GitHub"
      />
    </template>

    <template #body>
      <UContentNavigation
        :navigation="processedNavigation"
        highlight
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>

