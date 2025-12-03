---
title: Functionality Test
description: Verifies that generated code executes correctly and produces expected outputs
use_case: code-gen
languages: [typescript]
models: [gpt-4, claude-sonnet-4, codellama]
github_username: radum2o18
difficulty: intermediate
tags: [correctness, testing]
---

# Functionality Test

Executes generated code against test cases to verify correctness, edge case handling, and expected behavior.

## Use Case

Critical for code generation systems where correctness is paramount. Ensures code not only compiles but actually works as intended.

## Implementation

::code-collapse

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

interface TestCase {
  input: any;
  expected: any;
  description: string;
}

async function runTypeScriptTests(code: string, testCases: TestCase[]): Promise<{
  passed: number;
  failed: number;
  results: Array<{ test: string; passed: boolean; actual?: any; error?: string }>;
}> {
  const tempFile = path.join("/tmp", `test-${Date.now()}.ts`);

  // Wrap code with test execution
  const testCode = `
${code}

const testCases = ${JSON.stringify(testCases)};
const results: any[] = [];

for (const test of testCases) {
  try {
    const actual = reverseString ? reverseString(test.input) :
                   fibonacci ? fibonacci(test.input) :
                   isPalindrome ? isPalindrome(test.input) :
                   undefined;

    const passed = JSON.stringify(actual) === JSON.stringify(test.expected);
    results.push({ test: test.description, passed, actual });
  } catch (error: any) {
    results.push({ test: test.description, passed: false, error: error.message });
  }
}

console.log(JSON.stringify(results));
`;

  try {
    await writeFile(tempFile, testCode);

    const jsFile = tempFile.replace(".ts", ".js");
    await execAsync(`npx tsc --target ES2020 --module commonjs ${tempFile}`);
    const { stdout } = await execAsync(`node ${jsFile}`);

    const results = JSON.parse(stdout);
    const passed = results.filter((r: any) => r.passed).length;

    return {
      passed,
      failed: results.length - passed,
      results
    };
  } finally {
    await unlink(tempFile).catch(() => {});
    await unlink(tempFile.replace(".ts", ".js")).catch(() => {});
  }
}

evalite("Functionality Test", {
  data: async () => [
    {
      prompt: "Write a function called reverseString that reverses a string",
      testCases: [
        { input: "hello", expected: "olleh", description: "Basic string" },
        { input: "", expected: "", description: "Empty string" },
        { input: "a", expected: "a", description: "Single character" },
        { input: "racecar", expected: "racecar", description: "Palindrome" }
      ]
    },
    {
      prompt: "Write a function called fibonacci that returns the nth fibonacci number (0-indexed)",
      testCases: [
        { input: 0, expected: 0, description: "Fib(0)" },
        { input: 1, expected: 1, description: "Fib(1)" },
        { input: 5, expected: 5, description: "Fib(5)" },
        { input: 10, expected: 55, description: "Fib(10)" }
      ]
    },
    {
      prompt: "Write a function called isPalindrome that checks if a string is a palindrome",
      testCases: [
        { input: "racecar", expected: true, description: "Valid palindrome" },
        { input: "hello", expected: false, description: "Not a palindrome" },
        { input: "A man a plan a canal Panama", expected: true, description: "Ignore case and spaces" },
        { input: "", expected: true, description: "Empty string" }
      ]
    }
  ],
  task: async (input) => {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: `${input.prompt}

Write clean, working TypeScript code. Include proper types. Respond with ONLY the code.`
      }]
    });

    let code = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    // Extract code from markdown
    const codeBlockMatch = code.match(/```(?:typescript|ts)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      code = codeBlockMatch[1];
    }

    return { code, testCases: input.testCases };
  },
  scorers: [
    // Test Pass Rate
    async (output, { input }) => {
      const testResults = await runTypeScriptTests(output.code, output.testCases);

      const passRate = testResults.passed / output.testCases.length;

      return {
        name: "Test Pass Rate",
        score: passRate,
        metadata: {
          passed: `${testResults.passed}/${output.testCases.length}`,
          failures: testResults.results.filter(r => !r.passed).map(r => r.test)
        }
      };
    },

    // All Tests Pass
    async (output, { input }) => {
      const testResults = await runTypeScriptTests(output.code, output.testCases);

      return {
        name: "All Tests Pass",
        score: testResults.failed === 0 ? 1 : 0,
        metadata: {
          failed_tests: testResults.failed
        }
      };
    },

    // Edge Cases Handled
    async (output, { input }) => {
      const testResults = await runTypeScriptTests(output.code, output.testCases);

      // Count how many edge case tests passed (typically the last 2)
      const edgeCaseResults = testResults.results.slice(-2);
      const edgeCasesPassed = edgeCaseResults.filter(r => r.passed).length;

      return {
        name: "Edge Cases",
        score: edgeCasesPassed / edgeCaseResults.length,
        metadata: {
          edge_cases_passed: edgeCasesPassed
        }
      };
    },

    // No Runtime Errors
    async (output, { input }) => {
      const testResults = await runTypeScriptTests(output.code, output.testCases);

      const hasRuntimeErrors = testResults.results.some(r => r.error);

      return {
        name: "No Runtime Errors",
        score: hasRuntimeErrors ? 0 : 1,
        metadata: {
          errors: testResults.results.filter(r => r.error).map(r => r.error)
        }
      };
    }
  ]
});
```

::

## Metrics Tracked

- **Test Pass Rate** (0-1) - Percentage of test cases passed
- **All Tests Pass** (0/1) - Binary: all tests must pass
- **Edge Cases** (0-1) - Edge case handling quality
- **No Runtime Errors** (0/1) - Code executes without errors

## Best Practices

1. **Comprehensive test suites** cover happy path + edge cases
2. **Isolated execution** sandbox each test run
3. **Timeout handling** prevent infinite loops
4. **Error capture** provide helpful error messages
5. **Property-based testing** for thorough coverage

## Test Coverage Strategy

| Test Type | Purpose | Examples |
|-----------|---------|----------|
| Happy path | Basic functionality | Normal inputs, expected outputs |
| Edge cases | Boundary conditions | Empty input, single element, max values |
| Error cases | Invalid input handling | Null, undefined, wrong types |
| Performance | Efficiency requirements | Large inputs, time limits |

## Example Test Suite

```typescript
const testCases = [
  // Happy path
  { input: "hello", expected: "olleh", description: "Basic" },

  // Edge cases
  { input: "", expected: "", description: "Empty" },
  { input: "a", expected: "a", description: "Single" },

  // Complex cases
  { input: "Hello, World!", expected: "!dlroW ,olleH", description: "Punctuation" }
];
```
