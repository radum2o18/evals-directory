# Evals Directory

A curated directory of AI evaluation patterns across multiple frameworks. Find, share, and discover evaluation patterns for RAG, chatbots, code generation, and classification tasks.

## Features

- 🔍 **Search & Discover**: Find evaluation patterns by framework, use case, or tags
- 📚 **Multi-Framework Support**: Patterns for Evalite, Promptfoo, LangSmith, Braintrust, and more
- 🎯 **Use Case Categories**: RAG, chatbot, code generation, classification
- 🚀 **Ready to Use**: Copy-paste code examples with working implementations

## Supported Frameworks

- **Evalite** - TypeScript-native eval framework (Active)
- **Promptfoo** - CLI-first evaluation with YAML configs (Coming Soon)
- **LangSmith** - LangChain ecosystem evaluation platform (Coming Soon)
- **Braintrust** - Enterprise AI evaluation and monitoring (Coming Soon)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/radum2o18/evals-directory
cd evals-directory

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to explore the directory.

## Contributing

Thank you for your interest in contributing! This guide will help you submit your AI evaluation patterns.

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
use_case: rag | chatbot | code-gen | classification | other
models: [gpt-4, claude-sonnet-4, gemini-pro]
author: YourName
github: yourgithubusername
created_at: 2025-01-15  # YYYY-MM-DD format
difficulty: beginner | intermediate | advanced
tags: [tag1, tag2, tag3]
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

#### 5. Test Locally

```bash
pnpm dev
```

Visit `http://localhost:3000` to see your eval in the directory.

#### 6. Commit & Push

```bash
git checkout -b add-my-eval
git add content/evalite/yourCategory/your-eval.md
git commit -m "Add: Your Eval Title"
git push origin add-my-eval
```

#### 7. Submit PR

Then open a Pull Request on GitHub.

### Guidelines

#### Content Quality

- **Clear**: Explain the eval purpose clearly
- **Complete**: Include working code examples
- **Tested**: Verify the code actually works
- **Documented**: Add comments where helpful

#### Code Standards

- Use TypeScript for Evalite examples
- Follow the existing code style
- Include error handling where appropriate
- Add meaningful variable names

#### Naming

- **File names**: kebab-case (e.g., `hallucination-detection.md`)
- **Titles**: Title Case (e.g., "Hallucination Detection")
- **Tags**: lowercase (e.g., `rag`, `hallucination`)

#### Categories

Choose the most appropriate category:

- **rag**: Retrieval-Augmented Generation patterns
- **chatbot**: Conversational AI evaluations
- **code-gen**: Code generation quality checks
- **classification**: Classification task metrics
- **other**: Anything else

### Review Process

1. Automated checks run on PR
2. Maintainer reviews content quality
3. Feedback provided if changes needed
4. Merge once approved

### Questions?

Open an issue or reach out on [Discord/Twitter/etc].

## Tech Stack

- [Nuxt 4](https://nuxt.com) - Vue framework
- [Nuxt UI](https://ui.nuxt.com) - UI component library
- [Nuxt Content](https://content.nuxt.com) - Content management
- [NuxtHub](https://nuxthub.com) - Backend infrastructure

## License

MIT

By contributing, you agree your submissions are under the MIT License.
