import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'

export default defineContentConfig({
  collections: {
    content: defineCollection(
      asSitemapCollection({
        type: 'page',
        source: {
          include: '**/*.md'
        },
        schema: z.object({
          title: z.string(),
          description: z.string(),
          use_case: z.enum(['rag', 'chatbot', 'code-gen', 'classification', 'prompt-engineering', 'experimentation', 'other']).optional(),
          languages: z.array(z.enum(['typescript', 'python', 'yaml'])).optional(),
          models: z.array(z.string()).optional(),
          github_username: z.string().optional(),
          difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
          tags: z.array(z.enum([
            'accuracy', 'precision', 'recall', 'f1', 'latency', 'relevance', 'coherence', 'completeness', 'correctness', 'coverage',
            'hallucination', 'safety', 'grounding', 'context', 'memory', 'moderation',
            'production', 'testing', 'benchmarking', 'streaming'
          ])).optional(),
          created_at: z.string().optional(),
          changelog: z.array(z.object({
            version: z.string(),
            date: z.string(),
            changes: z.string(),
            author: z.string().optional()
          })).optional(),
          metrics: z.array(z.string()).optional(),
          setup_time: z.enum(['5min', '15min', '30min', '1hr', '2hr+']).optional(),
          runtime_cost: z.enum(['free', 'low', 'medium', 'high']).optional(),
          data_requirements: z.enum(['none', 'sample', 'dataset', 'custom']).optional(),
          eval_type: z.enum(['unit', 'integration', 'benchmark', 'regression', 'ab-test']).optional()
        })
      })
    )
  }
})
