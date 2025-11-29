---
title: Multi-Label Classification
description: Evaluates models that assign multiple labels per instance
use_case: classification
languages: [typescript]
models: [gpt-4, claude-sonnet-4]
github_username: radum2o18
created_at: 2025-11-23
difficulty: intermediate
tags: [accuracy, precision, recall, f1]
---

# Multi-Label Classification

Evaluates classification when instances can have multiple labels simultaneously, common in tagging, topic modeling, and content categorization.

## Use Case

Essential for content tagging, skill extraction, multi-topic classification, and any scenario where items belong to multiple categories.

## Implementation

::code-collapse

```typescript
import { evalite } from "evalite";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface MultiLabelResult {
  predicted: string[];
  actual: string[];
  text: string;
}

evalite("Multi-Label Classification", {
  data: async () => [
    {
      text: "Looking for a Python developer with React experience and knowledge of AWS cloud services",
      labels: ["python", "react", "aws", "cloud", "backend", "frontend"]
    },
    {
      text: "Senior ML engineer needed for NLP project using PyTorch and transformers",
      labels: ["machine-learning", "nlp", "python", "pytorch", "deep-learning"]
    },
    {
      text: "Full-stack TypeScript developer - Node.js backend, Vue.js frontend",
      labels: ["typescript", "nodejs", "vuejs", "backend", "frontend", "fullstack"]
    },
    {
      text: "DevOps engineer with Kubernetes, Docker, and CI/CD pipeline experience",
      labels: ["devops", "kubernetes", "docker", "cicd", "infrastructure"]
    },
    {
      text: "Data scientist for statistical modeling and visualization with R and Python",
      labels: ["data-science", "statistics", "python", "r", "visualization"]
    }
  ],
  task: async (input) => {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: `Extract relevant skill/technology tags from this job description. Respond with a comma-separated list:

"${input.text}"

Possible tags: python, javascript, typescript, react, vue, angular, nodejs, aws, gcp, azure, docker, kubernetes, ml, nlp, data-science, backend, frontend, fullstack, devops, cloud, cicd, pytorch, tensorflow, r, statistics, visualization, deep-learning`
      }]
    });

    const tagsText = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    const predicted = tagsText
      .toLowerCase()
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    return { predicted, actual: input.labels, text: input.text };
  },
  scorers: [
    // Exact Match Ratio - % of instances with perfect predictions
    (output, { data }) => {
      const results = data as MultiLabelResult[];
      const exactMatches = results.filter(r => {
        const predictedSet = new Set(r.predicted);
        const actualSet = new Set(r.actual);

        if (predictedSet.size !== actualSet.size) return false;
        return [...actualSet].every(label => predictedSet.has(label));
      }).length;

      return {
        name: "Exact Match",
        score: exactMatches / results.length,
        metadata: {
          exact: `${exactMatches}/${results.length}`
        }
      };
    },

    // Hamming Loss - fraction of labels incorrectly predicted
    (output, { data }) => {
      const results = data as MultiLabelResult[];

      const hammingLosses = results.map(r => {
        const allLabels = new Set([...r.predicted, ...r.actual]);
        const incorrect = [...allLabels].filter(label => {
          const inPredicted = r.predicted.includes(label);
          const inActual = r.actual.includes(label);
          return inPredicted !== inActual;
        }).length;

        return incorrect / allLabels.size;
      });

      const avgHammingLoss = hammingLosses.reduce((a, b) => a + b, 0) / results.length;

      return {
        name: "Hamming Loss",
        score: 1 - avgHammingLoss, // Invert so higher is better
        metadata: {
          avg_loss: Math.round(avgHammingLoss * 1000) / 1000
        }
      };
    },

    // Precision (micro-averaged across all labels)
    (output, { data }) => {
      const results = data as MultiLabelResult[];

      let truePositives = 0;
      let falsePositives = 0;

      results.forEach(r => {
        r.predicted.forEach(label => {
          if (r.actual.includes(label)) {
            truePositives++;
          } else {
            falsePositives++;
          }
        });
      });

      const precision = truePositives / (truePositives + falsePositives || 1);

      return {
        name: "Precision (micro)",
        score: precision,
        metadata: {
          tp: truePositives,
          fp: falsePositives
        }
      };
    },

    // Recall (micro-averaged)
    (output, { data }) => {
      const results = data as MultiLabelResult[];

      let truePositives = 0;
      let falseNegatives = 0;

      results.forEach(r => {
        r.actual.forEach(label => {
          if (r.predicted.includes(label)) {
            truePositives++;
          } else {
            falseNegatives++;
          }
        });
      });

      const recall = truePositives / (truePositives + falseNegatives || 1);

      return {
        name: "Recall (micro)",
        score: recall,
        metadata: {
          tp: truePositives,
          fn: falseNegatives
        }
      };
    },

    // F1 Score (micro-averaged)
    (output, { data }) => {
      const results = data as MultiLabelResult[];

      let truePositives = 0;
      let falsePositives = 0;
      let falseNegatives = 0;

      results.forEach(r => {
        r.predicted.forEach(label => {
          if (r.actual.includes(label)) {
            truePositives++;
          } else {
            falsePositives++;
          }
        });

        r.actual.forEach(label => {
          if (!r.predicted.includes(label)) {
            falseNegatives++;
          }
        });
      });

      const precision = truePositives / (truePositives + falsePositives || 1);
      const recall = truePositives / (truePositives + falseNegatives || 1);

      const f1 = precision + recall === 0
        ? 0
        : (2 * precision * recall) / (precision + recall);

      return {
        name: "F1 Score (micro)",
        score: f1
      };
    },

    // Jaccard Similarity (average across instances)
    (output, { data }) => {
      const results = data as MultiLabelResult[];

      const jaccardScores = results.map(r => {
        const predictedSet = new Set(r.predicted);
        const actualSet = new Set(r.actual);

        const intersection = [...actualSet].filter(label => predictedSet.has(label)).length;
        const union = new Set([...r.predicted, ...r.actual]).size;

        return union === 0 ? 0 : intersection / union;
      });

      const avgJaccard = jaccardScores.reduce((a, b) => a + b, 0) / results.length;

      return {
        name: "Jaccard Similarity",
        score: avgJaccard
      };
    }
  ]
});
```

::

## Metrics Tracked

- **Exact Match** - % of instances with all labels correct
- **Hamming Loss** - Fraction of incorrect labels (inverted)
- **Precision (micro)** - Of all predicted labels, % correct
- **Recall (micro)** - Of all actual labels, % found
- **F1 Score (micro)** - Harmonic mean of precision & recall
- **Jaccard Similarity** - Intersection over union of label sets

## Multi-Label Metrics Explained

| Metric | Range | Good Score | Use Case |
|--------|-------|------------|----------|
| Exact Match | 0-1 | >0.7 | Strict correctness required |
| Hamming Loss | 0-1 | >0.85 | Label-level accuracy |
| F1 (micro) | 0-1 | >0.8 | Balanced performance |
| Jaccard | 0-1 | >0.75 | Partial matches acceptable |

## Averaging Strategies

**Micro-averaging**: Aggregate across all labels (treats all labels equally)
**Macro-averaging**: Average per-label scores (equal weight per label type)
**Weighted**: Weight by label frequency

```typescript
// Micro (used above) - aggregate then compute
const microPrecision = totalTP / (totalTP + totalFP);

// Macro - compute then average
const macroPrecision = perLabelPrecisions.reduce((a, b) => a + b) / labels.length;
```

## Best Practices

1. **Micro-averaging** for class-imbalanced data
2. **Macro-averaging** when all labels equally important
3. **Threshold tuning** for probability-based predictions
4. **Label co-occurrence** analysis for systematic errors
5. **Per-label metrics** identify problematic categories

## Example Output

```
Exact Match: 0.40 (2/5 perfect predictions)
Hamming Loss: 0.88 (low error rate)
Precision: 0.85 (15% false positives)
Recall: 0.78 (22% missed labels)
F1 Score: 0.81
Jaccard: 0.72

Instance breakdown:
1. "Python + React + AWS..."
   Predicted: [python, react, aws, backend]
   Actual: [python, react, aws, cloud, backend, frontend]
   Missing: [cloud, frontend]
   Jaccard: 0.67
```
