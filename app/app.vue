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
    <!-- Skip to content link for accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:outline-none"
    >
      Skip to content
    </a>

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
    
    <UMain id="main-content">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <AppFooter />

    <BackToTop />
  </UApp>
</template>

<style>
/* Page transitions - reduced to 100ms for better INP */
.page-enter-active,
.page-leave-active {
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.page-leave-to {
  opacity: 0;
}

/* Layout transitions - fast fade */
.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
</style>

