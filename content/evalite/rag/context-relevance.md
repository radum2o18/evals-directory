---
title: Context Relevance
description: Evaluates whether retrieved context chunks are relevant to the query
use_case: rag
languages: [typescript]
models: [gpt-4, claude-sonnet-4]
author: Radu
github: radu
created_at: 2025-01-20
difficulty: beginner
tags: [rag, relevance, retrieval, precision, context]
---

# Context Relevance

Measures the relevance of retrieved context chunks to the user's query, ensuring retrieval precision and minimizing irrelevant information.

## Use Case

Critical for RAG efficiency and answer quality. Irrelevant context wastes tokens, increases latency, and can introduce noise that degrades answer quality.

## Implementation

::code-collapse

```typescript
import { evalite } from "evalite";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ContextChunk {
  id: string;
  content: string;
  similarity: number;
}

// Simulated retrieval function
async function retrieveContext(query: string): Promise<ContextChunk[]> {
  // In production, this would call your vector DB
  const mockDatabase = [
    {
      id: "chunk1",
      content: "React is a JavaScript library for building user interfaces, developed by Facebook.",
      similarity: 0.92
    },
    {
      id: "chunk2",
      content: "Vue.js is a progressive framework for building web applications with an approachable learning curve.",
      similarity: 0.85
    },
    {
      id: "chunk3",
      content: "Python is widely used for data science, machine learning, and web development.",
      similarity: 0.45
    },
    {
      id: "chunk4",
      content: "React uses a virtual DOM to efficiently update the user interface.",
      similarity: 0.88
    },
    {
      id: "chunk5",
      content: "The weather in San Francisco is typically mild year-round.",
      similarity: 0.12
    }
  ];

  return mockDatabase
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

evalite("Context Relevance", {
  data: async () => [
    {
      query: "What is React and how does it work?",
      minRelevanceScore: 0.7,
      expectedRelevantChunks: 3 // Out of 5 retrieved
    },
    {
      query: "Tell me about Python for machine learning",
      minRelevanceScore: 0.6,
      expectedRelevantChunks: 2
    },
    {
      query: "How do I build a web app?",
      minRelevanceScore: 0.5,
      expectedRelevantChunks: 4
    },
    {
      query: "What are the best JavaScript frameworks?",
      minRelevanceScore: 0.7,
      expectedRelevantChunks: 3
    }
  ],
  task: async (input) => {
    return await retrieveContext(input.query);
  },
  scorers: [
    // Relevance Rate - % of chunks that are relevant
    async (output, { input }) => {
      let relevantCount = 0;

      for (const chunk of output) {
        const checkPrompt = `Query: "${input.query}"\n\nContext: "${chunk.content}"\n\nIs this context relevant to answering the query? Answer only "yes" or "no".`;

        const check = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 5,
          messages: [{ role: "user", content: checkPrompt }]
        });

        const isRelevant = check.content[0].type === "text"
          && check.content[0].text.toLowerCase().includes("yes");

        if (isRelevant) relevantCount++;
      }

      const relevanceRate = relevantCount / output.length;

      return {
        name: "Relevance Rate",
        score: relevanceRate,
        metadata: {
          relevant: `${relevantCount}/${output.length}`
        }
      };
    },

    // Similarity Threshold - chunks meet minimum similarity
    (output, { input }) => {
      const aboveThreshold = output.filter((chunk: ContextChunk) =>
        chunk.similarity >= input.minRelevanceScore
      );

      const score = aboveThreshold.length / output.length;

      return {
        name: "Similarity Threshold",
        score,
        metadata: {
          above_threshold: `${aboveThreshold.length}/${output.length}`,
          threshold: input.minRelevanceScore
        }
      };
    },

    // Noise Ratio - inverse of irrelevant chunks
    async (output, { input }) => {
      let irrelevantCount = 0;

      for (const chunk of output) {
        const checkPrompt = `Query: "${input.query}"\n\nContext: "${chunk.content}"\n\nIs this context relevant? Answer "yes" or "no".`;

        const check = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 5,
          messages: [{ role: "user", content: checkPrompt }]
        });

        const isRelevant = check.content[0].type === "text"
          && check.content[0].text.toLowerCase().includes("yes");

        if (!isRelevant) irrelevantCount++;
      }

      const noiseRatio = 1 - (irrelevantCount / output.length);

      return {
        name: "Noise Ratio",
        score: noiseRatio,
        metadata: {
          irrelevant: irrelevantCount
        }
      };
    },

    // Expected Relevant Count - meets target number
    async (output, { input }) => {
      let relevantCount = 0;

      for (const chunk of output) {
        const checkPrompt = `Query: "${input.query}"\n\nContext: "${chunk.content}"\n\nRelevant? yes/no`;

        const check = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 5,
          messages: [{ role: "user", content: checkPrompt }]
        });

        const isRelevant = check.content[0].type === "text"
          && check.content[0].text.toLowerCase().includes("yes");

        if (isRelevant) relevantCount++;
      }

      const meetsTarget = relevantCount >= input.expectedRelevantChunks;

      return {
        name: "Meets Target Count",
        score: meetsTarget ? 1 : relevantCount / input.expectedRelevantChunks,
        metadata: {
          found: relevantCount,
          target: input.expectedRelevantChunks
        }
      };
    },

    // Top Result Quality - first result is highly relevant
    async (output, { input }) => {
      if (output.length === 0) return { name: "Top Result", score: 0 };

      const topChunk = output[0];
      const checkPrompt = `Query: "${input.query}"\n\nTop result: "${topChunk.content}"\n\nRate relevance 0-10:`;

      const check = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 5,
        messages: [{ role: "user", content: checkPrompt }]
      });

      const rating = parseInt(check.content[0].type === "text" ? check.content[0].text : "0");

      return {
        name: "Top Result Quality",
        score: rating / 10,
        metadata: {
          similarity: topChunk.similarity
        }
      };
    }
  ]
});
```

::

## Metrics Tracked

- **Relevance Rate** - % of retrieved chunks that are relevant
- **Similarity Threshold** - Chunks meeting minimum similarity score
- **Noise Ratio** - Inverse measure of irrelevant content
- **Meets Target Count** - Achieves expected relevant chunks
- **Top Result Quality** - First result relevance (most important)

## Best Practices

1. **LLM-as-judge** for semantic relevance (not just similarity)
2. **Tune similarity thresholds** based on your embedding model
3. **Monitor noise** to optimize token usage and latency
4. **Test edge cases** with ambiguous or multi-intent queries
5. **Track over time** as your document corpus grows

## Performance Targets

| Metric | Target | Why |
|--------|--------|-----|
| Relevance Rate | >80% | Minimize irrelevant context |
| Similarity Threshold | >70% | Ensure quality floor |
| Noise Ratio | >85% | Reduce token waste |
| Top Result | >0.9 | Most important for answer quality |

## Optimization Tips

- **Hybrid search** (vector + keyword) improves precision
- **Reranking** with cross-encoder after initial retrieval
- **Query expansion** for better semantic matching
- **Chunk overlap** prevents context splitting
- **Metadata filtering** pre-filters by document type/date
