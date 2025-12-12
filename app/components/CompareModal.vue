<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const {
  comparisonItems,
  isCompareModalOpen
} = useComparison()
const { getFrameworkBySlug } = useFrameworks()

const fieldDefs = [
  { key: 'use_case', label: 'Use Case' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'languages', label: 'Languages' },
  { key: 'models', label: 'Models' },
  { key: 'setup_time', label: 'Setup Time' },
  { key: 'runtime_cost', label: 'Runtime Cost' },
  { key: 'eval_type', label: 'Eval Type' },
  { key: 'data_requirements', label: 'Data Required' },
  { key: 'metrics', label: 'Metrics' },
  { key: 'tags', label: 'Tags' }
] as const

type FieldKey = typeof fieldDefs[number]['key']

interface ComparisonRow {
  field: FieldKey
  label: string
  values: Record<string, unknown>
}

const formatValue = (key: FieldKey, value: unknown): string => {
  if (value === undefined || value === null) return '—'

  if (key === 'use_case') {
    const labels: Record<string, string> = {
      'rag': 'RAG',
      'chatbot': 'Chatbot',
      'code-gen': 'Code Gen',
      'classification': 'Classification',
      'prompt-engineering': 'Prompt Engineering',
      'experimentation': 'Experimentation',
      'other': 'Other'
    }
    return labels[value as string] || (value as string)
  }

  if (key === 'difficulty') {
    return (value as string).charAt(0).toUpperCase() + (value as string).slice(1)
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '—'
  }

  return String(value)
}

const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case 'beginner': return 'success'
    case 'intermediate': return 'warning'
    case 'advanced': return 'error'
    default: return 'neutral'
  }
}

const getRuntimeCostColor = (cost?: string) => {
  switch (cost) {
    case 'free': return 'success'
    case 'low': return 'info'
    case 'medium': return 'warning'
    case 'high': return 'error'
    default: return 'neutral'
  }
}

const tableData = computed<ComparisonRow[]>(() => {
  const items = comparisonItems.value
  if (!items.length) return []

  const getFieldValue = (item: typeof items[0], key: FieldKey): unknown => {
    return item[key as keyof typeof item]
  }

  return fieldDefs
    .filter(field => {
      return items.some(item => {
        const val = getFieldValue(item, field.key)
        if (Array.isArray(val)) return val.length > 0
        return val !== undefined && val !== null && val !== ''
      })
    })
    .map(field => ({
      field: field.key,
      label: field.label,
      values: items.reduce((acc, item) => {
        acc[item.path] = getFieldValue(item, field.key)
        return acc
      }, {} as Record<string, unknown>)
    }))
})

const columns = computed<TableColumn<ComparisonRow>[]>(() => {
  const items = comparisonItems.value

  const cols: TableColumn<ComparisonRow>[] = [
    {
      accessorKey: 'label',
      header: 'Field',
      meta: {
        class: {
          th: 'w-36 text-muted font-medium',
          td: 'text-muted font-medium'
        }
      }
    }
  ]

  items.forEach(item => {
    const framework = getFrameworkBySlug(item.path.split('/')[1] || '')

    cols.push({
      id: item.path,
      header: () => h('div', { class: 'min-w-[240px] max-w-[280px]' }, [
        framework && h(resolveComponent('UBadge'), {
          color: framework.color,
          size: 'sm',
          class: 'mb-1.5'
        }, () => framework.name),
        h('a', {
          href: item.path,
          class: 'block font-semibold text-base hover:text-primary transition-colors break-words'
        }, item.title),
        h('p', { class: 'text-sm text-muted line-clamp-3 mt-1 break-words' }, item.description)
      ]),
      cell: ({ row }) => {
        const value = row.original.values[item.path]
        const field = row.original.field

        if (field === 'difficulty' && value) {
          return h(resolveComponent('UBadge'), {
            color: getDifficultyColor(value as string),
            variant: 'subtle',
            size: 'md'
          }, () => formatValue(field, value))
        }

        if (field === 'runtime_cost' && value) {
          return h(resolveComponent('UBadge'), {
            color: getRuntimeCostColor(value as string),
            variant: 'subtle',
            size: 'md'
          }, () => formatValue(field, value))
        }

        if (field === 'tags' && Array.isArray(value) && value.length > 0) {
          return h('div', { class: 'flex flex-wrap gap-1.5' }, [
            ...value.slice(0, 4).map(tag =>
              h(resolveComponent('UBadge'), {
                key: tag,
                color: 'neutral',
                variant: 'outline',
                size: 'md'
              }, () => tag)
            ),
            value.length > 4 && h('span', { class: 'text-sm text-muted' }, `+${value.length - 4}`)
          ])
        }

        return h('span', {
          class: ['text-sm break-words', !value || (Array.isArray(value) && value.length === 0) ? 'text-muted' : ''].filter(Boolean).join(' ')
        }, formatValue(field, value))
      }
    })
  })

  return cols
})
</script>

<template>
  <UModal
    v-model:open="isCompareModalOpen"
    :ui="{ content: 'sm:max-w-7xl', footer: 'justify-end' }"
    :title="`Compare Evals (${comparisonItems.length})`"
    description="Side-by-side comparison of selected evaluation patterns"
  >
    <template #body>
      <div class="overflow-x-auto">
        <UTable
          :data="tableData"
          :columns="columns"
          :ui="{
            th: 'py-3 px-4 text-left align-top text-sm',
            td: 'py-3 px-4 align-top break-words'
          }"
        />
      </div>
    </template>

    <template #footer="{ close }">
      <UButton
        color="neutral"
        variant="outline"
        @click="close"
      >
        Close
      </UButton>
    </template>
  </UModal>
</template>
