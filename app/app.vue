<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () =>
  queryCollectionNavigation('content')
)

const { data: rawFiles } = await useAsyncData('search', () =>
  queryCollectionSearchSections('content')
)

provide('navigation', navigation)

const searchTerm = ref('')

const files = computed(() => {
  if (!rawFiles.value) return []

  const seen = new Set<string>()

  // Deduplicate sections belonging to the same page (same id before '#')
  return (rawFiles.value as Array<{ id?: string }>).filter((file) => {
    const id = file.id
    if (!id) return false
    const key = id.split('#')[0] || id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})
</script>

<template>
  <UApp>
    <ClientOnly>
      <LazyUContentSearch
        v-model:search-term="searchTerm"
        :files="files"
        :navigation="navigation"
        shortcut="meta_k"
          :color-mode="false"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>

    <AppHeader />

    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style>
/* Page transitions - smooth fade with subtle scale */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Layout transitions - faster, minimal fade */
.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
</style>

