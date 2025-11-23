---
title: Response Quality
description: Evaluates chatbot response helpfulness, coherence, and user satisfaction
use_case: chatbot
languages: [typescript]
models: [gpt-4, claude-sonnet-4, gemini-pro]
author: Radu
github: radu
created_at: 2025-01-20
difficulty: intermediate
tags: [chatbot, quality, helpfulness, coherence]
---

# Response Quality

Comprehensive evaluation of chatbot response quality across multiple dimensions: helpfulness, coherence, relevance, and completeness.

## Use Case

Essential for any customer-facing chatbot where user experience and satisfaction are critical business metrics.

## Implementation

```typescript
import { evalite } from "evalite";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

evalite("Response Quality", {
  data: async () => [
    {
      conversation: [],
      userMessage: "I can't log into my account",
      expectedTopics: ["password reset", "account verification", "troubleshooting"],
      shouldBeHelpful: true,
      shouldAskClarifying: true
    },
    {
      conversation: [
        { role: "user", content: "What's the weather like?" },
        { role: "assistant", content: "I don't have access to weather data." }
      ],
      userMessage: "Can you check for me?",
      expectedTopics: ["limitation", "alternative"],
      shouldBeHelpful: true,
      shouldProvideAlternative: true
    },
    {
      conversation: [],
      userMessage: "How do I export my data?",
      expectedTopics: ["export", "data", "steps", "format"],
      shouldBeHelpful: true,
      shouldProvideSteps: true
    }
  ],
  task: async (input) => {
    const messages = [
      ...input.conversation,
      { role: "user" as const, content: input.userMessage }
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: "You are a helpful customer support assistant. Be concise, clear, and actionable.",
      messages
    });

    return response.content[0].type === "text"
      ? response.content[0].text
      : "";
  },
  scorers: [
    // Relevance - addresses user's question
    async (output, { input }) => {
      const relevanceCheck = `User asked: "${input.userMessage}"\n\nAssistant response: "${output}"\n\nDoes the response directly address the user's question? Rate 0-10.`;

      const check = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 5,
        messages: [{ role: "user", content: relevanceCheck }]
      });

      const rating = parseInt(check.content[0].type === "text" ? check.content[0].text : "0");

      return {
        name: "Relevance",
        score: rating / 10,
      };
    },

    // Helpfulness - provides actionable information
    async (output, { input }) => {
      if (!input.shouldBeHelpful) return { name: "Helpfulness", score: 1 };

      const hasActionableInfo =
        output.length > 50 && // Not too terse
        (output.includes("?") || // Asks clarifying questions
         /\d+\.|step|first|then|next/i.test(output) || // Provides steps
         /try|can|should|would/i.test(output)); // Gives suggestions

      return {
        name: "Helpfulness",
        score: hasActionableInfo ? 1 : 0.5,
      };
    },

    // Coherence - well-structured and clear
    async (output) => {
      const coherenceCheck = `Rate the clarity and coherence of this response on a scale of 0-10:\n\n"${output}"`;

      const check = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 5,
        messages: [{ role: "user", content: coherenceCheck }]
      });

      const rating = parseInt(check.content[0].type === "text" ? check.content[0].text : "0");

      return {
        name: "Coherence",
        score: rating / 10,
      };
    },

    // Completeness - covers expected topics
    async (output, { input }) => {
      const topicsCovered = input.expectedTopics.filter(topic =>
        output.toLowerCase().includes(topic.toLowerCase())
      );

      const completeness = topicsCovered.length / input.expectedTopics.length;

      return {
        name: "Completeness",
        score: completeness,
      };
    },

    // Asks clarifying questions when appropriate
    async (output, { input }) => {
      if (!input.shouldAskClarifying) return { name: "Clarifying Questions", score: 1 };

      const asksQuestions = output.includes("?");

      return {
        name: "Clarifying Questions",
        score: asksQuestions ? 1 : 0,
      };
    },

    // Provides alternatives when can't help directly
    async (output, { input }) => {
      if (!input.shouldProvideAlternative) return { name: "Provides Alternatives", score: 1 };

      const providesAlternative = /instead|alternatively|you (can|could|might)|try/i.test(output);

      return {
        name: "Provides Alternatives",
        score: providesAlternative ? 1 : 0,
      };
    },

    // Provides step-by-step guidance
    async (output, { input }) => {
      if (!input.shouldProvideSteps) return { name: "Step-by-Step", score: 1 };

      const hasSteps = /\d+\.|step \d+|first.*then|1\)|•/i.test(output);

      return {
        name: "Step-by-Step",
        score: hasSteps ? 1 : 0,
      };
    }
  ]
});
```

## Metrics Tracked

- **Relevance** (0-1) - Response addresses user's question
- **Helpfulness** (0-1) - Provides actionable information
- **Coherence** (0-1) - Clear and well-structured
- **Completeness** (0-1) - Covers all expected topics
- **Clarifying Questions** (0-1) - Asks for more info when needed
- **Provides Alternatives** (0-1) - Offers alternatives when can't help directly
- **Step-by-Step** (0-1) - Provides structured guidance

## Best Practices

1. **Multi-dimensional scoring** captures different quality aspects
2. **LLM-as-judge** for subjective metrics (relevance, coherence)
3. **Heuristics** for objective patterns (questions, steps, length)
4. **Context-aware evaluation** uses conversation history
5. **Weighted aggregation** combine scores based on business priorities
