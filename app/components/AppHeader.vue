<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { frameworks } = useFrameworks()

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Frameworks',
    icon: 'i-heroicons-cube',
    active: route.path !== '/' && route.path !== '/about' && !route.path.startsWith('/about'),
    children: Object.values(frameworks).map((fw) => ({
      label: fw.name,
      description: fw.description,
      to: `/${fw.slug}`,
      icon: fw.icon
    }))
  },
  {
    label: 'About',
    to: '/about',
    icon: 'i-heroicons-information-circle',
    active: route.path === '/about'
  }
])

const mobileNavItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Frameworks',
    icon: 'i-heroicons-cube',
    defaultOpen: true,
    children: Object.values(frameworks).map((fw) => ({
      label: fw.name,
      to: `/${fw.slug}`,
      icon: fw.icon
    }))
  },
  {
    label: 'About',
    to: '/about',
    icon: 'i-heroicons-information-circle'
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

    <UNavigationMenu
      v-if="navItems.length"
      :items="navItems"
      arrow
      content-orientation="vertical"
    />

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
      <UNavigationMenu
        v-if="mobileNavItems.length"
        :items="mobileNavItems"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>

