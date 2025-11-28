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

const githubUsername = computed(() => page.value?.github as string | undefined)
const { user: githubUser } = useGitHubUser(githubUsername)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const pageTitle = computed(() => `${page.value?.title} | Evals Directory`)
const framework = computed(() => {
  const slug = route.path.split('/')[1] || ''
  return getFrameworkBySlug(slug)
})

useSeoMeta({
  title: pageTitle,
  description: () => page.value?.description,
  ogTitle: pageTitle,
  ogDescription: () => page.value?.description,
  ogType: 'article',
  twitterCard: 'summary_large_image'
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: page.value?.title,
        description: page.value?.description,
        author: page.value?.github ? {
          '@type': 'Person',
          name: page.value.github,
          url: `https://github.com/${page.value.github}`
        } : undefined,
        datePublished: page.value?.created_at,
        publisher: {
          '@type': 'Organization',
          name: 'Evals Directory',
          url: 'https://evals.directory'
        }
      })
    }
  ]
})

const breadcrumb = computed(() =>
  mapContentNavigation(
    findPageBreadcrumb(navigation?.value || [], page.value?.path as string, { indexAsChild: true })
  ).map(({ icon, ...link }) => link)
)

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
  to: `https://github.com/radum2o18/evals-directory/edit/main/content${page.value?.path}.md`,
  target: '_blank'
}, {
  icon: 'i-lucide-star',
  label: 'Star on GitHub',
  to: 'https://github.com/radum2o18/evals-directory',
  target: '_blank'
}])

const isFrameworkIndex = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
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
        <div v-if="page.use_case" class="flex flex-wrap items-center gap-2">
          <span class="text-xs uppercase tracking-wide text-muted">Use case:</span>
          <UBadge color="primary" variant="subtle" size="sm">
            {{ page.use_case }}
          </UBadge>
        </div>

        <div class="flex flex-wrap items-center gap-4 text-muted">
          <div v-if="page.models" class="flex items-center gap-2">
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
            <span>{{ page.models.join(', ') }}</span>
          </div>

          <UUser
            v-if="githubUser"
            :name="githubUser.login"
            :avatar="{ src: githubUser.avatar_url, alt: githubUser.login }"
            :to="githubUser.html_url"
            target="_blank"
            size="xs"
          />

          <div v-if="page.created_at" class="flex items-center gap-2">
            <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
            <NuxtTime :datetime="page.created_at" year="numeric" month="short" day="numeric" />
          </div>
        </div>

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
