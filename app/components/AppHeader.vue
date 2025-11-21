<script setup lang="ts">
const route = useRoute()

const showSearch = computed(() => route.path !== '/')
</script>

<template>
  <UHeader title="evals.directory">
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-2">
        <UIcon name="i-heroicons-beaker" class="w-6 h-6" />
        <span class="font-bold text-xl font-mono">evals.directory</span>
      </NuxtLink>
    </template>

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
  </UHeader>
</template>


