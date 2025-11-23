---
title: Promptfoo
description: Open-source, language-agnostic framework for testing and evaluating LLM prompts. Compare outputs across models, providers, and prompt variations with simple YAML configs.
icon: i-heroicons-beaker
languages: [yaml]
---

## Supported Languages

::badge{icon="i-heroicons-code-bracket" variant="subtle"}
YAML
::

## Resources

::card-group
  ::card
  ---
  title: Homepage
  icon: i-heroicons-globe-alt
  to: https://www.promptfoo.dev
  target: _blank
  ---
  ::

  ::card
  ---
  title: Documentation
  icon: i-heroicons-book-open
  to: https://www.promptfoo.dev/docs/intro
  target: _blank
  ---
  ::

  ::card
  ---
  title: GitHub
  icon: i-simple-icons-github
  to: https://github.com/promptfoo/promptfoo
  target: _blank
  ---
  ::

  ::card
  ---
  title: NPM
  icon: i-simple-icons-npm
  to: https://www.npmjs.com/package/promptfoo
  target: _blank
  ---
  ::
::

## Deployment

::badge{icon="i-heroicons-computer-desktop" variant="subtle" color="primary"}
Local
::
::badge{icon="i-heroicons-cloud" variant="subtle" color="primary"}
Cloud (Optional)
::

## Key Features

- **Provider agnostic** - OpenAI, Anthropic, Azure, local models, custom providers
- **YAML-first** - Simple config files, no code required for basic evals
- **Rich assertions** - Keyword matching, semantic similarity, LLM-as-judge, regex
- **Visual comparison** - Interactive web UI for side-by-side output comparison
- **CI/CD ready** - CLI tool for automated regression testing
- **Adversarial testing** - Built-in red-teaming and jailbreak detection
- **Cost tracking** - Automatic token usage and cost monitoring
