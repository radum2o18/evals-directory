---
title: RAG Experiment Tracking
description: Track and compare RAG experiments with automatic versioning and metrics
use_case: rag
languages: [typescript, python]
models: [gpt-4, claude-sonnet-4]
github_username: radum2o18
created_at: 2025-11-19
difficulty: intermediate
tags: [benchmarking, accuracy]
---

# RAG Experiment Tracking

Track RAG system experiments with Braintrust's automatic versioning, dataset management, and side-by-side comparison of embedding models, chunk sizes, and retrieval strategies.

## Use Case

Essential for optimizing RAG systems. Compare different configurations (embedding models, chunk sizes, top-k values) to find the best setup for your use case.

## Implementation

### TypeScript

::code-collapse

```typescript
import { Eval } from "braintrust";
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Simulated retrieval function
async function retrieveContext(
  query: string,
  config: { embeddingModel: string; topK: number; chunkSize: number }
) {
  // In production, this would use your actual vector DB
  const mockDocs = [
    "Braintrust provides experiment tracking and dataset versioning for AI applications.",
    "Compare prompts, models, and configurations side-by-side with automatic logging.",
    "Enterprise features include CI/CD integration, custom scorers, and production monitoring."
  ];

  return mockDocs.slice(0, config.topK);
}

// Baseline configuration
const baselineConfig = {
  embeddingModel: "text-embedding-3-small",
  topK: 3,
  chunkSize: 512,
  llm: "gpt-4"
};

// Experiment variations
const experiments = [
  {
    name: "baseline",
    config: baselineConfig
  },
  {
    name: "larger-chunks",
    config: { ...baselineConfig, chunkSize: 1024 }
  },
  {
    name: "more-context",
    config: { ...baselineConfig, topK: 5 }
  },
  {
    name: "claude-llm",
    config: { ...baselineConfig, llm: "claude-sonnet-4" }
  }
];

// Run experiments
for (const experiment of experiments) {
  await Eval("RAG Optimization", {
    experimentName: experiment.name,
    data: async () => [
      {
        question: "What is Braintrust?",
        expected: "experiment tracking platform"
      },
      {
        question: "What features does Braintrust provide?",
        expected: "experiment tracking, dataset versioning, comparison"
      },
      {
        question: "Does Braintrust support CI/CD?",
        expected: "yes"
      }
    ],
    task: async (input) => {
      const context = await retrieveContext(input.question, experiment.config);
      const contextText = context.join("\n\n");

      if (experiment.config.llm === "claude-sonnet-4") {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: `Context:\n${contextText}\n\nQuestion: ${input.question}\n\nAnswer based on the context:`
          }]
        });

        return {
          answer: response.content[0].type === "text" ? response.content[0].text : "",
          context,
          config: experiment.config
        };
      } else {
        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{
            role: "system",
            content: `Answer based on this context:\n${contextText}`
          }, {
            role: "user",
            content: input.question
          }]
        });

        return {
          answer: response.choices[0].message.content || "",
          context,
          config: experiment.config
        };
      }
    },
    scores: [
      // Answer quality
      async (output, expected) => {
        const answer = output.answer.toLowerCase();
        const expectedText = expected.expected.toLowerCase();

        const containsExpected = expectedText.split(" ").some(word =>
          word.length > 3 && answer.includes(word)
        );

        return {
          name: "Answer Quality",
          score: containsExpected ? 1 : 0
        };
      },

      // Context usage
      (output) => {
        const contextUsed = output.context.some(doc =>
          output.answer.toLowerCase().includes(
            doc.toLowerCase().split(" ").slice(0, 3).join(" ")
          )
        );

        return {
          name: "Context Usage",
          score: contextUsed ? 1 : 0
        };
      },

      // Conciseness (prefer shorter, focused answers)
      (output) => {
        const wordCount = output.answer.split(" ").length;
        const score = wordCount < 100 ? 1 : Math.max(0, 1 - (wordCount - 100) / 200);

        return {
          name: "Conciseness",
          score,
          metadata: { word_count: wordCount }
        };
      },

      // Configuration tracking
      (output) => {
        return {
          name: "Config",
          score: 1,
          metadata: output.config
        };
      }
    ],
    metadata: {
      purpose: "RAG optimization experiment",
      date: new Date().toISOString(),
      ...experiment.config
    }
  });
}

console.log("View results at: https://www.braintrust.dev");
```

::

### Python

::code-collapse

```python
from braintrust import Eval
from openai import OpenAI
from anthropic import Anthropic
import os

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Simulated retrieval function
def retrieve_context(query, config):
    """In production, this would use your actual vector DB."""
    mock_docs = [
        "Braintrust provides experiment tracking and dataset versioning for AI applications.",
        "Compare prompts, models, and configurations side-by-side with automatic logging.",
        "Enterprise features include CI/CD integration, custom scorers, and production monitoring."
    ]
    return mock_docs[:config["top_k"]]

# Baseline configuration
baseline_config = {
    "embedding_model": "text-embedding-3-small",
    "top_k": 3,
    "chunk_size": 512,
    "llm": "gpt-4"
}

# Experiment variations
experiments = [
    {"name": "baseline", "config": baseline_config},
    {"name": "larger-chunks", "config": {**baseline_config, "chunk_size": 1024}},
    {"name": "more-context", "config": {**baseline_config, "top_k": 5}},
    {"name": "claude-llm", "config": {**baseline_config, "llm": "claude-sonnet-4"}}
]

# Define scorers
def answer_quality_scorer(output, expected):
    """Check if answer contains expected keywords."""
    answer = output["answer"].lower()
    expected_text = expected["expected"].lower()

    contains_expected = any(
        word in answer
        for word in expected_text.split()
        if len(word) > 3
    )

    return {
        "name": "Answer Quality",
        "score": 1 if contains_expected else 0
    }

def context_usage_scorer(output, expected):
    """Check if answer uses retrieved context."""
    answer = output["answer"].lower()
    context_used = any(
        doc[:20].lower() in answer
        for doc in output["context"]
    )

    return {
        "name": "Context Usage",
        "score": 1 if context_used else 0
    }

def conciseness_scorer(output, expected):
    """Prefer shorter, focused answers."""
    word_count = len(output["answer"].split())
    score = 1 if word_count < 100 else max(0, 1 - (word_count - 100) / 200)

    return {
        "name": "Conciseness",
        "score": score,
        "metadata": {"word_count": word_count}
    }

def config_tracker(output, expected):
    """Track configuration metadata."""
    return {
        "name": "Config",
        "score": 1,
        "metadata": output["config"]
    }

# Task function
def generate_answer(input_data, config):
    """Generate answer using configured LLM."""
    context = retrieve_context(input_data["question"], config)
    context_text = "\n\n".join(context)

    if config["llm"] == "claude-sonnet-4":
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": f"Context:\n{context_text}\n\nQuestion: {input_data['question']}\n\nAnswer based on the context:"
            }]
        )
        answer = response.content[0].text
    else:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"Answer based on this context:\n{context_text}"},
                {"role": "user", "content": input_data["question"]}
            ]
        )
        answer = response.choices[0].message.content

    return {
        "answer": answer,
        "context": context,
        "config": config
    }

# Run experiments
for experiment in experiments:
    Eval(
        "RAG Optimization",
        experiment_name=experiment["name"],
        data=[
            {
                "question": "What is Braintrust?",
                "expected": "experiment tracking platform"
            },
            {
                "question": "What features does Braintrust provide?",
                "expected": "experiment tracking, dataset versioning, comparison"
            },
            {
                "question": "Does Braintrust support CI/CD?",
                "expected": "yes"
            }
        ],
        task=lambda input_data: generate_answer(input_data, experiment["config"]),
        scores=[
            answer_quality_scorer,
            context_usage_scorer,
            conciseness_scorer,
            config_tracker
        ],
        metadata={
            "purpose": "RAG optimization experiment",
            **experiment["config"]
        }
    )

print("View results at: https://www.braintrust.dev")
```

::

## Metrics Tracked

- **Answer Quality** - Relevance to expected answer
- **Context Usage** - Utilizes retrieved context
- **Conciseness** - Focused, not verbose answers
- **Configuration** - Tracks all experiment parameters
- **Cost & Latency** - Automatic via Braintrust

## Braintrust Features

1. **Automatic Versioning** - Every experiment is versioned
2. **Side-by-Side Comparison** - Visual diff in UI
3. **Statistical Significance** - Auto-calculated
4. **Dataset Snapshots** - Frozen test cases per experiment
5. **Regression Detection** - Alerts on performance drops

## Experiment Workflow

```typescript
// 1. Create baseline
await Eval("RAG System", {
  experimentName: "baseline-v1",
  // ... config
});

// 2. Try variation
await Eval("RAG System", {
  experimentName: "new-embedding-model",
  // ... modified config
});

// 3. Braintrust automatically:
//    - Compares metrics
//    - Shows statistical significance
//    - Highlights regressions
//    - Tracks cost differences
```

## Viewing Results

Braintrust UI shows:

```
Experiment Comparison: RAG Optimization
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    baseline  larger-chunks  more-context  claude-llm
Answer Quality      0.85      0.82 (-3%)     0.90 (+6%)    0.92 (+8%) ✓
Context Usage       0.90      0.85 (-5%)     0.95 (+6%)    0.93 (+3%)
Conciseness         0.75      0.65 (-13%)    0.70 (-7%)    0.80 (+7%)
Avg Latency         1.2s      1.3s (+8%)     1.5s (+25%)   0.9s (-25%) ✓
Cost per Query      $0.02     $0.022 (+10%)  $0.028 (+40%) $0.035 (+75%)

✓ = Best in category
Statistical significance: p < 0.05
```

## Best Practices

1. **Baseline first** - Establish performance floor
2. **One variable** - Change one thing per experiment
3. **Sufficient data** - 20+ test cases for significance
4. **Track metadata** - Log all config parameters
5. **Production parity** - Use realistic test data

## Advanced: A/B Testing

```typescript
// Gradual rollout with Braintrust
const experimentConfig = await braintrust.getExperiment("RAG System");

const shouldUseNewConfig = experimentConfig.rollout > Math.random();

if (shouldUseNewConfig) {
  // Use winning configuration
  config = experimentConfig.winner;
} else {
  // Use baseline
  config = experimentConfig.baseline;
}

// Braintrust tracks real-world performance
await braintrust.log({
  experiment: "RAG System",
  config: shouldUseNewConfig ? "new" : "baseline",
  userQuery: query,
  response: answer,
  userFeedback: thumbsUp
});
```
