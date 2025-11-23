<script setup lang="ts">
import type { NavigationMenuItem, ContentNavigationItem } from '@nuxt/ui'

const route = useRoute()
const navigation = inject<Ref<ContentNavigationItem[] | undefined>>('navigation')

const showSearch = computed(() => route.path !== '/')

// Convert Nuxt Content navigation to NavigationMenu items
const navItems = computed<NavigationMenuItem[]>(() => {
  if (!navigation?.value) return []

  return navigation.value.map((item) => ({
    label: item.title || '',
    to: item.path || '',
    icon: item.icon,
    active: route.path.startsWith(item.path || ''),
    children: item.children?.map((child: ContentNavigationItem) => ({
      label: child.title || '',
      to: child.path || '',
      icon: child.icon,
      active: route.path === child.path
    }))
  }))
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

    <UNavigationMenu v-if="navItems.length" :items="navItems" />

    <template #right>
      <UTooltip v-if="showSearch" text="Search" :kbds="['meta', 'K']">
        <UContentSearchButton />
      </UTooltip>

      <UTooltip text="Submit an eval">
        <UButton
          to="https://github.com/yourusername/evals-directory"
          target="_blank"
          icon="i-heroicons-plus"
          color="neutral"
          variant="ghost"
        />
      </UTooltip>

      <UColorModeButton />
       <UButton
        to="https://github.com/yourusername/evals-directory"
        target="_blank"
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
      />
    </template>

    <template #body>
      <UNavigationMenu
        v-if="navItems.length"
        :items="navItems"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>


