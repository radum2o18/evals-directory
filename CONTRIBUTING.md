# Contributing to Evals Directory

Thank you for contributing! This guide will help you submit high-quality eval patterns.

## 📋 Submission Guidelines

### What Makes a Good Eval?

1. **Production-ready code** - Copy-paste and it works
2. **Real-world use case** - Solves actual problems
3. **Well-documented** - Clear explanations and examples
4. **Framework-specific** - Uses framework best practices

### Eval Structure

Each eval is a Markdown file in `/content/{framework}/{category}/{eval-name}.md`

## 🗂️ File Organization

```
content/
├── evalite/           # TypeScript only
│   ├── chatbot/
│   ├── rag/
│   ├── code-gen/
│   └── classification/
├── langsmith/         # TypeScript + Python
│   ├── chatbot/
│   └── rag/
├── braintrust/        # TypeScript + Python
│   ├── rag/
│   └── experimentation/
└── promptfoo/         # YAML configs
    ├── chatbot/
    └── prompt-engineering/
```

## 📝 Eval Template

```markdown
---
title: Your Eval Name
description: One-sentence description of what this eval does
use_case: chatbot | rag | code-gen | classification | prompt-engineering | experimentation
languages: [typescript, python, yaml]  # What language examples you provide
models: [gpt-4, claude-sonnet-4]  # Models tested
github_username: yourusername  # Your GitHub username (required)
created_at: 2025-11-25
difficulty: beginner | intermediate | advanced
tags: [accuracy, hallucination, testing]  # See tag reference below
---

# Your Eval Name

Brief overview of what this eval tests and why it matters.

## Use Case

Describe the real-world scenario where this eval is useful.

## Implementation

### TypeScript  <!-- If applicable -->

\```typescript
// Working code example
\```

### Python  <!-- If applicable -->

\```python
# Working code example
\```

### YAML  <!-- If promptfoo -->

\```yaml
# Config example
\```

## Metrics Tracked

- **Metric 1** - What it measures
- **Metric 2** - What it measures

## Best Practices

1. Tip 1
2. Tip 2
3. Tip 3
```

## 🏷️ Tags Reference

Tags describe **what your eval measures** and **how it's used**. Use only tags from this predefined list.

> **Important**: Tags are different from `use_case`. The `use_case` field describes *what type of system* you're evaluating (rag, chatbot, etc.). Tags describe *what aspects* the eval measures.

### Metrics (what the eval measures)

| Tag | Description |
|-----|-------------|
| `accuracy` | Overall correctness of outputs |
| `precision` | True positives vs false positives |
| `recall` | Finding all relevant items |
| `f1` | Harmonic mean of precision & recall |
| `latency` | Response time and performance |
| `relevance` | How relevant outputs are to inputs |
| `coherence` | Logical flow and consistency |
| `completeness` | Coverage of all required aspects |
| `correctness` | Factual accuracy of outputs |
| `coverage` | Breadth of test cases |

### Concerns (what issues it checks for)

| Tag | Description |
|-----|-------------|
| `hallucination` | Detecting made-up information |
| `safety` | Harmful or inappropriate content |
| `grounding` | Staying true to source material |
| `context` | Proper use of provided context |
| `memory` | Conversation history handling |
| `moderation` | Content policy compliance |

### Stage (when/how to use)

| Tag | Description |
|-----|-------------|
| `production` | Ready for production use |
| `testing` | For development/CI pipelines |
| `benchmarking` | Comparing models or configs |
| `streaming` | Streaming response evaluation |

### Example Tag Usage

```yaml
# RAG eval measuring hallucination and grounding
use_case: rag
tags: [hallucination, grounding, accuracy]

# Chatbot eval for production safety
use_case: chatbot  
tags: [safety, moderation, production]

# Classification metrics eval
use_case: classification
tags: [accuracy, precision, recall, f1]
```

## 🔤 Language Requirements by Framework

| Framework | Required Languages | Notes |
|-----------|-------------------|-------|
| **Evalite** | TypeScript only | Framework doesn't support Python |
| **LangSmith** | TypeScript + Python | Provide both examples |
| **Braintrust** | TypeScript + Python | Provide both examples |
| **Promptfoo** | YAML config | Language-agnostic |

## ✅ Checklist Before Submitting

- [ ] Frontmatter includes all required fields
- [ ] `languages` field matches code examples provided
- [ ] `tags` use only valid tags from the [Tags Reference](#️-tags-reference)
- [ ] Code examples are tested and working
- [ ] Description is clear and concise
- [ ] Use case explains when to use this eval
- [ ] Metrics section documents what's measured
- [ ] Best practices included (if applicable)
- [ ] No hardcoded API keys or secrets
- [ ] Follows existing eval formatting

## 📤 How to Submit

See [README.md](README.md) for more details.

## 🎨 Code Style

### TypeScript
- Use modern ES6+ syntax
- Include type annotations
- Async/await over promises

### Python
- Follow PEP 8
- Use type hints where helpful
- Clear function docstrings

### YAML
- 2-space indentation
- Comments for complex sections
- Valid YAML syntax

## 💡 Examples

### Good Eval Examples

- [Safety Filter](/content/evalite/chatbot/safety-filter.md) - Clear use case, comprehensive scorers
- [LangChain RAG Eval](/content/langsmith/rag/langchain-rag-eval.md) - Both TS + Python examples
- [Prompt Comparison](/content/promptfoo/prompt-engineering/prompt-comparison.md) - Full YAML config

### Common Issues

❌ **Missing language examples**
```yaml
languages: [typescript, python]  # Claims both
# But only has TypeScript code
```

✅ **Fixed**
```yaml
languages: [typescript, python]
# Includes both ### TypeScript and ### Python sections
```

❌ **Hardcoded secrets**
```typescript
const apiKey = "sk-1234567890";  // Don't do this
```

✅ **Fixed**
```typescript
const apiKey = process.env.OPENAI_API_KEY;
```
