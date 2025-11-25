<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  framework?: string
  useCase?: string
}>()
</script>

<template>
  <div class="flex h-full w-full flex-col justify-between bg-neutral-950 p-16 text-white">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="text-4xl">🧪</div>
        <span class="font-mono text-2xl font-bold tracking-tight text-neutral-200">evals.directory</span>
      </div>
      <div v-if="framework" class="rounded-full bg-emerald-500/20 px-4 py-2 text-lg font-medium text-emerald-400">
        {{ framework }}
      </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-col gap-6">
      <h1 class="text-6xl font-bold leading-tight tracking-tight text-white">
        {{ title || 'Evals Directory' }}
      </h1>
      <p v-if="description" class="line-clamp-2 text-2xl leading-relaxed text-neutral-400">
        {{ description }}
      </p>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <div v-if="useCase" class="rounded-lg bg-neutral-800 px-4 py-2 text-lg text-neutral-300">
        {{ useCase }}
      </div>
      <p class="text-lg text-neutral-500">
        Find the perfect evaluation pattern
      </p>
    </div>
  </div>
</template>

