export interface Framework {
  name: string
  slug: string
  language: string
  type: 'local' | 'cloud' | 'agnostic'
  color: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  icon: string
  description: string
  website: string
  fileExtension: string
  status: 'active' | 'coming-soon'
  docsUrl?: string
}

export const useFrameworks = () => {
  const frameworks: Record<string, Framework> = {
    evalite: {
      name: 'Evalite',
      slug: 'evalite',
      language: 'TypeScript',
      type: 'local',
      color: 'primary',
      icon: 'i-simple-icons-typescript',
      description: 'TypeScript-native eval framework built on Vitest',
      website: 'https://v1.evalite.dev/',
      fileExtension: '.eval.ts',
      status: 'active',
      docsUrl: 'https://v1.evalite.dev/guides/quickstart/'
    },
    promptfoo: {
      name: 'Promptfoo',
      slug: 'promptfoo',
      language: 'YAML/CLI',
      type: 'local',
      color: 'info',
      icon: 'i-heroicons-command-line',
      description: 'CLI-first evaluation framework with YAML configs',
      website: 'https://promptfoo.dev',
      fileExtension: '.yaml',
      status: 'coming-soon',
      docsUrl: 'https://promptfoo.dev/docs'
    },
    langsmith: {
      name: 'LangSmith',
      slug: 'langsmith',
      language: 'Python',
      type: 'cloud',
      color: 'secondary',
      icon: 'i-simple-icons-python',
      description: 'LangChain ecosystem evaluation platform',
      website: 'https://smith.langchain.com',
      fileExtension: '.py',
      status: 'coming-soon',
      docsUrl: 'https://docs.smith.langchain.com'
    },
    braintrust: {
      name: 'Braintrust',
      slug: 'braintrust',
      language: 'Python/TS',
      type: 'cloud',
      color: 'warning',
      icon: 'i-heroicons-light-bulb',
      description: 'Enterprise AI evaluation and monitoring',
      website: 'https://braintrust.dev',
      fileExtension: '.py',
      status: 'coming-soon',
      docsUrl: 'https://braintrust.dev/docs'
    }
  }

  const getFrameworkBySlug = (slug: string): Framework | undefined => {
    return frameworks[slug]
  }

  const activeFrameworks = computed(() =>
    Object.values(frameworks).filter(f => f.status === 'active')
  )

  const comingSoonFrameworks = computed(() =>
    Object.values(frameworks).filter(f => f.status === 'coming-soon')
  )

  return {
    frameworks,
    getFrameworkBySlug,
    activeFrameworks,
    comingSoonFrameworks
  }
}
