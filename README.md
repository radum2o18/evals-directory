# Evals Directory

A curated directory of AI evaluation patterns across multiple frameworks. Find, share, and discover evaluation patterns for RAG, chatbots, code generation, and classification tasks.

## Features

- 🔍 **Search & Discover**: Find evaluation patterns by framework, use case, or tags
- 📚 **Multi-Framework Support**: Patterns for Evalite, Promptfoo, LangSmith, Braintrust, and more
- 🎯 **Use Case Categories**: RAG, chatbot, code generation, classification
- 🚀 **Ready to Use**: Copy-paste code examples with working implementations

## Supported Frameworks

- **Evalite** - TypeScript-native eval framework
- **Braintrust** - Enterprise AI evaluation and monitoring
- **LangSmith** - LangChain ecosystem evaluation platform
- **Promptfoo** - CLI-first evaluation with YAML configs

## Contributing

This guide will help you submit your AI evaluation patterns.

### How to Submit an Eval

#### 1. Fork & Clone

First, fork the repository on GitHub, then:

```bash
git clone https://github.com/radum2o18/evals-directory
cd evals-directory
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Create Your Eval

Create a new markdown file in the appropriate directory:

```
content/
├── evalite/
│   ├── rag/          ← RAG evaluations
│   ├── chatbot/      ← Chatbot evaluations
│   ├── code-gen/     ← Code generation evaluations
│   └── classification/ ← Classification evaluations
```

#### 4. Eval Template

Use this frontmatter template:

```markdown
---
title: Your Eval Title
description: Brief description of what this eval tests
use_case: rag | chatbot | code-gen | classification | prompt-engineering | experimentation | other
languages: [typescript, python, yaml]
models: [gpt-4, claude-sonnet-4, gemini-pro]
github_username: yourgithubusername
created_at: 2025-11-25
difficulty: beginner | intermediate | advanced
tags: [accuracy, hallucination, production]  # See CONTRIBUTING.md for valid tags
---

# Your Eval Title

Detailed explanation of your evaluation pattern.

## Use Case

Why this evaluation is important...

## Implementation

\`\`\`typescript
import { evalite } from "evalite";

evalite("Your Eval", {
  data: async () => [
    // Your test cases
  ],
  task: async (input) => {
    // Your task implementation
  },
  scorers: [
    // Your scoring functions
  ]
});
\`\`\`

## Variations

Different ways to use this pattern...

## Related Patterns

Links to similar evaluations...
```

#### 5. Submit PR

Create a pull request.

### Guidelines

#### Categories

Choose the most appropriate category:

- **rag**: Retrieval-Augmented Generation patterns
- **chatbot**: Conversational AI evaluations
- **code-gen**: Code generation quality checks
- **classification**: Classification task metrics
- **other**: Anything else
