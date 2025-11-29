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
          created_at: z.string().optional(),
          difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
          tags: z.array(z.enum([
            'accuracy', 'precision', 'recall', 'f1', 'latency', 'relevance', 'coherence', 'completeness', 'correctness', 'coverage',
            'hallucination', 'safety', 'grounding', 'context', 'memory', 'moderation',
            'production', 'testing', 'benchmarking', 'streaming'
          ])).optional()
        })
      })
    )
  }
})
