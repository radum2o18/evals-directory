<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { frameworks } = useFrameworks()

const showSearch = computed(() => route.path !== '/')

// Custom navigation items
const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Frameworks',
    icon: 'i-heroicons-cube',
    active: route.path !== '/' && route.path !== '/about' && !route.path.startsWith('/about'),
    children: Object.values(frameworks).map((fw) => ({
      label: fw.name,
      to: `/${fw.slug}`,
      icon: fw.icon,
      active: route.path.startsWith(`/${fw.slug}`)
    }))
  },
  {
    label: 'About',
    to: '/about',
    icon: 'i-heroicons-information-circle',
    active: route.path === '/about'
  }
])
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


