<script setup lang="ts">
interface ChangelogEntry {
  version: string
  date: string
  changes: string
  author?: string
}

interface EvalItem {
  path: string
  title: string
  description: string
  use_case?: string
  languages?: string[]
  tags?: string[]
  author?: string
  created_at?: string
  difficulty?: string
  changelog?: ChangelogEntry[]
  models?: string[]
  metrics?: string[]
  setup_time?: string
  runtime_cost?: string
  data_requirements?: string
  eval_type?: string
}

const props = withDefaults(defineProps<{
  item: EvalItem
  showUpdated?: boolean
  showActions?: boolean
  isInComparison?: boolean
  canAddMore?: boolean
}>(), {
  showUpdated: false,
  showActions: true,
  isInComparison: false,
  canAddMore: true
})

const emit = defineEmits<{
  toggleComparison: [item: EvalItem]
  toggleTag: [tag: string]
}>()

const { getFrameworkBySlug } = useFrameworks()
const { hasTag } = useFacetedFilter()

const framework = computed(() => {
  const slug = props.item.path?.split('/')[1]
  return slug ? getFrameworkBySlug(slug) : null
})

const wasUpdated = computed(() => (props.item.changelog?.length || 0) >= 2)

const displayTags = computed(() => {
  if (!props.item.tags) return []
  const selected = props.item.tags.filter(t => hasTag(t))
  const others = props.item.tags.filter(t => !hasTag(t))
  return [...selected, ...others].slice(0, 3)
})
</script>

<template>
  <div class="relative group h-full">
  <NuxtLink :to="item.path" class="block h-full">
    <UCard
        variant="subtle"
      :ui="{
          root: 'h-full transition-all duration-200 hover:ring-2 hover:ring-primary/50',
          body: 'p-5'
      }"
    >
        <div class="flex items-center gap-2 mb-3">
            <UBadge
              v-if="framework"
              :color="framework.color"
            variant="soft"
              size="sm"
            >
              {{ framework.name }}
            </UBadge>
          <span 
            v-if="showUpdated && wasUpdated" 
            class="text-xs text-success font-medium"
          >
            Updated
          </span>
        </div>

        <h3 class="text-base font-semibold text-default leading-snug mb-2 line-clamp-2">
          {{ item.title }}
        </h3>

        <p class="text-sm text-muted leading-relaxed line-clamp-2 mb-4">
          {{ item.description }}
        </p>

        <div 
          v-if="displayTags.length" 
          class="flex flex-wrap items-center gap-x-1 text-xs text-muted"
        >
          <template v-for="(tag, idx) in displayTags" :key="tag">
            <span
              class="cursor-pointer hover:text-primary transition-colors"
              :class="{ 'text-primary font-medium': hasTag(tag) }"
              @click.prevent.stop="emit('toggleTag', tag)"
            >
              {{ tag }}
            </span>
            <span v-if="idx < displayTags.length - 1" class="text-muted/40">·</span>
          </template>
          </div>
      </UCard>
    </NuxtLink>

          <ClientOnly>
      <div
        v-if="showActions"
        class="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        :class="{ 'opacity-100!': isInComparison }"
      >
        <UTooltip
          :text="isInComparison ? 'Remove from comparison' : (canAddMore ? 'Compare' : 'Max 4 items')"
        >
          <UButton
            size="xs"
            :color="isInComparison ? 'primary' : 'neutral'"
            :variant="isInComparison ? 'solid' : 'subtle'"
            :icon="isInComparison ? 'i-heroicons-check' : 'i-heroicons-scale'"
            :disabled="!isInComparison && !canAddMore"
            square
            @click.prevent.stop="emit('toggleComparison', item)"
          />
        </UTooltip>
      </div>
    </ClientOnly>
        </div>
</template>
