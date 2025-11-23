<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb } from '@nuxt/content/utils'
import { mapContentNavigation } from '@nuxt/ui/utils/content'

const route = useRoute()
const { getFrameworkBySlug } = useFrameworks()
const navigation = inject<Ref<ContentNavigationItem[] | undefined>>('navigation')

definePageMeta({
  layout: 'docs'
})

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('content').path(route.path).first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const breadcrumb = computed(() =>
  mapContentNavigation(
    findPageBreadcrumb(navigation?.value || [], page.value?.path as string, { indexAsChild: true })
  ).map(({ icon, ...link }) => link)
)

const framework = computed(() => {
  const slug = route.path.split('/')[1] || ''
  return getFrameworkBySlug(slug)
})

const displayTags = computed(() => {
  const value = page.value
  if (!value?.tags || !Array.isArray(value.tags)) return []
  return value.tags.filter(tag => tag !== value.use_case)
})

const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
  queryCollectionItemSurroundings('content', route.path)
)

const communityLinks = computed(() => [{
  icon: 'i-lucide-file-pen',
  label: 'Edit this page',
  to: `https://github.com/yourusername/evals-directory/edit/main/content${page.value?.path}.md`,
  target: '_blank'
}, {
  icon: 'i-lucide-star',
  label: 'Star on GitHub',
  to: 'https://github.com/yourusername/evals-directory',
  target: '_blank'
}])

const isFrameworkIndex = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  // Check if this is a framework index page (e.g., /braintrust, /evalite)
  return pathSegments.length === 1 && framework.value !== undefined
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader :title="page.title">
      <template #headline>
        <UBreadcrumb :items="breadcrumb" />
      </template>

      <template #description>
        <MDC v-if="page.description" :value="page.description" unwrap="p" />
      </template>
    </UPageHeader>

    <UPageBody>
      <div v-if="!isFrameworkIndex" class="not-prose mb-6 text-sm space-y-3">
        <!-- Use case -->
        <div v-if="page.use_case" class="flex flex-wrap items-center gap-2">
          <span class="text-xs uppercase tracking-wide text-muted">Use case:</span>
          <UBadge color="primary" variant="subtle" size="sm">
            {{ page.use_case }}
          </UBadge>
        </div>

        <!-- Meta row -->
        <div class="flex flex-wrap items-center gap-4 text-muted">
          <div v-if="page.models" class="flex items-center gap-2">
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
            <span>{{ page.models.join(', ') }}</span>
          </div>
          <div v-if="page.author" class="flex items-center gap-2">
            <UIcon name="i-heroicons-user" class="w-4 h-4" />
            <span>{{ page.author }}</span>
          </div>
          <div v-if="page.created_at" class="flex items-center gap-2">
            <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
            <span>{{ new Date(page.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}</span>
          </div>
        </div>

        <!-- Tags row -->
        <div v-if="displayTags.length" class="flex flex-wrap items-center gap-2">
          <span class="text-xs uppercase tracking-wide text-muted">Tags:</span>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="tag in displayTags"
              :key="tag"
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ tag }}
            </UBadge>
          </div>
        </div>
      </div>

      <ContentRenderer v-if="page.body" :value="page" />

      <USeparator v-if="surround?.filter(Boolean).length" />

      <UContentSurround :surround="surround as any" />
    </UPageBody>

    <template v-if="page?.body?.toc?.links?.length" #right>
      <UContentToc :links="page.body.toc.links">
        <template #bottom>
          <USeparator type="dashed" />
          <UPageLinks title="Community" :links="communityLinks" />
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>


