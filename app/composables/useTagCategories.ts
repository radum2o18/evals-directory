// Tag categories for UI grouping (must match content.config.ts schema)
export const tagCategories = {
  metrics: {
    label: 'Metrics',
    tags: ['accuracy', 'precision', 'recall', 'f1', 'latency', 'relevance', 'coherence', 'completeness', 'correctness', 'coverage']
  },
  concerns: {
    label: 'Concerns',
    tags: ['hallucination', 'safety', 'grounding', 'context', 'memory', 'moderation']
  },
  stage: {
    label: 'Stage',
    tags: ['production', 'testing', 'benchmarking', 'streaming']
  }
} as const

export const useTagCategories = () => ({ tagCategories })
