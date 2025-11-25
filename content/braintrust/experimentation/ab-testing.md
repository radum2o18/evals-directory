---
title: A/B Testing & Gradual Rollout
description: Run controlled A/B tests and gradual rollouts with production monitoring
use_case: experimentation
languages: [typescript, python]
models: [gpt-4, claude-sonnet-4]
github: radum2o18
created_at: 2025-11-21
difficulty: advanced
tags: [braintrust, ab-testing, experimentation, rollout, production]
---

# A/B Testing & Gradual Rollout

Run controlled A/B tests in production with gradual rollout, automatic metric tracking, and statistical significance testing using Braintrust's experimentation platform.

## Use Case

Essential for safely deploying prompt changes, model upgrades, or configuration updates to production. Measure real-world impact before full rollout.

## Implementation

### TypeScript

::code-collapse

```typescript
import { initLogger, wrapOpenAI } from "braintrust";
import { OpenAI } from "openai";

// Initialize Braintrust
const logger = initLogger({
  projectName: "Customer Support Bot",
  apiKey: process.env.BRAINTRUST_API_KEY,
});

// Wrap OpenAI for automatic logging
const openai = wrapOpenAI(
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
);

// Define experiment variants
const variants = {
  control: {
    model: "gpt-4",
    temperature: 0.7,
    systemPrompt: "You are a helpful customer support agent. Be concise and professional."
  },
  variant_a: {
    model: "gpt-4",
    temperature: 0.9,
    systemPrompt: "You are a friendly customer support agent. Be warm and conversational while staying professional."
  },
  variant_b: {
    model: "gpt-4-turbo-preview",
    temperature: 0.7,
    systemPrompt: "You are a helpful customer support agent. Be concise and professional."
  }
};

// Gradual rollout configuration
interface RolloutConfig {
  control: number;    // % of traffic
  variant_a: number;
  variant_b: number;
}

// Start conservative, increase over time
const rolloutStages: RolloutConfig[] = [
  { control: 80, variant_a: 10, variant_b: 10 },  // Week 1: Testing
  { control: 60, variant_a: 20, variant_b: 20 },  // Week 2: Expand
  { control: 40, variant_a: 30, variant_b: 30 },  // Week 3: Scale
  { control: 0, variant_a: 0, variant_b: 100 },   // Week 4: Winner takes all
];

// Get current rollout stage (in production, this comes from config service)
const currentStage = rolloutStages[0];

// Variant selection with sticky sessions
function selectVariant(userId: string, rollout: RolloutConfig): keyof typeof variants {
  // Hash user ID for consistent assignment
  const hash = userId.split("").reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  const bucket = Math.abs(hash) % 100;

  if (bucket < rollout.control) return "control";
  if (bucket < rollout.control + rollout.variant_a) return "variant_a";
  return "variant_b";
}

// Main chatbot function with A/B testing
async function handleUserMessage(userId: string, message: string) {
  const experimentId = logger.startExperiment({
    experimentName: "Prompt Optimization v2",
    metadata: {
      userId,
      timestamp: new Date().toISOString(),
    }
  });

  // Select variant for this user
  const variantKey = selectVariant(userId, currentStage);
  const variant = variants[variantKey];

  // Log variant assignment
  logger.log({
    experimentId,
    variant: variantKey,
    input: message,
  });

  const startTime = Date.now();

  try {
    // Call LLM with variant configuration
    const response = await openai.chat.completions.create({
      model: variant.model,
      temperature: variant.temperature,
      messages: [
        { role: "system", content: variant.systemPrompt },
        { role: "user", content: message }
      ]
    });

    const answer = response.choices[0].message.content || "";
    const latency = Date.now() - startTime;

    // Log result
    logger.log({
      experimentId,
      variant: variantKey,
      output: answer,
      metadata: {
        latency,
        tokens: response.usage?.total_tokens,
        cost: calculateCost(response.usage, variant.model)
      }
    });

    return { answer, variant: variantKey };

  } catch (error) {
    // Log errors
    logger.log({
      experimentId,
      variant: variantKey,
      error: error instanceof Error ? error.message : "Unknown error",
      metadata: { latency: Date.now() - startTime }
    });

    throw error;
  }
}

// Capture user feedback
async function recordFeedback(
  experimentId: string,
  variant: string,
  thumbsUp: boolean,
  comment?: string
) {
  logger.log({
    experimentId,
    variant,
    scores: {
      user_satisfaction: thumbsUp ? 1 : 0
    },
    metadata: {
      feedback_comment: comment,
      feedback_time: new Date().toISOString()
    }
  });
}

// Helper: Calculate cost based on model and tokens
function calculateCost(usage: any, model: string): number {
  if (!usage) return 0;

  const pricing: Record<string, { input: number; output: number }> = {
    "gpt-4": { input: 0.03 / 1000, output: 0.06 / 1000 },
    "gpt-4-turbo-preview": { input: 0.01 / 1000, output: 0.03 / 1000 },
  };

  const rates = pricing[model] || { input: 0, output: 0 };

  return (
    (usage.prompt_tokens * rates.input) +
    (usage.completion_tokens * rates.output)
  );
}

// Example usage
async function main() {
  const userId = "user-12345";
  const message = "How do I return an item?";

  // Handle message with A/B testing
  const result = await handleUserMessage(userId, message);

  console.log(`Variant: ${result.variant}`);
  console.log(`Answer: ${result.answer}`);

  // Simulate user feedback
  await recordFeedback(
    result.experimentId,
    result.variant,
    true, // thumbs up
    "Very helpful!"
  );
}

// Automated analysis
async function analyzeExperiment() {
  // Braintrust automatically calculates:
  // - User satisfaction by variant
  // - Latency distributions
  // - Cost per query
  // - Statistical significance (t-test, chi-square)
  // - Confidence intervals

  // Access via Braintrust API or UI
  console.log("View detailed analysis at: https://www.braintrust.dev");
}
```

::

### Python

::code-collapse

```python
from braintrust import init_logger, wrap_openai
from openai import OpenAI
import os
import time
import hashlib

# Initialize Braintrust
logger = init_logger(
    project_name="Customer Support Bot",
    api_key=os.getenv("BRAINTRUST_API_KEY")
)

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Define experiment variants
variants = {
    "control": {
        "model": "gpt-4",
        "temperature": 0.7,
        "system_prompt": "You are a helpful customer support agent. Be concise and professional."
    },
    "variant_a": {
        "model": "gpt-4",
        "temperature": 0.9,
        "system_prompt": "You are a friendly customer support agent. Be warm and conversational while staying professional."
    },
    "variant_b": {
        "model": "gpt-4-turbo-preview",
        "temperature": 0.7,
        "system_prompt": "You are a helpful customer support agent. Be concise and professional."
    }
}

# Rollout configuration
rollout_stages = [
    {"control": 80, "variant_a": 10, "variant_b": 10},  # Week 1
    {"control": 60, "variant_a": 20, "variant_b": 20},  # Week 2
    {"control": 40, "variant_a": 30, "variant_b": 30},  # Week 3
    {"control": 0, "variant_a": 0, "variant_b": 100},   # Week 4
]

current_stage = rollout_stages[0]

def select_variant(user_id: str, rollout: dict) -> str:
    """Select variant based on user ID hash for sticky sessions."""
    # Hash user ID for consistent assignment
    hash_val = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
    bucket = hash_val % 100

    if bucket < rollout["control"]:
        return "control"
    elif bucket < rollout["control"] + rollout["variant_a"]:
        return "variant_a"
    else:
        return "variant_b"

def handle_user_message(user_id: str, message: str) -> dict:
    """Handle user message with A/B testing."""
    experiment_id = logger.start_experiment(
        experiment_name="Prompt Optimization v2",
        metadata={
            "user_id": user_id,
            "timestamp": time.time()
        }
    )

    # Select variant
    variant_key = select_variant(user_id, current_stage)
    variant = variants[variant_key]

    # Log variant assignment
    logger.log(
        experiment_id=experiment_id,
        variant=variant_key,
        input=message
    )

    start_time = time.time()

    try:
        # Call LLM
        response = openai_client.chat.completions.create(
            model=variant["model"],
            temperature=variant["temperature"],
            messages=[
                {"role": "system", "content": variant["system_prompt"]},
                {"role": "user", "content": message}
            ]
        )

        answer = response.choices[0].message.content
        latency = (time.time() - start_time) * 1000  # ms

        # Calculate cost
        usage = response.usage
        cost = calculate_cost(usage, variant["model"])

        # Log result
        logger.log(
            experiment_id=experiment_id,
            variant=variant_key,
            output=answer,
            metadata={
                "latency": latency,
                "tokens": usage.total_tokens,
                "cost": cost
            }
        )

        return {
            "answer": answer,
            "variant": variant_key,
            "experiment_id": experiment_id
        }

    except Exception as e:
        # Log errors
        logger.log(
            experiment_id=experiment_id,
            variant=variant_key,
            error=str(e),
            metadata={"latency": (time.time() - start_time) * 1000}
        )
        raise

def record_feedback(experiment_id: str, variant: str, thumbs_up: bool, comment: str = None):
    """Capture user feedback."""
    logger.log(
        experiment_id=experiment_id,
        variant=variant,
        scores={"user_satisfaction": 1 if thumbs_up else 0},
        metadata={
            "feedback_comment": comment,
            "feedback_time": time.time()
        }
    )

def calculate_cost(usage, model: str) -> float:
    """Calculate cost based on model and token usage."""
    pricing = {
        "gpt-4": {"input": 0.03 / 1000, "output": 0.06 / 1000},
        "gpt-4-turbo-preview": {"input": 0.01 / 1000, "output": 0.03 / 1000}
    }

    rates = pricing.get(model, {"input": 0, "output": 0})

    return (
        usage.prompt_tokens * rates["input"] +
        usage.completion_tokens * rates["output"]
    )

# Example usage
if __name__ == "__main__":
    user_id = "user-12345"
    message = "How do I return an item?"

    # Handle message with A/B testing
    result = handle_user_message(user_id, message)

    print(f"Variant: {result['variant']}")
    print(f"Answer: {result['answer']}")

    # Simulate user feedback
    record_feedback(
        result["experiment_id"],
        result["variant"],
        thumbs_up=True,
        comment="Very helpful!"
    )

    print("\nView detailed analysis at: https://www.braintrust.dev")
```

::

## Metrics Tracked

- **User Satisfaction** - Thumbs up/down ratio
- **Latency** - Response time by variant
- **Cost** - Token usage and pricing
- **Error Rate** - Failures per variant
- **Statistical Significance** - Auto-calculated p-values
- **Sample Size** - Traffic per variant

## Rollout Strategy

### Phase 1: Canary (Week 1)
```
Control:    80% ████████████████
Variant A:  10% ██
Variant B:  10% ██
```
- Low risk
- Detect major issues
- Gather initial data

### Phase 2: Expand (Week 2)
```
Control:    60% ████████████
Variant A:  20% ████
Variant B:  20% ████
```
- Increase confidence
- More statistical power
- Monitor key metrics

### Phase 3: Scale (Week 3)
```
Control:    40% ████████
Variant A:  30% ██████
Variant B:  30% ██████
```
- Near-equal distribution
- Final validation
- Identify winner

### Phase 4: Winner (Week 4)
```
Winner:     100% ████████████████████
```
- Full rollout
- Decommission losers
- Becomes new baseline

## Decision Criteria

Promote variant if:

```typescript
const shouldPromote = (variant: Stats, control: Stats) => {
  return (
    variant.satisfaction > control.satisfaction &&
    variant.pValue < 0.05 &&                    // Statistically significant
    variant.sampleSize > 1000 &&                // Sufficient data
    variant.errorRate < control.errorRate * 1.1 && // No worse errors
    variant.p95Latency < control.p95Latency * 1.2  // Acceptable latency
  );
};
```

## Best Practices

1. **Sticky sessions** - Same user gets same variant
2. **Sufficient sample size** - 1000+ per variant minimum
3. **Monitor guardrails** - Error rates, latency spikes
4. **Gradual rollout** - Start small, scale slowly
5. **Automated rollback** - Trigger on metric degradation
6. **Multi-metric** - Don't optimize for single metric

## Automated Rollback

```typescript
// Monitor metrics in real-time
setInterval(async () => {
  const metrics = await braintrust.getExperimentMetrics("Prompt Optimization v2");

  for (const [variant, stats] of Object.entries(metrics.variants)) {
    // Rollback if error rate spikes
    if (stats.errorRate > 0.05) {
      await braintrust.setRollout(variant, 0);
      await alert(`Rolled back ${variant}: high error rate`);
    }

    // Rollback if latency degrades significantly
    if (stats.p95Latency > metrics.control.p95Latency * 1.5) {
      await braintrust.setRollout(variant, 0);
      await alert(`Rolled back ${variant}: high latency`);
    }
  }
}, 60000); // Check every minute
```

## Viewing Results

Braintrust Dashboard shows:

```
Experiment: Prompt Optimization v2
Running for: 7 days
Total queries: 45,234

Variant Performance:
┌───────────┬────────┬───────────┬─────────┬──────────┬─────────┐
│ Variant   │ Traffic│ Satisfaction│ Latency │ Cost/Query│ p-value │
├───────────┼────────┼─────────────┼─────────┼──────────┼─────────┤
│ Control   │ 80%    │ 0.78       │ 1.2s    │ $0.025   │ -       │
│ Variant A │ 10%    │ 0.82 ⬆     │ 1.3s    │ $0.027   │ 0.032 ✓ │
│ Variant B │ 10%    │ 0.75 ⬇     │ 0.9s ⬆  │ $0.015 ⬆ │ 0.120   │
└───────────┴────────┴─────────────┴─────────┴──────────┴─────────┘

✓ Statistically significant (p < 0.05)
⬆ Better than control
⬇ Worse than control

Recommendation: Promote Variant A
- Highest satisfaction (+5.1%)
- Statistically significant
- Acceptable cost increase (+8%)
```
