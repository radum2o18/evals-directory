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
          author: z.string().optional(),
          github: z.string().optional(),
          created_at: z.string().optional(),
          difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
          tags: z.array(z.string()).optional()
        })
      })
    )
  }
})

