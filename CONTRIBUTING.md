# Contributing to Evals Directory

Thank you for your interest in contributing! This guide will help you submit your AI evaluation patterns.

## How to Submit an Eval

### 1. Fork & Clone

```bash
git clone https://github.com/yourusername/evals-directory
cd evals-directory
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Create Your Eval

Create a new markdown file in the appropriate directory:

```text
content/
├── evalite/
│   ├── rag/
│   ├── chatbot/
│   ├── code-gen/
│   └── classification/
```

### 4. Eval Template

```markdown
---
title: Your Eval Title
description: Brief description of what this eval tests
use_case: rag | chatbot | code-gen | classification | other
models: [gpt-4, claude-sonnet-4, gemini-pro]
author: YourName
github: yourgithub
created_at: 2025-01-15
difficulty: beginner | intermediate | advanced
tags: [tag1, tag2, tag3]
---
```

# Contributing to Evals Directory

Thank you for your interest in contributing! This guide will help you submit your AI evaluation patterns.

## How to Submit an Eval

### 1. Fork & Clone

```bash
git fork https://github.com/yourusername/evals-directory
git clone https://github.com/yourusername/evals-directory
cd evals-directory
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Create Your Eval

Create a new markdown file in the appropriate directory:

```
content/
├── evalite/
│   ├── rag/          ← RAG evaluations
│   ├── chatbot/      ← Chatbot evaluations
│   ├── code-gen/     ← Code generation evaluations
│   └── classification/ ← Classification evaluations
```

### 4. Eval Template

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

### 5. Test Locally

```bash
pnpm dev
```

Visit `http://localhost:3000` to see your eval in the directory.

### 6. Submit PR

```bash
git checkout -b add-my-eval
git add content/evalite/yourCategory/your-eval.md
git commit -m "Add: Your Eval Title"
git push origin add-my-eval
```

Then open a Pull Request on GitHub.

## Guidelines

### Content Quality

- **Clear**: Explain the eval purpose clearly
- **Complete**: Include working code examples
- **Tested**: Verify the code actually works
- **Documented**: Add comments where helpful

### Code Standards

- Use TypeScript for Evalite examples
- Follow the existing code style
- Include error handling where appropriate
- Add meaningful variable names

### Naming

- **File names**: kebab-case (e.g., `hallucination-detection.md`)
- **Titles**: Title Case (e.g., "Hallucination Detection")
- **Tags**: lowercase (e.g., `rag`, `hallucination`)

### Categories

Choose the most appropriate category:

- **rag**: Retrieval-Augmented Generation patterns
- **chatbot**: Conversational AI evaluations
- **code-gen**: Code generation quality checks
- **classification**: Classification task metrics
- **other**: Anything else

## Review Process

1. Automated checks run on PR
2. Maintainer reviews content quality
3. Feedback provided if changes needed
4. Merge once approved

## Questions?

Open an issue or reach out on [Discord/Twitter/etc].

## License

By contributing, you agree your submissions are under the MIT License.

