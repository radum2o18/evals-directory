import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        exclude: ['**/index.md'] // homepage separate from evals
      },
      schema: z.object({
        title: z.string(),
        description: z.string(),
        use_case: z.enum(['rag', 'chatbot', 'code-gen', 'classification', 'other']),
        models: z.array(z.string()).optional(),
        author: z.string(),
        github: z.string().optional(),
        created_at: z.string(), // YYYY-MM-DD
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        tags: z.array(z.string()).optional()
      })
    })
  }
})

