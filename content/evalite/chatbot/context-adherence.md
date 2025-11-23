---
title: Context Adherence
description: Ensures chatbot responses stay within provided context and don't hallucinate
use_case: chatbot
languages: [typescript]
models: [gpt-4, claude-sonnet-4, gemini-pro]
author: Radu
github: radu
created_at: 2025-01-20
difficulty: intermediate
tags: [chatbot, context, hallucination, grounding]
---

# Context Adherence

Validates that chatbot responses are grounded in provided context and don't introduce information not present in the source material.

## Use Case

Critical for customer support bots, documentation assistants, or any chatbot working with a knowledge base where accuracy is paramount.

## Implementation

```typescript
import { evalite } from "evalite";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

evalite("Context Adherence", {
  data: async () => [
    {
      context: "Our return policy allows returns within 30 days of purchase with original receipt.",
      question: "What is your return policy?",
      expectedGrounding: true
    },
    {
      context: "Our return policy allows returns within 30 days of purchase with original receipt.",
      question: "Can I return items after 60 days?",
      expectedGrounding: true,
      shouldNotMention: ["60 days", "extended"]
    },
    {
      context: "Product X costs $99. Product Y costs $149.",
      question: "How much does Product Z cost?",
      expectedGrounding: false,
      shouldAdmitUnknown: true
    },
    {
      context: "Our office hours are Monday-Friday, 9am-5pm EST.",
      question: "Are you open on weekends?",
      expectedGrounding: true,
      shouldClarify: "not open on weekends"
    }
  ],
  task: async (input) => {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Context: ${input.context}\n\nQuestion: ${input.question}\n\nAnswer based ONLY on the context provided. If the information isn't in the context, say so.`
      }]
    });

    return response.content[0].type === "text"
      ? response.content[0].text
      : "";
  },
  scorers: [
    // Check if response is grounded in context
    async (output, { input }) => {
      const checkPrompt = `Context: ${input.context}\n\nResponse: ${output}\n\nDoes this response contain ONLY information from the context? Answer with just "yes" or "no".`;

      const check = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 10,
        messages: [{ role: "user", content: checkPrompt }]
      });

      const isGrounded = check.content[0].type === "text"
        && check.content[0].text.toLowerCase().includes("yes");

      return {
        name: "Grounded in Context",
        score: isGrounded === input.expectedGrounding ? 1 : 0,
      };
    },

    // Check for hallucinated information
    async (output, { input }) => {
      if (!input.shouldNotMention) return { name: "No Hallucinations", score: 1 };

      const hasHallucination = input.shouldNotMention.some(phrase =>
        output.toLowerCase().includes(phrase.toLowerCase())
      );

      return {
        name: "No Hallucinations",
        score: hasHallucination ? 0 : 1,
      };
    },

    // Check if bot admits when it doesn't know
    async (output, { input }) => {
      if (!input.shouldAdmitUnknown) return { name: "Admits Unknown", score: 1 };

      const admitsUnknown = /don't (know|have)|not (mentioned|provided|available)|cannot (find|provide)/i.test(output);

      return {
        name: "Admits Unknown",
        score: admitsUnknown ? 1 : 0,
      };
    },

    // Check if response contains expected clarification
    async (output, { input }) => {
      if (!input.shouldClarify) return { name: "Provides Clarification", score: 1 };

      const hasClarification = output.toLowerCase().includes(input.shouldClarify.toLowerCase());

      return {
        name: "Provides Clarification",
        score: hasClarification ? 1 : 0,
      };
    }
  ]
});
```

## Metrics Tracked

- **Grounded in Context** - Response only uses provided information
- **No Hallucinations** - Doesn't introduce facts not in context
- **Admits Unknown** - Explicitly states when information is unavailable
- **Provides Clarification** - Gives helpful clarifications based on context

## Best Practices

1. **Use LLM-as-Judge** for complex grounding checks
2. **Explicit instructions** in prompts to stay within context
3. **Test edge cases** where information is partially available
4. **Validate negative cases** where bot should admit ignorance
