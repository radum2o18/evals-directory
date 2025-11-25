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
author: Your Name
github: your-github-username
created_at: YYYY-MM-DD
difficulty: beginner | intermediate | advanced
tags: [relevant, tags, here]
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
- [ ] Code examples are tested and working
- [ ] Description is clear and concise
- [ ] Use case explains when to use this eval
- [ ] Metrics section documents what's measured
- [ ] Best practices included (if applicable)
- [ ] No hardcoded API keys or secrets
- [ ] Follows existing eval formatting

## 📤 How to Submit

### Option 1: GitHub Web UI (Easiest)

1. Navigate to the appropriate folder on GitHub
2. Click "Add file" → "Create new file"
3. Name it `your-eval-name.md`
4. Paste your content
5. Click "Propose new file"
6. Create pull request

### Option 2: Fork & Clone (Recommended for multiple evals)

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/radum2o18/evals-directory
cd evals-directory

# Create a branch
git checkout -b add-eval-your-eval-name

# Add your eval
mkdir -p content/framework/category
# Create content/framework/category/your-eval.md

# Commit and push
git add .
git commit -m "Add: Your Eval Name for Framework"
git push origin add-eval-your-eval-name

# Open PR on GitHub
```

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

## 🔍 Validation

Your PR will automatically check:
- ✅ Frontmatter schema validation
- ✅ Required languages present
- ✅ No secrets in code
- ✅ Markdown formatting

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

## 🙋 Need Help?

- Open an issue with questions
- Check existing evals for examples
- Tag @radum2o18 in discussions

## 📜 License

By contributing, you agree your submissions will be licensed under the same license as this project.
