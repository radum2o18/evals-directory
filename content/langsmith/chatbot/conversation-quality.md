---
title: Conversation Quality with Memory
description: Evaluate multi-turn conversations with context tracking and memory
use_case: chatbot
languages: [typescript, python]
models: [gpt-4, claude-sonnet-4]
author: Radu
github: radu
created_at: 2025-01-20
difficulty: intermediate
tags: [langchain, chatbot, conversation, memory, langsmith]
---

# Conversation Quality with Memory

Evaluates multi-turn conversational agents built with LangChain, testing context retention, coherence across turns, and appropriate use of conversation history.

## Use Case

Essential for chatbots and assistants that maintain context across multiple exchanges. Tests memory integration and conversation flow quality.

## Implementation

### TypeScript

::code-collapse

```typescript
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { Client } from "langsmith";
import { evaluate } from "langsmith/evaluation";

const client = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
});

// Create conversational agent with memory
function createConversationAgent() {
  const llm = new ChatAnthropic({
    model: "claude-sonnet-4-20250514",
    temperature: 0.7,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant. Remember context from previous messages and provide coherent, contextually aware responses."],
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]);

  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: "history",
  });

  const chain = new ConversationChain({
    llm,
    prompt,
    memory,
  });

  return chain;
}

// Define conversation scenarios
const conversationDataset = await client.createDataset("conversation-scenarios", {
  description: "Multi-turn conversation examples"
});

const scenarios = [
  {
    turns: [
      { input: "I'm planning a trip to Paris", expected_context: ["paris", "trip"] },
      { input: "What's the weather like there?", expected_context: ["paris", "weather"], requires_memory: true },
      { input: "Should I pack an umbrella?", expected_context: ["weather", "paris"], requires_memory: true }
    ]
  },
  {
    turns: [
      { input: "I have a meeting at 3pm", expected_context: ["meeting", "3pm"] },
      { input: "Can you remind me 15 minutes before?", expected_context: ["reminder", "3pm"], requires_memory: true },
      { input: "Actually, make it 30 minutes", expected_context: ["reminder", "update"], requires_memory: true }
    ]
  }
];

// Add to dataset
for (const scenario of scenarios) {
  await client.createExample(
    { turns: scenario.turns },
    { scenario_type: "multi_turn" },
    { datasetId: conversationDataset.id }
  );
}

// Evaluators
function contextRetention(run: any, example: any) {
  const turns = example.inputs.turns;
  const responses = run.outputs?.responses || [];

  let score = 0;
  let totalMemoryTurns = 0;

  turns.forEach((turn: any, i: number) => {
    if (turn.requires_memory && i > 0) {
      totalMemoryTurns++;
      const response = responses[i]?.toLowerCase() || "";

      // Check if response references previous context
      const previousContexts = turns.slice(0, i).flatMap((t: any) => t.expected_context);
      const referencesContext = previousContexts.some((ctx: string) =>
        response.includes(ctx.toLowerCase())
      );

      if (referencesContext) score++;
    }
  });

  return {
    key: "context_retention",
    score: totalMemoryTurns > 0 ? score / totalMemoryTurns : 1,
  };
}

function coherenceAcrossTurns(run: any, example: any) {
  const responses = run.outputs?.responses || [];

  if (responses.length < 2) return { key: "coherence", score: 1 };

  // Check that responses don't contradict each other
  let contradictions = 0;

  for (let i = 1; i < responses.length; i++) {
    const current = responses[i].toLowerCase();
    const previous = responses[i - 1].toLowerCase();

    // Simple contradiction detection
    if (
      (previous.includes("yes") && current.includes("no, actually")) ||
      (previous.includes("no") && current.includes("yes, actually"))
    ) {
      contradictions++;
    }
  }

  const score = 1 - (contradictions / (responses.length - 1));

  return {
    key: "coherence",
    score,
  };
}

function appropriateMemoryUse(run: any, example: any) {
  const turns = example.inputs.turns;
  const responses = run.outputs?.responses || [];

  let appropriateUses = 0;
  let memoryTurns = 0;

  turns.forEach((turn: any, i: number) => {
    if (turn.requires_memory) {
      memoryTurns++;
      const response = responses[i]?.toLowerCase() || "";

      // Should NOT ask for information already provided
      const asksForKnownInfo = turn.expected_context.some((ctx: string) =>
        response.includes(`what ${ctx}`) || response.includes(`which ${ctx}`)
      );

      if (!asksForKnownInfo) appropriateUses++;
    }
  });

  return {
    key: "appropriate_memory_use",
    score: memoryTurns > 0 ? appropriateUses / memoryTurns : 1,
  };
}

// Run conversation evaluation
const evalResults = await evaluate(
  async (input: { turns: any[] }) => {
    const chain = createConversationAgent();
    const responses = [];

    for (const turn of input.turns) {
      const result = await chain.invoke({ input: turn.input });
      responses.push(result.response);
    }

    return { responses };
  },
  {
    data: conversationDataset.name,
    evaluators: [contextRetention, coherenceAcrossTurns, appropriateMemoryUse],
    experimentPrefix: "conversation-eval",
    metadata: {
      model: "claude-sonnet-4",
      memory_type: "buffer",
    },
  }
);

console.log("Conversation Evaluation:", evalResults);
```

::

### Python

::code-collapse

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langsmith import Client
from langsmith.evaluation import evaluate
import os

client = Client(api_key=os.getenv("LANGSMITH_API_KEY"))

# Create conversational agent with memory
def create_conversation_agent():
    llm = ChatAnthropic(
        model="claude-sonnet-4-20250514",
        temperature=0.7
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant. Remember context from previous messages and provide coherent, contextually aware responses."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}")
    ])

    memory = ConversationBufferMemory(
        return_messages=True,
        memory_key="history"
    )

    chain = ConversationChain(
        llm=llm,
        prompt=prompt,
        memory=memory
    )

    return chain

# Define conversation scenarios
conversation_dataset = client.create_dataset(
    "conversation-scenarios",
    description="Multi-turn conversation examples"
)

scenarios = [
    {
        "turns": [
            {"input": "I'm planning a trip to Paris", "expected_context": ["paris", "trip"]},
            {"input": "What's the weather like there?", "expected_context": ["paris", "weather"], "requires_memory": True},
            {"input": "Should I pack an umbrella?", "expected_context": ["weather", "paris"], "requires_memory": True}
        ]
    },
    {
        "turns": [
            {"input": "I have a meeting at 3pm", "expected_context": ["meeting", "3pm"]},
            {"input": "Can you remind me 15 minutes before?", "expected_context": ["reminder", "3pm"], "requires_memory": True},
            {"input": "Actually, make it 30 minutes", "expected_context": ["reminder", "update"], "requires_memory": True}
        ]
    }
]

# Add to dataset
for scenario in scenarios:
    client.create_example(
        inputs={"turns": scenario["turns"]},
        outputs={"scenario_type": "multi_turn"},
        dataset_id=conversation_dataset.id
    )

# Evaluators
def context_retention(run, example):
    """Check if agent uses information from previous turns."""
    turns = example.inputs["turns"]
    responses = run.outputs.get("responses", [])

    score = 0
    total_memory_turns = 0

    for i, turn in enumerate(turns):
        if turn.get("requires_memory") and i > 0:
            total_memory_turns += 1
            response = responses[i].lower() if i < len(responses) else ""

            # Check if response references previous context
            previous_contexts = []
            for prev_turn in turns[:i]:
                previous_contexts.extend(prev_turn.get("expected_context", []))

            references_context = any(
                ctx.lower() in response
                for ctx in previous_contexts
            )

            if references_context:
                score += 1

    final_score = score / total_memory_turns if total_memory_turns > 0 else 1.0

    return {
        "key": "context_retention",
        "score": final_score
    }

def coherence_across_turns(run, example):
    """Check that responses don't contradict each other."""
    responses = run.outputs.get("responses", [])

    if len(responses) < 2:
        return {"key": "coherence", "score": 1.0}

    contradictions = 0

    for i in range(1, len(responses)):
        current = responses[i].lower()
        previous = responses[i - 1].lower()

        # Simple contradiction detection
        if (("yes" in previous and "no, actually" in current) or
            ("no" in previous and "yes, actually" in current)):
            contradictions += 1

    score = 1.0 - (contradictions / (len(responses) - 1))

    return {"key": "coherence", "score": score}

def appropriate_memory_use(run, example):
    """Check that agent doesn't re-ask for known information."""
    turns = example.inputs["turns"]
    responses = run.outputs.get("responses", [])

    appropriate_uses = 0
    memory_turns = 0

    for i, turn in enumerate(turns):
        if turn.get("requires_memory"):
            memory_turns += 1
            response = responses[i].lower() if i < len(responses) else ""

            # Should NOT ask for information already provided
            asks_for_known_info = any(
                f"what {ctx}" in response or f"which {ctx}" in response
                for ctx in turn.get("expected_context", [])
            )

            if not asks_for_known_info:
                appropriate_uses += 1

    final_score = appropriate_uses / memory_turns if memory_turns > 0 else 1.0

    return {
        "key": "appropriate_memory_use",
        "score": final_score
    }

# Run conversation evaluation
def predict(inputs):
    """Run multi-turn conversation and collect responses."""
    chain = create_conversation_agent()
    responses = []

    for turn in inputs["turns"]:
        result = chain.invoke({"input": turn["input"]})
        responses.append(result["response"])

    return {"responses": responses}

eval_results = evaluate(
    predict,
    data=conversation_dataset.name,
    evaluators=[context_retention, coherence_across_turns, appropriate_memory_use],
    experiment_prefix="conversation-eval",
    metadata={
        "model": "claude-sonnet-4",
        "memory_type": "buffer"
    }
)

print("Conversation Evaluation:", eval_results)
```

::

## Metrics Tracked

- **Context Retention** - Uses information from previous turns
- **Coherence Across Turns** - No contradictions between responses
- **Appropriate Memory Use** - Doesn't re-ask for known information
- **Turn-by-Turn Tracing** - See full conversation flow in LangSmith

## LangSmith Advantages

1. **Conversation Tracing** - See full multi-turn context
2. **Memory Inspection** - View what's stored in memory
3. **Turn-Level Metrics** - Metrics per conversation turn
4. **Prompt Versioning** - A/B test system prompts
5. **Production Debugging** - Debug real user conversations

## Best Practices

1. **Test memory limits** - Verify behavior with long conversations
2. **Edge cases** - Topic switches, clarifications, corrections
3. **Context windows** - Monitor token usage across turns
4. **Memory strategies** - Compare BufferMemory vs SummaryMemory
5. **Production monitoring** - Track conversation quality in real-time

## Example Scenario

```typescript
// Scenario: Travel planning
const scenario = [
  { user: "I'm going to Tokyo", assistant: "Great! When are you planning to visit?" },
  { user: "In March", assistant: "March is beautiful in Tokyo for cherry blossoms..." },
  { user: "What about hotels?", assistant: "For your March trip to Tokyo, I recommend..." }
  // ✅ Remembers: Tokyo, March
  // ❌ Would fail if asked "Which city?" again
];
```
