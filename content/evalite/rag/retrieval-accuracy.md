---
title: Retrieval Accuracy
description: Measures how well the retrieval system finds relevant documents for queries
use_case: rag
languages: [typescript]
models: [gpt-4, claude-sonnet-4]
author: Radu
github: radu
created_at: 2025-01-20
difficulty: intermediate
tags: [rag, retrieval, precision, recall, ranking]
---

# Retrieval Accuracy

Evaluates retrieval system performance using precision, recall, MRR (Mean Reciprocal Rank), and NDCG (Normalized Discounted Cumulative Gain).

## Use Case

Critical for RAG systems where retrieval quality directly impacts answer quality. Essential for optimizing embedding models, chunk sizes, and search algorithms.

## Implementation

::code-collapse

```typescript
import { evalite } from "evalite";
import { embed } from "@ai-sdk/openai";
import { cosineSimilarity, embedMany } from "ai";

// Simulated vector database
interface Document {
  id: string;
  content: string;
  embedding?: number[];
}

const documents: Document[] = [
  { id: "doc1", content: "Python is a high-level programming language known for its simplicity and readability." },
  { id: "doc2", content: "JavaScript is the programming language of the web, running in browsers and on servers." },
  { id: "doc3", content: "TypeScript adds static typing to JavaScript for better development experience." },
  { id: "doc4", content: "React is a JavaScript library for building user interfaces." },
  { id: "doc5", content: "Vue.js is a progressive framework for building web applications." },
  { id: "doc6", content: "Python's pandas library is essential for data analysis and manipulation." },
  { id: "doc7", content: "Machine learning models can be built using Python's scikit-learn library." },
  { id: "doc8", content: "Node.js allows JavaScript to run on the server side." },
];

// Embed documents once
async function initializeDocuments() {
  const { embeddings } = await embedMany({
    model: embed("text-embedding-3-small"),
    values: documents.map(d => d.content)
  });

  documents.forEach((doc, i) => {
    doc.embedding = embeddings[i];
  });
}

async function retrieveDocuments(query: string, topK: number = 3) {
  const { embedding: queryEmbedding } = await embed({
    model: embed("text-embedding-3-small"),
    value: query
  });

  const scored = documents.map(doc => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding!)
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ id, content, score }) => ({ id, content, score }));
}

evalite("Retrieval Accuracy", {
  data: async () => {
    await initializeDocuments();

    return [
      {
        query: "What is Python used for?",
        relevantDocs: ["doc1", "doc6", "doc7"], // Gold standard
        topK: 3
      },
      {
        query: "Tell me about JavaScript frameworks",
        relevantDocs: ["doc4", "doc5"],
        topK: 5
      },
      {
        query: "How do I build web apps?",
        relevantDocs: ["doc2", "doc4", "doc5"],
        topK: 3
      },
      {
        query: "Server-side programming languages",
        relevantDocs: ["doc1", "doc2", "doc8"],
        topK: 5
      }
    ];
  },
  task: async (input) => {
    return await retrieveDocuments(input.query, input.topK);
  },
  scorers: [
    // Precision @ K - what % of retrieved docs are relevant
    (output, { input }) => {
      const retrieved = output.map((d: any) => d.id);
      const relevantRetrieved = retrieved.filter((id: string) =>
        input.relevantDocs.includes(id)
      );

      const precision = relevantRetrieved.length / retrieved.length;

      return {
        name: "Precision@K",
        score: precision,
        metadata: {
          retrieved: retrieved.length,
          relevant: relevantRetrieved.length
        }
      };
    },

    // Recall @ K - what % of relevant docs were retrieved
    (output, { input }) => {
      const retrieved = output.map((d: any) => d.id);
      const relevantRetrieved = retrieved.filter((id: string) =>
        input.relevantDocs.includes(id)
      );

      const recall = relevantRetrieved.length / input.relevantDocs.length;

      return {
        name: "Recall@K",
        score: recall,
        metadata: {
          found: relevantRetrieved.length,
          total: input.relevantDocs.length
        }
      };
    },

    // F1 Score - harmonic mean of precision and recall
    (output, { input }) => {
      const retrieved = output.map((d: any) => d.id);
      const relevantRetrieved = retrieved.filter((id: string) =>
        input.relevantDocs.includes(id)
      );

      const precision = relevantRetrieved.length / retrieved.length;
      const recall = relevantRetrieved.length / input.relevantDocs.length;

      const f1 = precision + recall === 0
        ? 0
        : (2 * precision * recall) / (precision + recall);

      return {
        name: "F1 Score",
        score: f1
      };
    },

    // Mean Reciprocal Rank (MRR) - position of first relevant doc
    (output, { input }) => {
      const retrieved = output.map((d: any) => d.id);
      const firstRelevantIndex = retrieved.findIndex((id: string) =>
        input.relevantDocs.includes(id)
      );

      const mrr = firstRelevantIndex === -1
        ? 0
        : 1 / (firstRelevantIndex + 1);

      return {
        name: "MRR",
        score: mrr,
        metadata: {
          first_relevant_position: firstRelevantIndex + 1
        }
      };
    },

    // NDCG (Normalized Discounted Cumulative Gain) - ranking quality
    (output, { input }) => {
      const retrieved = output.map((d: any) => d.id);

      // DCG - actual ranking
      const dcg = retrieved.reduce((sum: number, id: string, index: number) => {
        const relevance = input.relevantDocs.includes(id) ? 1 : 0;
        return sum + relevance / Math.log2(index + 2); // +2 because log2(1) = 0
      }, 0);

      // IDCG - ideal ranking (all relevant docs first)
      const idealRanking = [
        ...input.relevantDocs,
        ...retrieved.filter(id => !input.relevantDocs.includes(id))
      ].slice(0, retrieved.length);

      const idcg = idealRanking.reduce((sum: number, id: string, index: number) => {
        const relevance = input.relevantDocs.includes(id) ? 1 : 0;
        return sum + relevance / Math.log2(index + 2);
      }, 0);

      const ndcg = idcg === 0 ? 0 : dcg / idcg;

      return {
        name: "NDCG",
        score: ndcg
      };
    }
  ]
});
```

::

## Metrics Tracked

- **Precision@K** - Accuracy of retrieved results
- **Recall@K** - Coverage of relevant documents
- **F1 Score** - Balanced precision/recall
- **MRR** - Position of first relevant result
- **NDCG** - Ranking quality with position weighting

## Best Practices

1. **Golden datasets** with expert-labeled relevance judgments
2. **Test across query types** (factual, conceptual, ambiguous)
3. **Tune topK** based on downstream task needs
4. **A/B test** embedding models and chunking strategies
5. **Monitor in production** with user feedback signals

## Metric Guide

| Metric | Range | Good Score | Use When |
|--------|-------|------------|----------|
| Precision@K | 0-1 | >0.7 | Cost of false positives high |
| Recall@K | 0-1 | >0.8 | Must find all relevant docs |
| F1 | 0-1 | >0.75 | Balance precision/recall |
| MRR | 0-1 | >0.8 | First result matters most |
| NDCG | 0-1 | >0.85 | Ranking order critical |
