---
title: Prompt Comparison Testing
description: Compare multiple prompt variations across models to find optimal phrasing
use_case: prompt-engineering
languages: [yaml]
models: [gpt-4, claude-sonnet-4, gemini-pro]
github: radum2o18
created_at: 2025-11-22
difficulty: beginner
tags: [promptfoo, prompt-engineering, comparison, optimization]
---

# Prompt Comparison Testing

Systematically test multiple prompt variations across different models to identify the best-performing prompt structure and phrasing.

## Use Case

Essential for prompt engineering workflows. Quickly iterate on prompt designs by testing variations side-by-side with consistent test cases.

## Implementation

### promptfooconfig.yaml

::code-collapse

```yaml
description: "Prompt comparison for customer support bot"

prompts:
  # Variation 1: Direct and simple
  - "You are a helpful customer support agent. Answer this question: {{question}}"

  # Variation 2: Detailed with constraints
  - |
    You are a customer support agent for our e-commerce platform.
    Guidelines:
    - Be concise and friendly
    - Provide specific solutions
    - Ask clarifying questions if needed

    Question: {{question}}
    Answer:

  # Variation 3: Role-playing with examples
  - |
    You are an experienced customer support specialist.

    Example exchange:
    Q: How do I return an item?
    A: I'd be happy to help! You can return items within 30 days. Do you have your order number?

    Now answer this question using the same helpful, solution-oriented approach:
    {{question}}

providers:
  - id: openai:gpt-4
    config:
      temperature: 0.7

  - id: anthropic:claude-sonnet-4-20250514
    config:
      temperature: 0.7

  - id: openai:gpt-3.5-turbo
    config:
      temperature: 0.7

tests:
  - vars:
      question: "I haven't received my order yet"
    assert:
      - type: contains
        value: "order number"
      - type: contains-any
        value: ["tracking", "shipped", "delivery"]
      - type: javascript
        value: output.length < 200  # Concise response

  - vars:
      question: "Can I change my shipping address?"
    assert:
      - type: contains
        value: "contact"
      - type: not-contains
        value: ["maybe", "might", "possibly"]  # Confident answers
      - type: llm-rubric
        value: "Response provides clear next steps"

  - vars:
      question: "What's your return policy?"
    assert:
      - type: contains
        value: "30 days"
      - type: similar
        value: "You can return items within 30 days of purchase with the original receipt"
        threshold: 0.7

  - vars:
      question: "The product is defective"
    assert:
      - type: contains-any
        value: ["sorry", "apologize", "inconvenience"]
      - type: llm-rubric
        value: "Shows empathy and offers solution"
      - type: is-json
        value: false  # Natural language, not JSON

defaultTest:
  options:
    provider: openai:gpt-4-turbo
  assert:
    - type: cost
      threshold: 0.01  # Max $0.01 per request
    - type: latency
      threshold: 5000  # Max 5s response time
```

::

### Running the Eval

```bash
# Install promptfoo
npm install -g promptfoo

# Run evaluation
promptfoo eval

# View results in UI
promptfoo view

# Export results
promptfoo eval --output results.json

# Compare specific prompts
promptfoo eval --filter-prompts "Variation 1,Variation 2"

# Test against production data
promptfoo eval --vars production-queries.csv
```

## Metrics Tracked

- **Pass Rate** - % of assertions passed per prompt
- **Latency** - Response time per model
- **Cost** - Token usage and pricing
- **Model Comparison** - Performance across providers
- **Assertion Results** - Detailed pass/fail per test

## Assertion Types

| Type | Use Case | Example |
|------|----------|---------|
| `contains` | Required keywords | `value: "order number"` |
| `not-contains` | Forbidden phrases | `value: ["maybe", "possibly"]` |
| `similar` | Semantic similarity | `threshold: 0.7` |
| `llm-rubric` | Qualitative criteria | `value: "Shows empathy"` |
| `javascript` | Custom logic | `value: output.length < 200` |
| `regex` | Pattern matching | `value: "/order #?\d+/i"` |
| `is-json` | Format validation | `value: true` |
| `contains-any` | One of multiple | `value: ["a", "b", "c"]` |

## Best Practices

1. **Consistent test cases** across all prompt variations
2. **Mix assertion types** - keyword + semantic + custom
3. **Cost tracking** - Monitor token usage early
4. **Incremental testing** - Add edge cases progressively
5. **Version control** - Track prompt evolution

## Advanced Features

```yaml
# Model grading (use stronger model to judge weaker)
assert:
  - type: llm-rubric
    value: "Response is empathetic and solution-oriented"
    provider: openai:gpt-4  # Use GPT-4 as judge

# Named test cases for clarity
tests:
  - description: "Missing order inquiry"
    vars:
      question: "I haven't received my order"

# External test data
tests: file://test-cases.yaml

# Environment-specific configs
providers:
  - id: openai:gpt-4
    config:
      apiKey: ${OPENAI_API_KEY}
      organization: ${OPENAI_ORG}
```

## Viewing Results

Promptfoo generates an interactive comparison table:

```
┌─────────────┬──────────────┬────────┬──────────┬───────┐
│ Prompt      │ Provider     │ Passed │ Duration │ Cost  │
├─────────────┼──────────────┼────────┼──────────┼───────┤
│ Variation 1 │ gpt-4        │ 3/4    │ 1.2s     │ $0.02 │
│ Variation 1 │ claude-4     │ 4/4    │ 0.8s     │ $0.03 │
│ Variation 2 │ gpt-4        │ 4/4    │ 1.5s     │ $0.03 │
│ Variation 2 │ claude-4     │ 4/4    │ 0.9s     │ $0.04 │
└─────────────┴──────────────┴────────┴──────────┴───────┘

Winner: Variation 2 with Claude Sonnet 4
```

## Integration

```typescript
// Use in CI/CD
import { evaluate } from 'promptfoo';

const results = await evaluate({
  config: './promptfooconfig.yaml',
  output: ['json', 'html'],
});

if (results.stats.failRate > 0.1) {
  throw new Error('Eval failed: >10% failure rate');
}
```
