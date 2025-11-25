---
title: Latency Benchmark
description: Measures chatbot response time and streaming performance
use_case: chatbot
languages: [typescript]
models: [gpt-4, claude-sonnet-4, gemini-pro, gpt-3.5-turbo]
github: radum2o18
created_at: 2025-11-18
difficulty: beginner
tags: [chatbot, performance, latency, streaming, benchmarking]
---

# Latency Benchmark

Tracks response time metrics including time-to-first-token (TTFT), tokens-per-second, and total response time for chatbot performance optimization.

## Use Case

Critical for real-time chat applications where user experience depends on perceived responsiveness. Essential for comparing model providers and configurations.

## Implementation

::code-collapse

```typescript
import { evalite } from "evalite";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface PerformanceMetrics {
  ttft: number; // Time to first token (ms)
  totalTime: number; // Total response time (ms)
  tokenCount: number;
  tokensPerSecond: number;
}

evalite("Latency Benchmark", {
  data: async () => [
    {
      message: "Hi, how are you?",
      maxAcceptableLatency: 1000, // 1 second
      minAcceptableTPS: 20 // tokens per second
    },
    {
      message: "Explain quantum computing in simple terms.",
      maxAcceptableLatency: 2000,
      minAcceptableTPS: 15
    },
    {
      message: "Write a Python function to reverse a string.",
      maxAcceptableLatency: 2500,
      minAcceptableTPS: 15
    },
    {
      message: "What's 2+2?",
      maxAcceptableLatency: 800,
      minAcceptableTPS: 25
    },
    {
      message: "Summarize the key events of World War II in 5 bullet points.",
      maxAcceptableLatency: 3000,
      minAcceptableTPS: 15
    }
  ],
  task: async (input): Promise<PerformanceMetrics> => {
    const startTime = performance.now();
    let ttft = 0;
    let tokenCount = 0;
    let fullResponse = "";

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: input.message }]
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        if (ttft === 0) {
          ttft = performance.now() - startTime;
        }
        fullResponse += event.delta.text;
        tokenCount++;
      }
    }

    const totalTime = performance.now() - startTime;
    const tokensPerSecond = (tokenCount / totalTime) * 1000;

    return {
      ttft,
      totalTime,
      tokenCount,
      tokensPerSecond
    };
  },
  scorers: [
    // Time to First Token (TTFT) - responsiveness
    (output, { input }) => {
      const meetsTarget = output.ttft <= input.maxAcceptableLatency * 0.3; // TTFT should be < 30% of total budget

      return {
        name: "TTFT",
        score: meetsTarget ? 1 : 0,
        metadata: { ttft_ms: Math.round(output.ttft) }
      };
    },

    // Total Response Time
    (output, { input }) => {
      const meetsTarget = output.totalTime <= input.maxAcceptableLatency;

      return {
        name: "Total Latency",
        score: meetsTarget ? 1 : 0,
        metadata: { total_ms: Math.round(output.totalTime) }
      };
    },

    // Tokens Per Second (throughput)
    (output, { input }) => {
      const meetsTarget = output.tokensPerSecond >= input.minAcceptableTPS;

      return {
        name: "Throughput",
        score: meetsTarget ? 1 : 0,
        metadata: {
          tps: Math.round(output.tokensPerSecond * 10) / 10,
          tokens: output.tokenCount
        }
      };
    },

    // Performance percentile scoring
    (output, { input }) => {
      // Calculate percentile score: 100% if under 50% of budget, 0% if over budget
      const latencyRatio = output.totalTime / input.maxAcceptableLatency;
      const score = Math.max(0, Math.min(1, 2 - (latencyRatio * 2)));

      return {
        name: "Latency Percentile",
        score,
        metadata: {
          budget_usage: `${Math.round(latencyRatio * 100)}%`
        }
      };
    }
  ]
});
```

::

## Metrics Tracked

- **TTFT** (Time to First Token) - Initial responsiveness
- **Total Latency** - Complete response time
- **Throughput** (Tokens/sec) - Streaming speed
- **Latency Percentile** - Performance vs budget

## Best Practices

1. **Measure streaming** for real-time chat UX
2. **Set SLAs** based on user research (e.g., <1s for simple queries)
3. **Track P50, P95, P99** percentiles for production monitoring
4. **Test across query types** (short vs long responses)
5. **Monitor over time** to detect degradation
6. **Compare providers** to optimize cost/performance

## Performance Targets

| Query Type | TTFT Target | Total Latency | Min TPS |
|------------|-------------|---------------|---------|
| Simple Q&A | <300ms | <1s | 25+ |
| Explanations | <500ms | <2s | 15+ |
| Code Gen | <600ms | <2.5s | 15+ |
| Long-form | <800ms | <3s | 12+ |
