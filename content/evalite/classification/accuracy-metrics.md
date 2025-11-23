---
title: Accuracy Metrics
description: Comprehensive classification metrics including accuracy, precision, recall, and F1 score
use_case: classification
languages: [typescript]
models: [gpt-4, claude-sonnet-4, gemini-pro]
author: Radu
github: radu
created_at: 2025-01-20
difficulty: beginner
tags: [classification, accuracy, precision, recall, f1, metrics]
---

# Accuracy Metrics

Evaluates classification model performance using standard metrics: accuracy, precision, recall, F1 score, and confusion matrix.

## Use Case

Foundation metrics for any classification task including sentiment analysis, intent detection, content moderation, and entity classification.

## Implementation

```typescript
import { evalite } from "evalite";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ClassificationResult {
  predicted: string;
  actual: string;
  confidence?: number;
}

evalite("Classification Accuracy", {
  data: async () => [
    // Sentiment classification
    { text: "This product is amazing! Best purchase ever!", label: "positive" },
    { text: "Terrible quality, waste of money", label: "negative" },
    { text: "It's okay, nothing special", label: "neutral" },
    { text: "Absolutely love it! Highly recommend!", label: "positive" },
    { text: "Worst experience ever, very disappointed", label: "negative" },
    { text: "Pretty average, does the job", label: "neutral" },
    { text: "Exceeded my expectations, fantastic!", label: "positive" },
    { text: "Complete garbage, don't buy", label: "negative" },
    { text: "It works fine, no complaints", label: "neutral" },
    { text: "Outstanding quality and service", label: "positive" }
  ],
  task: async (input) => {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 10,
      messages: [{
        role: "user",
        content: `Classify the sentiment of this text as "positive", "negative", or "neutral":\n\n"${input.text}"\n\nRespond with only the classification.`
      }]
    });

    const predicted = response.content[0].type === "text"
      ? response.content[0].text.toLowerCase().trim()
      : "";

    return { predicted, actual: input.label };
  },
  scorers: [
    // Overall Accuracy
    (output, { data }) => {
      const results = data as ClassificationResult[];
      const correct = results.filter(r => r.predicted === r.actual).length;
      const accuracy = correct / results.length;

      return {
        name: "Accuracy",
        score: accuracy,
        metadata: {
          correct: `${correct}/${results.length}`,
          percentage: `${Math.round(accuracy * 100)}%`
        }
      };
    },

    // Precision (per class, averaged)
    (output, { data }) => {
      const results = data as ClassificationResult[];
      const labels = [...new Set(results.map(r => r.actual))];

      const precisionScores = labels.map(label => {
        const predictedAsLabel = results.filter(r => r.predicted === label);
        if (predictedAsLabel.length === 0) return 0;

        const truePositives = predictedAsLabel.filter(r => r.actual === label).length;
        return truePositives / predictedAsLabel.length;
      });

      const avgPrecision = precisionScores.reduce((a, b) => a + b, 0) / labels.length;

      return {
        name: "Precision (avg)",
        score: avgPrecision,
        metadata: {
          by_class: Object.fromEntries(
            labels.map((label, i) => [label, Math.round(precisionScores[i] * 100) / 100])
          )
        }
      };
    },

    // Recall (per class, averaged)
    (output, { data }) => {
      const results = data as ClassificationResult[];
      const labels = [...new Set(results.map(r => r.actual))];

      const recallScores = labels.map(label => {
        const actualLabel = results.filter(r => r.actual === label);
        const truePositives = actualLabel.filter(r => r.predicted === label).length;
        return truePositives / actualLabel.length;
      });

      const avgRecall = recallScores.reduce((a, b) => a + b, 0) / labels.length;

      return {
        name: "Recall (avg)",
        score: avgRecall,
        metadata: {
          by_class: Object.fromEntries(
            labels.map((label, i) => [label, Math.round(recallScores[i] * 100) / 100])
          )
        }
      };
    },

    // F1 Score (harmonic mean of precision and recall)
    (output, { data }) => {
      const results = data as ClassificationResult[];
      const labels = [...new Set(results.map(r => r.actual))];

      const f1Scores = labels.map(label => {
        const predictedAsLabel = results.filter(r => r.predicted === label);
        const actualLabel = results.filter(r => r.actual === label);

        if (predictedAsLabel.length === 0 || actualLabel.length === 0) return 0;

        const precision = predictedAsLabel.filter(r => r.actual === label).length / predictedAsLabel.length;
        const recall = actualLabel.filter(r => r.predicted === label).length / actualLabel.length;

        if (precision + recall === 0) return 0;
        return (2 * precision * recall) / (precision + recall);
      });

      const avgF1 = f1Scores.reduce((a, b) => a + b, 0) / labels.length;

      return {
        name: "F1 Score",
        score: avgF1,
        metadata: {
          by_class: Object.fromEntries(
            labels.map((label, i) => [label, Math.round(f1Scores[i] * 100) / 100])
          )
        }
      };
    },

    // Confusion Matrix
    (output, { data }) => {
      const results = data as ClassificationResult[];
      const labels = [...new Set(results.map(r => r.actual))].sort();

      const matrix: Record<string, Record<string, number>> = {};
      labels.forEach(actual => {
        matrix[actual] = {};
        labels.forEach(predicted => {
          matrix[actual][predicted] = results.filter(
            r => r.actual === actual && r.predicted === predicted
          ).length;
        });
      });

      return {
        name: "Confusion Matrix",
        score: 1, // Not a score, just for display
        metadata: { matrix }
      };
    }
  ]
});
```

## Metrics Tracked

- **Accuracy** - Overall correctness (TP + TN) / Total
- **Precision** - Of predicted positives, how many are correct
- **Recall** - Of actual positives, how many were found
- **F1 Score** - Harmonic mean of precision & recall
- **Confusion Matrix** - Detailed prediction breakdown

## Metric Definitions

| Metric | Formula | Best Use |
|--------|---------|----------|
| Accuracy | (TP + TN) / Total | Balanced datasets |
| Precision | TP / (TP + FP) | When false positives are costly |
| Recall | TP / (TP + FN) | When false negatives are costly |
| F1 | 2 × (P × R) / (P + R) | Imbalanced datasets |

## Interpreting Results

**High Precision, Low Recall**: Model is conservative, only predicts when confident
**Low Precision, High Recall**: Model is aggressive, catches most cases but with noise
**High F1**: Good balance for production use

## Example Output

```
Accuracy: 0.90 (9/10 correct)

Precision by class:
  positive: 1.00
  negative: 0.67
  neutral: 1.00

Recall by class:
  positive: 0.75
  negative: 1.00
  neutral: 0.67

F1 Score: 0.82

Confusion Matrix:
           predicted
           pos  neg  neu
actual pos  3    0    1
       neg  0    2    0
       neu  0    1    3
```

## Best Practices

1. **Macro-averaging** for multi-class (equal weight per class)
2. **Weighted averaging** when class imbalance matters
3. **Per-class metrics** identify weak spots
4. **Confusion matrix** reveals systematic errors
5. **Stratified sampling** ensures representative test sets
