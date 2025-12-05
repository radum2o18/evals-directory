---
title: Greeting Quality
description: Evaluates chatbot greeting responses for friendliness, personalization, and context-awareness
use_case: chatbot
languages: [typescript]
models: [gpt-4, claude-sonnet-4]
github_username: radum2o18
difficulty: beginner
tags: [relevance, coherence]
created_at: 2025-11-15
changelog:
  - version: 2.0.0
    date: 2025-12-03
    changes: Added time-of-day awareness, more test cases, and tone analysis
    author: radum2o18
  - version: 1.0.0
    date: 2025-11-15
    changes: Initial greeting evaluation with basic checks
    author: radum2o18
---

# Greeting Quality

Evaluates whether chatbot greetings are friendly, contextually appropriate, and personalized when user information is available.

## Use Case

Customer service bots, onboarding flows, and conversational assistants where first impressions directly impact user engagement and satisfaction.

## Implementation

::code-collapse

```typescript
import { evalite } from "evalite";
import OpenAI from "openai";

const openai = new OpenAI();

interface GreetingInput {
  userName: string | null;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  isReturningUser: boolean;
  context?: string;
}

evalite("Greeting Quality", {
  data: async () => [
    // Personalized greetings
    {
      input: { userName: "Alex", timeOfDay: "morning", isReturningUser: false },
      expectations: { shouldPersonalize: true, shouldMatchTime: true }
    },
    {
      input: { userName: "Sarah", timeOfDay: "evening", isReturningUser: true },
      expectations: { shouldPersonalize: true, shouldMatchTime: true, shouldAcknowledgeReturn: true }
    },

    // Anonymous users
    {
      input: { userName: null, timeOfDay: "afternoon", isReturningUser: false },
      expectations: { shouldPersonalize: false, shouldMatchTime: true }
    },

    // Different times of day
    {
      input: { userName: "Jordan", timeOfDay: "night", isReturningUser: false },
      expectations: { shouldPersonalize: true, shouldMatchTime: true }
    },

    // With context
    {
      input: { userName: "Chris", timeOfDay: "morning", isReturningUser: false, context: "support" },
      expectations: { shouldPersonalize: true, shouldMentionHelp: true }
    },

    // Returning user
    {
      input: { userName: "Taylor", timeOfDay: "afternoon", isReturningUser: true },
      expectations: { shouldPersonalize: true, shouldAcknowledgeReturn: true }
    }
  ],
  task: async (input) => {
    const systemPrompt = `Generate a brief, friendly greeting for a chatbot. 
Be warm but professional. Keep it under 50 words.
${input.context === "support" ? "This is a support context - acknowledge you're here to help." : ""}`;

    const userPrompt = `Greet the user with these details:
- Name: ${input.userName || "Unknown (don't use a name)"}
- Time of day: ${input.timeOfDay}
- Returning user: ${input.isReturningUser ? "Yes, welcome them back" : "No, first visit"}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    return response.choices[0].message.content || "";
  },
  scorers: [
    // Friendly tone detection
    (output) => {
      const friendlyPatterns = /hello|hi|hey|welcome|good|greetings|glad|pleased|wonderful/i;
      const warmPhrases = /how are you|hope you|great to|nice to|happy to/i;

      const hasFriendlyWord = friendlyPatterns.test(output);
      const hasWarmPhrase = warmPhrases.test(output);

      return {
        name: "Friendly Tone",
        score: hasFriendlyWord && hasWarmPhrase ? 1 : hasFriendlyWord ? 0.7 : 0.3
      };
    },

    // Personalization (uses name when available)
    (output, { input }) => {
      if (!input.userName) {
        // Should NOT try to use a generic name
        const usesGenericName = /dear (customer|user|friend)|hi there, \w+/i.test(output);
        return {
          name: "Personalization",
          score: usesGenericName ? 0.5 : 1,
          metadata: { type: "anonymous_user" }
        };
      }

      const usesName = output.includes(input.userName);
      return {
        name: "Personalization",
        score: usesName ? 1 : 0,
        metadata: { expected_name: input.userName, found: usesName }
      };
    },

    // Time-of-day appropriateness
    (output, { input }) => {
      const timePatterns: Record<string, RegExp> = {
        morning: /good morning|this morning|start your day/i,
        afternoon: /good afternoon|this afternoon/i,
        evening: /good evening|this evening/i,
        night: /good evening|tonight|this late/i
      };

      const expectedPattern = timePatterns[input.timeOfDay];
      const matchesTime = expectedPattern.test(output);

      // Also accept generic greetings that don't contradict
      const contradicts = Object.entries(timePatterns)
        .filter(([time]) => time !== input.timeOfDay)
        .some(([_, pattern]) => pattern.test(output));

      return {
        name: "Time Appropriate",
        score: matchesTime ? 1 : contradicts ? 0 : 0.7,
        metadata: { time: input.timeOfDay, matched: matchesTime }
      };
    },

    // Returning user acknowledgment
    (output, { input }) => {
      if (!input.isReturningUser) {
        return { name: "Return Acknowledgment", score: 1 }; // N/A
      }

      const acknowledgesReturn = /welcome back|good to see you again|back again|returning/i.test(output);

      return {
        name: "Return Acknowledgment",
        score: acknowledgesReturn ? 1 : 0.5,
        metadata: { acknowledged: acknowledgesReturn }
      };
    },

    // Conciseness
    (output) => {
      const wordCount = output.split(/\s+/).length;

      return {
        name: "Concise",
        score: wordCount <= 30 ? 1 : wordCount <= 50 ? 0.7 : 0.3,
        metadata: { word_count: wordCount }
      };
    },

    // No awkward phrasing
    (output) => {
      const awkwardPatterns = [
        /as an AI/i,
        /I don't have feelings/i,
        /I'm just a/i,
        /\[.*\]/,  // Placeholder brackets
        /undefined|null/i
      ];

      const hasAwkward = awkwardPatterns.some(p => p.test(output));

      return {
        name: "Natural Phrasing",
        score: hasAwkward ? 0 : 1,
        metadata: { natural: !hasAwkward }
      };
    }
  ]
});
```

::

## Metrics Tracked

- **Friendly Tone** - Contains welcoming language and warm phrases
- **Personalization** - Uses user's name appropriately (or avoids fake names)
- **Time Appropriate** - Matches time of day context
- **Return Acknowledgment** - Welcomes back returning users
- **Concise** - Keeps greeting brief (under 30 words ideal)
- **Natural Phrasing** - Avoids robotic or awkward language

## Best Practices

1. **Personalize when possible** - Names increase engagement
2. **Match context** - Time of day, support vs. sales
3. **Keep it short** - Users want to get to their task
4. **Avoid AI self-reference** - "As an AI..." breaks immersion
5. **Test edge cases** - Anonymous users, late night, returning visitors

## Example Greetings

| Scenario | Good | Bad |
|----------|------|-----|
| Morning, known user | "Good morning, Alex! How can I help you today?" | "Hello. What do you need?" |
| Evening, returning | "Good evening, Sarah! Welcome back." | "Hi user. You have returned." |
| Anonymous user | "Hi there! What can I help you with?" | "Hello, Dear Customer!" |
