---
title: RAG Hallucination Detection
description: Tests if RAG responses stick to provided context without hallucinating
use_case: rag
languages: [typescript]
models: [gpt-4, claude-sonnet-4, gemini-pro]
author: Radu
github: radu
created_at: 2025-01-15
difficulty: intermediate
tags: [rag, hallucination, context, accuracy]
---

# RAG Hallucination Detection

This evaluation tests whether your RAG system stays faithful to the provided context or invents information not present in the source material.

## Use Case

When building RAG applications, one of the most critical failures is **hallucination** - when the model generates plausible-sounding but incorrect information that isn't supported by your retrieved documents.

## How It Works

1. Provides context with specific facts
2. Asks questions that require those facts
3. Checks if the answer contains only information from context
4. Flags any hallucinated content

## Implementation

```typescript
import { evalite } from "evalite";

evalite("RAG Hallucination Detection", {
  data: async () => [
    {
      input: {
        context: "The Eiffel Tower was completed in 1889 for the World's Fair.",
        question: "When was the Eiffel Tower built?"
      },
      expected: "1889"
    },
    {
      input: {
        context: "Python was created by Guido van Rossum in 1991.",
        question: "Who created Python?"
      },
      expected: "Guido van Rossum"
    },
    {
      input: {
        context: "The company has 500 employees across 3 offices.",
        question: "What's the company's revenue?"
      },
      expected: null // Should refuse to answer
    }
  ],
  task: async (input) => {
    // Your RAG implementation
    const response = await yourRAGSystem(input.context, input.question);
    return response;
  },
  scorers: [
    (output, { input, expected }) => {
      if (expected === null) {
        // Should decline to answer
        const declined = output.toLowerCase().includes("don't know") ||
                        output.toLowerCase().includes("not mentioned") ||
                        output.toLowerCase().includes("no information");
        return {
          name: "Refuses Unknown",
          score: declined ? 1 : 0
        };
      }
      
      // Should contain expected info
      const hasExpected = output.includes(expected);
      return {
        name: "Has Expected Info",
        score: hasExpected ? 1 : 0
      };
    }
  ]
});
```

## Variations

- **Strict mode**: Penalize ANY deviation from context
- **Soft mode**: Allow reasonable inferences
- **Citation checking**: Require sources for all claims

## Related Patterns

- Context Relevance - Check if context is actually relevant
- Answer Accuracy - Verify factual correctness

