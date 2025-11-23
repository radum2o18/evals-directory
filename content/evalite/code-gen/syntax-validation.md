---
title: Syntax Validation
description: Validates that generated code is syntactically correct and compiles without errors
use_case: code-gen
languages: [typescript]
models: [gpt-4, claude-sonnet-4, codellama]
author: Radu
github: radu
created_at: 2025-01-20
difficulty: beginner
tags: [code-gen, syntax, validation, compilation, linting]
---

# Syntax Validation

Tests whether AI-generated code is syntactically valid, compiles successfully, and passes linting rules.

## Use Case

Foundation metric for any code generation system. Invalid syntax makes code unusable, so this is a critical quality gate.

## Implementation

```typescript
import { evalite } from "evalite";
import Anthropic from "@anthropic-ai/sdk";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import path from "path";

const execAsync = promisify(exec);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function validateTypeScript(code: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const tempFile = path.join("/tmp", `test-${Date.now()}.ts`);

  try {
    await writeFile(tempFile, code);

    // Check syntax with TypeScript compiler
    await execAsync(`npx tsc --noEmit ${tempFile}`);

    return { valid: true, errors: [] };
  } catch (error: any) {
    const errors = error.stdout || error.stderr || error.message;
    return {
      valid: false,
      errors: errors.split("\n").filter((line: string) => line.includes("error"))
    };
  } finally {
    await unlink(tempFile).catch(() => {});
  }
}

async function validatePython(code: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const tempFile = path.join("/tmp", `test-${Date.now()}.py`);

  try {
    await writeFile(tempFile, code);

    // Check syntax with Python
    await execAsync(`python3 -m py_compile ${tempFile}`);

    return { valid: true, errors: [] };
  } catch (error: any) {
    return {
      valid: false,
      errors: [error.message]
    };
  } finally {
    await unlink(tempFile).catch(() => {});
  }
}

evalite("Syntax Validation", {
  data: async () => [
    {
      language: "typescript",
      prompt: "Write a function that reverses a string",
      validator: validateTypeScript
    },
    {
      language: "typescript",
      prompt: "Create a class for a TodoItem with title, completed status, and a toggle method",
      validator: validateTypeScript
    },
    {
      language: "python",
      prompt: "Write a function to calculate fibonacci numbers",
      validator: validatePython
    },
    {
      language: "python",
      prompt: "Create a class that implements a basic stack with push, pop, and peek methods",
      validator: validatePython
    },
    {
      language: "typescript",
      prompt: "Write a generic function that filters an array based on a predicate",
      validator: validateTypeScript
    }
  ],
  task: async (input) => {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: `Write ${input.language} code: ${input.prompt}\n\nRespond with ONLY the code, no explanation.`
      }]
    });

    let code = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    // Extract code from markdown blocks if present
    const codeBlockMatch = code.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      code = codeBlockMatch[1];
    }

    return code.trim();
  },
  scorers: [
    // Syntactically valid
    async (output, { input }) => {
      const result = await input.validator(output);

      return {
        name: "Syntax Valid",
        score: result.valid ? 1 : 0,
        metadata: {
          errors: result.errors.slice(0, 3) // First 3 errors
        }
      };
    },

    // No syntax errors
    async (output, { input }) => {
      const result = await input.validator(output);

      return {
        name: "Error-Free",
        score: result.errors.length === 0 ? 1 : 0,
        metadata: {
          error_count: result.errors.length
        }
      };
    },

    // Extracted from markdown properly
    (output) => {
      // Check if code doesn't contain markdown artifacts
      const hasMarkdownArtifacts =
        output.includes("```") ||
        output.includes("Here's") ||
        output.includes("This code");

      return {
        name: "Clean Code Output",
        score: hasMarkdownArtifacts ? 0.5 : 1
      };
    },

    // Has proper structure (function/class definition)
    (output, { input }) => {
      const hasStructure =
        input.language === "typescript"
          ? /function |const \w+ = |class \w+|export /i.test(output)
          : /def \w+|class \w+:/i.test(output);

      return {
        name: "Proper Structure",
        score: hasStructure ? 1 : 0
      };
    },

    // Includes type annotations (TypeScript only)
    (output, { input }) => {
      if (input.language !== "typescript") return { name: "Type Annotations", score: 1 };

      const hasTypes = /: (string|number|boolean|void|\w+\[\])/i.test(output);

      return {
        name: "Type Annotations",
        score: hasTypes ? 1 : 0.5
      };
    }
  ]
});
```

## Metrics Tracked

- **Syntax Valid** - Code compiles without errors
- **Error-Free** - No compilation warnings or errors
- **Clean Code Output** - No markdown/explanation artifacts
- **Proper Structure** - Has function/class definitions
- **Type Annotations** - Uses types (TypeScript)

## Best Practices

1. **Language-specific validators** for accurate syntax checking
2. **Temp file execution** in sandboxed environment
3. **Extract from markdown** handle wrapped code blocks
4. **Timeout limits** prevent infinite compilation
5. **Track error patterns** to improve prompts

## Common Syntax Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Missing types | Model omits type annotations | Add "with types" to prompt |
| Markdown wrapping | Model explains code | Prompt "ONLY code, no explanation" |
| Incomplete code | Context limit hit | Reduce max_tokens or simplify prompt |
| Import errors | Missing context | Provide full context in prompt |
| Syntax errors | Model hallucination | Use stronger model or few-shot examples |
