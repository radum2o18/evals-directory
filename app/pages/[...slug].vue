<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb } from '@nuxt/content/utils'
import { mapContentNavigation } from '@nuxt/ui/utils/content'

const route = useRoute()
const { getFrameworkBySlug } = useFrameworks()
const { toggleTag, hasTag } = useTagFilter()
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

const pageTitle = computed(() => `${page.value?.title} | Evals Directory`)
const framework = computed(() => {
  const slug = route.path.split('/')[1] || ''
  return getFrameworkBySlug(slug)
})

const currentVersion = computed(() => {
  const changelog = page.value?.changelog as Array<{ version: string }> | undefined
  return changelog?.[0]?.version
})

const lastUpdated = computed(() => {
  const changelog = page.value?.changelog as Array<{ date?: string }> | undefined
  return changelog?.[0]?.date
})

const contributors = computed(() => {
  const changelog = page.value?.changelog as Array<{ author?: string }> | undefined
  const authors = new Set<string>()
  
  if (page.value?.github_username) {
    authors.add(page.value.github_username)
  }
  
  changelog?.forEach(entry => {
    if (entry.author) authors.add(entry.author)
  })
  
  return Array.from(authors).slice(0, 5)
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
        author: page.value?.github_username ? {
          '@type': 'Person',
          name: page.value.github_username,
          url: `https://github.com/${page.value.github_username}`
        } : undefined,
        datePublished: (page.value?.changelog as Array<{ date?: string }> | undefined)?.at(-1)?.date,
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
  return value.tags.filter(tag => (tag as string) !== (value.use_case as string))
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
      <div v-if="!isFrameworkIndex" class="not-prose mb-8">
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <UBadge v-if="page.use_case" color="primary" variant="solid" size="md">
            {{ page.use_case }}
          </UBadge>

          <div v-if="currentVersion" class="flex items-center gap-2 text-sm">
            <div class="flex items-center gap-1.5 text-muted">
              <UIcon name="i-heroicons-tag" class="w-3.5 h-3.5" />
              <span class="font-mono">v{{ currentVersion }}</span>
        </div>
            <UBadge color="success" variant="subtle" size="sm">
              latest
            </UBadge>
          </div>

          <div class="flex-1" />

          <div class="flex items-center gap-4 text-sm text-muted">
          <UUser
              v-if="contributors.length === 1"
              :name="contributors[0]"
              :avatar="{ src: `https://github.com/${contributors[0]}.png`, alt: contributors[0] }"
              :to="`https://github.com/${contributors[0]}`"
            target="_blank"
            size="xs"
          />

            <UAvatarGroup v-else-if="contributors.length > 1" size="xs" :max="4">
              <UTooltip v-for="author in contributors" :key="author" :text="author">
                <ULink
                  :to="`https://github.com/${author}`"
                  target="_blank"
                  class="hover:ring-primary transition"
                  raw
                >
                  <UAvatar
                    :src="`https://github.com/${author}.png`"
                    :alt="author"
                  />
                </ULink>
              </UTooltip>
            </UAvatarGroup>
            <div v-if="lastUpdated" class="flex items-center gap-1.5 opacity-70">
              <NuxtTime :datetime="lastUpdated" year="numeric" month="short" day="numeric" />
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div v-if="page.models?.length" class="flex items-center gap-2 text-muted">
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4 opacity-60" />
            <span>{{ page.models.join(', ') }}</span>
          </div>

          <div v-if="displayTags?.length" class="flex flex-wrap gap-1.5">
            <UBadge
              v-for="tag in displayTags"
              :key="tag"
              :color="hasTag(tag) ? 'primary' : 'neutral'"
              :variant="hasTag(tag) ? 'solid' : 'outline'"
              size="sm"
              class="cursor-pointer"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </UBadge>
          </div>
        </div>

        <UCollapsible v-if="page.changelog?.length" class="mt-4 pt-4 border-t border-dashed border-default">
          <button class="group flex items-center gap-2 text-sm text-muted hover:text-default transition-colors">
            <UIcon
              name="i-lucide-chevron-right"
              class="w-4 h-4 transition-transform group-data-[state=open]:rotate-90"
            />
            <span class="uppercase tracking-wider font-medium">Changelog</span>
            <UBadge color="neutral" variant="subtle" size="sm">{{ page.changelog.length }}</UBadge>
          </button>

          <template #content>
            <div class="mt-3 ml-5 space-y-3">
              <div
                v-for="(entry, index) in page.changelog"
                :key="entry.version"
                class="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm"
              >
                <span
                  class="font-mono text-xs px-1.5 py-0.5 rounded bg-elevated w-14 text-center"
                  :class="index === 0 ? 'text-highlighted' : 'text-muted'"
                >
                  v{{ entry.version }}
                </span>

                <span :class="index === 0 ? 'text-highlighted' : 'text-muted'">
                  {{ entry.changes }}
                </span>

                <div class="flex items-center justify-end gap-2 min-w-[140px]">
                  <UTooltip v-if="entry.author" :text="entry.author">
                    <ULink
                      :to="`https://github.com/${entry.author}`"
                      target="_blank"
                      raw
                    >
                      <UAvatar
                        :src="`https://github.com/${entry.author}.png`"
                        :alt="entry.author"
                        size="2xs"
                      />
                    </ULink>
                  </UTooltip>
                  <NuxtTime
                    v-if="entry.date"
                    :datetime="entry.date"
                    month="short"
                    day="numeric"
                    year="numeric"
                    class="text-xs text-muted w-[85px] text-right"
                  />
                </div>
              </div>
            </div>
          </template>
        </UCollapsible>
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
