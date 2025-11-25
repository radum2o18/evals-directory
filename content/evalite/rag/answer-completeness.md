---
title: Answer Completeness
description: Evaluates whether RAG responses cover all aspects of the user's question
use_case: rag
languages: [typescript]
models: [gpt-4, claude-sonnet-4]
author: Radu
github: radu
created_at: 2025-01-20
difficulty: intermediate
tags: [rag, completeness, coverage, quality]
---

# Answer Completeness

Measures whether RAG system responses fully address all parts of multi-faceted questions and cover key information from retrieved context.

## Use Case

Essential for complex queries requiring comprehensive answers, such as research tools, documentation assistants, and educational applications.

## Implementation

::code-collapse

```typescript
import { evalite } from "evalite";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface RAGContext {
  source: string;
  content: string;
}

evalite("Answer Completeness", {
  data: async () => [
    {
      question: "What are the benefits and drawbacks of using TypeScript?",
      context: [
        {
          source: "doc1",
          content: "TypeScript provides static typing, which catches errors at compile time and improves IDE support with autocomplete and refactoring."
        },
        {
          source: "doc2",
          content: "TypeScript has a learning curve and requires additional build steps. The type system can be complex for advanced use cases."
        },
        {
          source: "doc3",
          content: "TypeScript improves code maintainability and makes large codebases easier to navigate and refactor safely."
        }
      ],
      requiredAspects: ["benefits", "drawbacks"],
      keyPoints: [
        "static typing",
        "error detection",
        "IDE support",
        "learning curve",
        "build steps",
        "maintainability"
      ]
    },
    {
      question: "How does React's useEffect hook work and when should I use it?",
      context: [
        {
          source: "doc1",
          content: "useEffect runs side effects after render. It takes a function and an optional dependency array."
        },
        {
          source: "doc2",
          content: "Use useEffect for data fetching, subscriptions, and manually changing the DOM. Clean up by returning a function."
        },
        {
          source: "doc3",
          content: "The dependency array controls when the effect re-runs. Empty array means run once, no array means run every render."
        }
      ],
      requiredAspects: ["how it works", "when to use"],
      keyPoints: [
        "side effects",
        "dependency array",
        "data fetching",
        "cleanup",
        "render timing"
      ]
    },
    {
      question: "What is the difference between SQL and NoSQL databases?",
      context: [
        {
          source: "doc1",
          content: "SQL databases use structured schemas with tables and relationships. They ensure ACID compliance."
        },
        {
          source: "doc2",
          content: "NoSQL databases are schema-flexible and horizontally scalable. They include document, key-value, and graph databases."
        },
        {
          source: "doc3",
          content: "SQL is better for complex queries and transactions. NoSQL handles large-scale, unstructured data better."
        }
      ],
      requiredAspects: ["SQL characteristics", "NoSQL characteristics", "differences"],
      keyPoints: [
        "schema",
        "ACID",
        "scalability",
        "flexibility",
        "use cases"
      ]
    }
  ],
  task: async (input) => {
    const contextText = input.context
      .map((c: RAGContext) => `[${c.source}] ${c.content}`)
      .join("\n\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Context:\n${contextText}\n\nQuestion: ${input.question}\n\nProvide a comprehensive answer based on the context.`
      }]
    });

    return response.content[0].type === "text"
      ? response.content[0].text
      : "";
  },
  scorers: [
    // Aspect Coverage - addresses all parts of question
    async (output, { input }) => {
      const checkPrompt = `Question has these aspects: ${input.requiredAspects.join(", ")}\n\nAnswer: "${output}"\n\nList which aspects are addressed (comma-separated):`;

      const check = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{ role: "user", content: checkPrompt }]
      });

      const response = check.content[0].type === "text" ? check.content[0].text : "";
      const addressedCount = input.requiredAspects.filter((aspect: string) =>
        response.toLowerCase().includes(aspect.toLowerCase())
      ).length;

      const coverage = addressedCount / input.requiredAspects.length;

      return {
        name: "Aspect Coverage",
        score: coverage,
        metadata: {
          addressed: `${addressedCount}/${input.requiredAspects.length}`
        }
      };
    },

    // Key Points Inclusion - mentions important facts from context
    (output, { input }) => {
      const includedPoints = input.keyPoints.filter((point: string) =>
        output.toLowerCase().includes(point.toLowerCase())
      );

      const inclusion = includedPoints.length / input.keyPoints.length;

      return {
        name: "Key Points",
        score: inclusion,
        metadata: {
          included: `${includedPoints.length}/${input.keyPoints.length}`,
          points: includedPoints
        }
      };
    },

    // Context Utilization - uses information from multiple sources
    (output, { input }) => {
      const sourcesUsed = input.context.filter((ctx: RAGContext) => {
        // Check if any content from this source appears in output
        const keywords = ctx.content.split(" ").filter(w => w.length > 5);
        return keywords.some(keyword =>
          output.toLowerCase().includes(keyword.toLowerCase())
        );
      });

      const utilization = sourcesUsed.length / input.context.length;

      return {
        name: "Context Utilization",
        score: utilization,
        metadata: {
          sources_used: `${sourcesUsed.length}/${input.context.length}`
        }
      };
    },

    // Comprehensiveness - overall completeness score
    async (output, { input }) => {
      const checkPrompt = `Question: "${input.question}"\nAnswer: "${output}"\n\nRate how completely this answer addresses the question on a scale of 0-10:`;

      const check = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 5,
        messages: [{ role: "user", content: checkPrompt }]
      });

      const rating = parseInt(check.content[0].type === "text" ? check.content[0].text : "0");

      return {
        name: "Comprehensiveness",
        score: rating / 10
      };
    },

    // Balanced - not too verbose or too terse
    (output) => {
      const wordCount = output.split(/\s+/).length;
      const isBalanced = wordCount >= 50 && wordCount <= 300;

      return {
        name: "Balanced Length",
        score: isBalanced ? 1 : 0.7,
        metadata: { word_count: wordCount }
      };
    }
  ]
});
```

::

## Metrics Tracked

- **Aspect Coverage** - Addresses all parts of multi-faceted questions
- **Key Points** - Includes important facts from context
- **Context Utilization** - Uses multiple sources effectively
- **Comprehensiveness** - Overall completeness (LLM-judged)
- **Balanced Length** - Neither too verbose nor too terse

## Best Practices

1. **Multi-aspect questions** test comprehensive coverage
2. **Golden key points** define what must be included
3. **Source tracking** ensures context utilization
4. **LLM-as-judge** for holistic completeness
5. **Length constraints** prevent over/under-generation

## Scoring Thresholds

| Metric | Excellent | Good | Needs Work |
|--------|-----------|------|------------|
| Aspect Coverage | >0.9 | >0.7 | <0.7 |
| Key Points | >0.8 | >0.6 | <0.6 |
| Context Utilization | >0.8 | >0.6 | <0.6 |
| Comprehensiveness | >0.85 | >0.7 | <0.7 |
