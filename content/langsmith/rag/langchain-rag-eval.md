---
title: LangChain RAG Evaluation
description: End-to-end evaluation of LangChain RAG pipelines with built-in evaluators
use_case: rag
languages: [typescript, python]
models: [gpt-4, claude-sonnet-4]
author: Radu
github: radu
created_at: 2025-01-20
difficulty: intermediate
tags: [langchain, rag, langsmith, evaluation, qa]
---

# LangChain RAG Evaluation

Comprehensive evaluation of LangChain RAG systems using LangSmith's built-in evaluators for answer quality, context relevance, and faithfulness.

## Use Case

Perfect for teams using LangChain who want integrated evaluation with automatic tracing, dataset management, and production monitoring.

## Implementation

### TypeScript

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Client } from "langsmith";
import { evaluate } from "langsmith/evaluation";

// Initialize LangSmith client
const client = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
});

// Setup RAG chain
async function createRAGChain() {
  const vectorStore = await MemoryVectorStore.fromTexts(
    [
      "LangChain is a framework for developing applications powered by language models.",
      "LangSmith is a platform for debugging, testing, and monitoring LLM applications.",
      "LangGraph is a library for building stateful, multi-actor applications with LLMs.",
      "LCEL (LangChain Expression Language) enables declarative chain composition.",
      "Retrieval-Augmented Generation (RAG) combines retrieval with generation for factual responses."
    ],
    [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
    new OpenAIEmbeddings()
  );

  const retriever = vectorStore.asRetriever({ k: 3 });

  const llm = new ChatAnthropic({
    model: "claude-sonnet-4-20250514",
    temperature: 0,
  });

  const prompt = ChatPromptTemplate.fromTemplate(`
Answer the question based only on the following context:

{context}

Question: {input}

Answer:`);

  const documentChain = await createStuffDocumentsChain({
    llm,
    prompt,
  });

  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever,
  });

  return retrievalChain;
}

// Define evaluation dataset
const dataset = await client.createDataset("rag-qa-examples", {
  description: "Question-answering examples for RAG evaluation"
});

const examples = [
  {
    input: "What is LangChain?",
    expected_output: "LangChain is a framework for developing applications powered by language models."
  },
  {
    input: "How does LangSmith help developers?",
    expected_output: "LangSmith is a platform for debugging, testing, and monitoring LLM applications."
  },
  {
    input: "What is LCEL used for?",
    expected_output: "LCEL enables declarative chain composition."
  },
  {
    input: "What is RAG?",
    expected_output: "RAG combines retrieval with generation for factual responses."
  }
];

// Add examples to dataset
for (const example of examples) {
  await client.createExample(
    { input: example.input },
    { output: example.expected_output },
    { datasetId: dataset.id }
  );
}

// Custom evaluators
function answerRelevance(run: any, example: any) {
  const answer = run.outputs?.answer || "";
  const question = example.inputs.input;

  // Simple keyword overlap
  const questionWords = new Set(
    question.toLowerCase().split(" ").filter((w: string) => w.length > 3)
  );
  const answerWords = answer.toLowerCase().split(" ");

  const overlap = answerWords.filter((w: string) => questionWords.has(w)).length;
  const score = Math.min(1, overlap / Math.max(questionWords.size, 1));

  return {
    key: "answer_relevance",
    score,
  };
}

function contextPrecision(run: any, example: any) {
  const context = run.outputs?.context || [];
  const expectedAnswer = example.outputs?.output || "";

  // Check if context contains relevant information
  const contextText = context.map((doc: any) => doc.pageContent).join(" ");
  const relevantWords = expectedAnswer.toLowerCase().split(" ").filter((w: string) => w.length > 4);

  const foundWords = relevantWords.filter((word: string) =>
    contextText.toLowerCase().includes(word)
  );

  const score = foundWords.length / Math.max(relevantWords.length, 1);

  return {
    key: "context_precision",
    score,
  };
}

function answerCorrectness(run: any, example: any) {
  const answer = run.outputs?.answer || "";
  const expected = example.outputs?.output || "";

  // Simple semantic similarity using word overlap
  const answerWords = new Set(answer.toLowerCase().split(" "));
  const expectedWords = expected.toLowerCase().split(" ");

  const matches = expectedWords.filter((w: string) => answerWords.has(w)).length;
  const score = matches / Math.max(expectedWords.length, 1);

  return {
    key: "answer_correctness",
    score,
  };
}

// Run evaluation
const chain = await createRAGChain();

const evalResults = await evaluate(
  async (input: { input: string }) => {
    const result = await chain.invoke({ input: input.input });
    return {
      answer: result.answer,
      context: result.context,
    };
  },
  {
    data: dataset.name,
    evaluators: [answerRelevance, contextPrecision, answerCorrectness],
    experimentPrefix: "rag-eval",
    metadata: {
      model: "claude-sonnet-4",
      retriever: "memory-vector-store",
      k: 3,
    },
  }
);

console.log("Evaluation Results:", evalResults);
```

### Python

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_anthropic import ChatAnthropic
from langchain.vectorstores import InMemoryVectorStore
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langsmith import Client
from langsmith.evaluation import evaluate
import os

# Initialize LangSmith client
client = Client(api_key=os.getenv("LANGSMITH_API_KEY"))

# Setup RAG chain
def create_rag_chain():
    # Create vector store with sample documents
    documents = [
        "LangChain is a framework for developing applications powered by language models.",
        "LangSmith is a platform for debugging, testing, and monitoring LLM applications.",
        "LangGraph is a library for building stateful, multi-actor applications with LLMs.",
        "LCEL (LangChain Expression Language) enables declarative chain composition.",
        "Retrieval-Augmented Generation (RAG) combines retrieval with generation for factual responses."
    ]

    vector_store = InMemoryVectorStore.from_texts(
        documents,
        embedding=OpenAIEmbeddings()
    )

    retriever = vector_store.as_retriever(search_kwargs={"k": 3})

    # Create LLM
    llm = ChatAnthropic(
        model="claude-sonnet-4-20250514",
        temperature=0
    )

    # Create prompt template
    prompt = ChatPromptTemplate.from_template("""
Answer the question based only on the following context:

{context}

Question: {input}

Answer:""")

    # Create chains
    document_chain = create_stuff_documents_chain(llm, prompt)
    retrieval_chain = create_retrieval_chain(retriever, document_chain)

    return retrieval_chain

# Define evaluation dataset
dataset_name = "rag-qa-examples"
dataset = client.create_dataset(
    dataset_name,
    description="Question-answering examples for RAG evaluation"
)

examples = [
    {
        "input": "What is LangChain?",
        "expected_output": "LangChain is a framework for developing applications powered by language models."
    },
    {
        "input": "How does LangSmith help developers?",
        "expected_output": "LangSmith is a platform for debugging, testing, and monitoring LLM applications."
    },
    {
        "input": "What is LCEL used for?",
        "expected_output": "LCEL enables declarative chain composition."
    },
    {
        "input": "What is RAG?",
        "expected_output": "RAG combines retrieval with generation for factual responses."
    }
]

# Add examples to dataset
for example in examples:
    client.create_example(
        inputs={"input": example["input"]},
        outputs={"output": example["expected_output"]},
        dataset_id=dataset.id
    )

# Custom evaluators
def answer_relevance(run, example):
    """Check if answer addresses the question."""
    answer = run.outputs.get("answer", "")
    question = example.inputs["input"]

    # Simple keyword overlap
    question_words = set(w.lower() for w in question.split() if len(w) > 3)
    answer_words = answer.lower().split()

    overlap = sum(1 for w in answer_words if w in question_words)
    score = min(1.0, overlap / max(len(question_words), 1))

    return {"key": "answer_relevance", "score": score}

def context_precision(run, example):
    """Check if context contains relevant information."""
    context = run.outputs.get("context", [])
    expected_answer = example.outputs.get("output", "")

    # Check if context contains relevant information
    context_text = " ".join(doc.page_content for doc in context)
    relevant_words = [w for w in expected_answer.lower().split() if len(w) > 4]

    found_words = sum(1 for word in relevant_words if word in context_text.lower())
    score = found_words / max(len(relevant_words), 1)

    return {"key": "context_precision", "score": score}

def answer_correctness(run, example):
    """Simple semantic similarity using word overlap."""
    answer = run.outputs.get("answer", "")
    expected = example.outputs.get("output", "")

    answer_words = set(answer.lower().split())
    expected_words = expected.lower().split()

    matches = sum(1 for w in expected_words if w in answer_words)
    score = matches / max(len(expected_words), 1)

    return {"key": "answer_correctness", "score": score}

# Run evaluation
chain = create_rag_chain()

def predict(inputs):
    """Wrapper function for evaluation."""
    result = chain.invoke({"input": inputs["input"]})
    return {
        "answer": result["answer"],
        "context": result["context"]
    }

eval_results = evaluate(
    predict,
    data=dataset_name,
    evaluators=[answer_relevance, context_precision, answer_correctness],
    experiment_prefix="rag-eval",
    metadata={
        "model": "claude-sonnet-4",
        "retriever": "in-memory-vector-store",
        "k": 3
    }
)

print("Evaluation Results:", eval_results)
```

## Metrics Tracked

- **Answer Relevance** - Answer addresses the question
- **Context Precision** - Retrieved context is relevant
- **Answer Correctness** - Answer matches expected output
- **Automatic Tracing** - Full chain execution trace in LangSmith UI

## LangSmith Features Used

1. **Dataset Management** - Version-controlled test cases
2. **Automatic Tracing** - See every step of chain execution
3. **Custom Evaluators** - Domain-specific metrics
4. **Experiment Tracking** - Compare across runs
5. **Production Monitoring** - Same evals in prod

## Best Practices

1. **Use datasets** for reproducible evaluations
2. **Tag experiments** with model/config metadata
3. **Combine built-in + custom** evaluators
4. **Monitor in production** with same evaluators
5. **Iterate on prompts** using LangSmith playground

## Viewing Results

Results automatically appear in LangSmith UI at:
`https://smith.langchain.com`

- Compare runs side-by-side
- Drill into individual traces
- Export results for analysis
- Set up automated regression tests
