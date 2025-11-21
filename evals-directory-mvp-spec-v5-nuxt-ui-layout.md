# Evals.Directory - Complete MVP Specification v5
## Nuxt UI Docs-Style Multi-Framework AI Evaluation Directory

**The npm registry for AI evals** - Built using the exact same architecture as Nuxt UI documentation.

---

## Table of Contents

1. [Vision & Inspiration](#vision--inspiration)
2. [Layout Architecture](#layout-architecture)
3. [Nuxt UI Components Strategy](#nuxt-ui-components-strategy)
4. [Page Structure](#page-structure)
5. [Framework Support](#framework-support)
6. [Content Organization](#content-organization)
7. [Implementation Details](#implementation-details)
8. [Setup & Deployment](#setup--deployment)

---

## Vision & Inspiration

### What We're Building
A professional, framework-agnostic directory where developers discover, compare, and share AI evaluation patterns across all major testing frameworks (Evalite, Promptfoo, LangSmith, Braintrust, etc.).

### Design Inspiration
**Exact match for Nuxt UI Documentation layout:**
- Three-column responsive layout
- Left sidebar: Auto-generated navigation tree
- Center: Content with breadcrumbs
- Right sidebar: Table of contents
- Top bar: Search, framework switcher, GitHub link
- Mobile: Collapsible sidebars

### Why This Layout Wins

✅ **Zero Custom Navigation Code** - Use battle-tested Nuxt UI components  
✅ **Familiar to Developers** - Everyone knows the Nuxt docs layout  
✅ **Auto-Generated Everything** - Nav, TOC, and search come free  
✅ **Mobile-First** - Responsive behavior built-in  
✅ **Accessible** - ARIA labels and keyboard navigation included  
✅ **Maintainable** - Add frameworks without touching layout code

---

## Layout Architecture

### Three-Column Structure

```
┌────────────────────────────────────────────────────────────┐
│  Header: [Logo] [Framework Tabs] [Search] [GitHub]         │
├────────────────────────────────────────────────────────────┤
│                               [Framework Tabs]             │
|____________________________________________________________|
│  ┌──────────┬────────────────────────┬──────────────┐      │
│  │          │                        │              │      │
│  │  Left    │     Main Content       │   Right      │      │
│  │  Nav     │                        │   TOC        │      │
│  │  Tree    │   [Breadcrumbs]        │              │      │
│  │          │                        │   • Heading  │      │
│  │ • RAG    │   # Eval Title         │   • Heading  │      │
│  │   • Hall │                        │   • Heading  │      │
│  │   • Ctx  │   Description text     │              │      │
│  │ • Chat   │                        │              │      │
│  │   • Tone │   ```typescript        │              │      │
│  │   • Safe │   // eval code         │              │      │
│  │          │   ```                  │              │      │
│  │          │                        │              │      │
│  │          │   [Copy] [Download]    │              │      │
│  │          │                        │              │      │
│  └──────────┴────────────────────────┴──────────────┘      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Responsive Behavior

- **Desktop (>1024px)**: All three columns visible
- **Tablet (768px-1024px)**: Nav & TOC collapse to drawer
- **Mobile (<768px)**: Nav & TOC in slide-over panels

---

## Nuxt UI Components Strategy

### Core Components Used

We leverage **Nuxt UI's Content components** that power their own documentation:

#### 1. **UHeader** - Top Navigation Bar
```vue
<UHeader>
  <template #left>
    <NuxtLink to="/">evals.directory</NuxtLink>
  </template>
  <template #center>
    <UTabs :items="frameworkTabs" />
  </template>
  <template #right>
    <UContentSearch />
    <UButton icon="i-simple-icons-github" />
  </template>
</UHeader>
```

#### 2. **UContentSearch** - Full-Text Search
```vue
<UContentSearch
  v-model:search-term="searchTerm"
  :files="searchSections"
  :navigation="navigation"
  :fuse="{
    keys: ['title', 'description', 'body'],
    threshold: 0.3,
    resultLimit: 20
  }"
/>
```
- Searches across all markdown content
- Fuzzy search with Fuse.js
- Keyboard shortcuts (⌘K / Ctrl+K)
- Highlights matching text

#### 3. **ContentNavigation** - Left Sidebar
```vue
<ContentNavigation v-slot="{ navigation }">
  <UNavigationTree
    :links="navigation"
    :default-open="true"
  />
</ContentNavigation>
```
- Auto-generates tree from `_dir.yml` files
- Collapsible sections
- Active link highlighting
- Keyboard navigation

#### 4. **UNavigationTree** - Nav Tree Renderer
```vue
<UNavigationTree
  :links="navigation"
  :default-open="level <= 1"
  :multiple="false"
/>
```
- Renders hierarchical navigation
- Icons per section
- Badge support
- Click to expand/collapse

#### 5. **ContentToc** - Right Sidebar Table of Contents
```vue
<ContentToc :links="page.body?.toc?.links" />
```
- Auto-extracts headings from markdown
- Smooth scroll to sections
- Highlights active heading
- Nested heading support

#### 6. **UTabs** - Framework Switcher
```vue
<UTabs
  v-model="selectedFramework"
  :items="frameworkTabs"
  orientation="horizontal"
/>
```

#### 7. **UBreadcrumb** - Page Context
```vue
<UBreadcrumb :links="breadcrumbLinks" />
```

### Why These Components?

| Component | Replaces | Time Saved |
|-----------|----------|------------|
| `ContentNavigation` + `UNavigationTree` | Custom nav builder | 2-3 days |
| `UContentSearch` | Custom search UI + Fuse.js setup | 1-2 days |
| `ContentToc` | Manual TOC extraction | 1 day |
| `UHeader` | Custom header layout | 4-6 hours |
| `UTabs` | Custom tab switcher | 2-3 hours |

**Total time saved: ~5-7 days of development**

---

## Page Structure

### 1. Layout Component (`app/layouts/docs.vue`)

```vue
<template>
  <div>
    <!-- Fixed Header -->
    <UHeader sticky>
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2">
          <UIcon name="i-heroicons-beaker" class="w-6 h-6" />
          <span class="font-bold text-xl">evals.directory</span>
        </NuxtLink>
      </template>
      
      <template #center>
        <!-- Framework Tabs -->
        <UTabs
          v-model="selectedFramework"
          :items="frameworkTabs"
          class="hidden lg:flex"
        />
      </template>
      
      <template #right>
        <UContentSearch :files="files" :navigation="navigation" />
        <UButton
          to="https://github.com/yourusername/evals-directory"
          target="_blank"
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
        />
        <UColorModeButton />
      </template>
    </UHeader>
    
    <!-- Main Container -->
    <UContainer>
      <div class="lg:grid lg:grid-cols-[250px_1fr] lg:gap-8 xl:grid-cols-[250px_1fr_250px]">
        
        <!-- Left Sidebar: Navigation -->
        <aside class="hidden lg:block">
          <div class="sticky top-[73px] -ml-4 h-[calc(100vh-73px)] overflow-y-auto py-8 pl-4">
            <ContentNavigation v-slot="{ navigation }">
              <UNavigationTree
                :links="filterNavByFramework(navigation)"
                :default-open="true"
                :multiple="false"
              />
            </ContentNavigation>
          </div>
        </aside>
        
        <!-- Main Content Area -->
        <main class="min-w-0">
          <slot />
        </main>
        
        <!-- Right Sidebar: Table of Contents -->
        <aside class="hidden xl:block">
          <div class="sticky top-[73px] -mr-4 h-[calc(100vh-73px)] overflow-y-auto py-8 pr-4">
            <div class="space-y-3">
              <p class="text-sm font-semibold">On this page</p>
              <ContentToc :links="page?.body?.toc?.links" />
            </div>
          </div>
        </aside>
        
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { navPageFromPath } = useContentHelpers()

// Get current page for TOC
const { data: page } = await useAsyncData(
  route.path,
  () => queryContent(route.path).findOne()
)

// Framework tabs
const { frameworks, getFrameworkBySlug } = useFrameworks()
const selectedFramework = ref('evalite')

const frameworkTabs = computed(() => 
  Object.values(frameworks).map(fw => ({
    label: fw.name,
    to: `/${fw.slug}`,
    icon: fw.icon,
    badge: fw.status === 'coming-soon' ? 'Soon' : undefined
  }))
)

// Watch route to update selected framework
watch(() => route.path, (path) => {
  const framework = path.split('/')[1]
  if (getFrameworkBySlug(framework)) {
    selectedFramework.value = framework
  }
}, { immediate: true })

// Filter navigation by current framework
function filterNavByFramework(navigation: any[]) {
  if (!selectedFramework.value) return navigation
  
  return navigation.filter(item => 
    item._path?.includes(`/${selectedFramework.value}`)
  )
}

// Content search data
const { data: navigation } = await useAsyncData('navigation', () => 
  fetchContentNavigation()
)

const { data: files } = await useLazyAsyncData('search', () => 
  queryContent()
    .where({ _extension: 'md' })
    .find(),
  {
    default: () => [],
    server: false
  }
)
</script>
```

### 2. Individual Eval Page (`app/pages/[framework]/[...slug].vue`)

```vue
<template>
  <UContainer>
    <article v-if="page" class="prose prose-primary dark:prose-invert max-w-none">
      <!-- Breadcrumbs -->
      <UBreadcrumb :links="breadcrumbs" class="mb-4" />
      
      <!-- Framework Badge -->
      <div class="flex items-center gap-2 mb-4">
        <UBadge
          :color="frameworkColor"
          :label="frameworkName"
          :icon="frameworkIcon"
        />
        <UBadge
          v-if="page.use_case"
          color="neutral"
          variant="subtle"
          :label="page.use_case"
        />
      </div>
      
      <!-- Title & Description -->
      <h1>{{ page.title }}</h1>
      <p class="lead">{{ page.description }}</p>
      
      <!-- Metadata -->
      <div class="not-prose flex flex-wrap gap-4 my-6 text-sm">
        <div v-if="page.models" class="flex items-center gap-2">
          <UIcon name="i-heroicons-cpu-chip" class="w-4 h-4" />
          <span>{{ page.models.join(', ') }}</span>
        </div>
        <div v-if="page.author" class="flex items-center gap-2">
          <UIcon name="i-heroicons-user" class="w-4 h-4" />
          <span>{{ page.author }}</span>
        </div>
        <div v-if="page.created_at" class="flex items-center gap-2">
          <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
          <span>{{ formatDate(page.created_at) }}</span>
        </div>
      </div>
      
      <!-- Main Content (Markdown rendered) -->
      <ContentRenderer :value="page" class="my-8" />
      
      <!-- Action Buttons -->
      <div class="not-prose flex gap-3 mt-8">
        <UButton
          icon="i-heroicons-clipboard-document"
          label="Copy Code"
          color="primary"
          @click="copyCode"
        />
        <UButton
          icon="i-heroicons-arrow-down-tray"
          label="Download .eval.ts"
          color="neutral"
          variant="outline"
          @click="downloadEval"
        />
        <UButton
          v-if="page.github"
          :to="`https://github.com/${page.github}`"
          target="_blank"
          icon="i-simple-icons-github"
          label="View Author"
          color="neutral"
          variant="ghost"
        />
      </div>
      
      <!-- Navigation: Previous / Next -->
      <ContentSurround :path="page._path" class="mt-16">
        <template #default="{ surround }">
          <div class="flex justify-between">
            <UButton
              v-if="surround?.prev"
              :to="surround.prev._path"
              icon="i-heroicons-arrow-left"
              color="neutral"
              variant="ghost"
            >
              {{ surround.prev.title }}
            </UButton>
            <div v-else />
            <UButton
              v-if="surround?.next"
              :to="surround.next._path"
              icon-trailing="i-heroicons-arrow-right"
              color="neutral"
              variant="ghost"
            >
              {{ surround.next.title }}
            </UButton>
          </div>
        </template>
      </ContentSurround>
    </article>
    
    <!-- 404 State -->
    <div v-else class="text-center py-16">
      <h1 class="text-4xl font-bold mb-4">Eval Not Found</h1>
      <p class="text-muted mb-8">This evaluation pattern doesn't exist yet.</p>
      <UButton to="/submit" icon="i-heroicons-plus">
        Submit This Eval
      </UButton>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const route = useRoute()
const { getFrameworkBySlug } = useFrameworks()

// Fetch page content
const { data: page } = await useAsyncData(`content-${route.path}`, () => 
  queryContent(route.path).findOne()
)

// Framework info
const framework = computed(() => 
  getFrameworkBySlug(route.params.framework as string)
)

const frameworkName = computed(() => framework.value?.name)
const frameworkIcon = computed(() => framework.value?.icon)
const frameworkColor = computed(() => framework.value?.color)

// Breadcrumbs
const breadcrumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  return parts.map((part, index) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1),
    to: '/' + parts.slice(0, index + 1).join('/')
  }))
})

// Copy code to clipboard
const { copy } = useClipboard()
async function copyCode() {
  const codeBlock = page.value?.body?.children?.find(
    (child: any) => child.tag === 'pre'
  )
  if (codeBlock) {
    await copy(codeBlock.props.code)
    // Show toast notification
  }
}

// Download eval as file
function downloadEval() {
  const content = page.value?.body?.children?.find(
    (child: any) => child.tag === 'pre'
  )?.props.code
  
  if (content) {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${route.params.slug}.eval.ts`
    a.click()
    URL.revokeObjectURL(url)
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// SEO
useHead({
  title: page.value?.title,
  meta: [
    { name: 'description', content: page.value?.description }
  ]
})
</script>
```

### 3. Homepage (`app/pages/index.vue`)

```vue
<template>
  <UContainer class="py-12">
    <!-- Hero Section -->
    <div class="text-center mb-16">
      <h1 class="text-6xl font-bold mb-4">
        <span class="font-mono">evals.directory</span>
      </h1>
      <p class="text-2xl text-muted mb-8">
        The npm registry for AI evaluation patterns
      </p>
      <div class="flex justify-center gap-4">
        <UButton
          to="/evalite"
          size="lg"
          icon="i-heroicons-magnifying-glass"
        >
          Browse Evals
        </UButton>
        <UButton
          to="/submit"
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-heroicons-plus"
        >
          Submit an Eval
        </UButton>
      </div>
    </div>
    
    <!-- Framework Grid -->
    <div class="mb-16">
      <h2 class="text-3xl font-bold mb-8 text-center">Supported Frameworks</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UCard
          v-for="framework in frameworks"
          :key="framework.slug"
          :to="`/${framework.slug}`"
          :ui="{ body: { padding: 'p-6' } }"
        >
          <div class="flex items-center gap-3 mb-3">
            <UIcon :name="framework.icon" class="w-8 h-8" :class="`text-${framework.color}-500`" />
            <h3 class="text-xl font-semibold">{{ framework.name }}</h3>
          </div>
          <p class="text-sm text-muted mb-3">{{ framework.description }}</p>
          <div class="flex items-center gap-2">
            <UBadge :color="framework.color" size="xs">
              {{ framework.language }}
            </UBadge>
            <UBadge
              v-if="framework.status === 'coming-soon'"
              color="neutral"
              size="xs"
            >
              Coming Soon
            </UBadge>
          </div>
        </UCard>
      </div>
    </div>
    
    <!-- Stats Section -->
    <div class="grid grid-cols-3 gap-8 text-center mb-16">
      <div>
        <div class="text-4xl font-bold mb-2">{{ stats.totalEvals }}</div>
        <div class="text-muted">Evaluation Patterns</div>
      </div>
      <div>
        <div class="text-4xl font-bold mb-2">{{ stats.frameworks }}</div>
        <div class="text-muted">Frameworks</div>
      </div>
      <div>
        <div class="text-4xl font-bold mb-2">{{ stats.contributors }}</div>
        <div class="text-muted">Contributors</div>
      </div>
    </div>
    
    <!-- Recent Additions -->
    <div>
      <h2 class="text-3xl font-bold mb-8">Recently Added</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="eval in recentEvals"
          :key="eval._path"
          :to="eval._path"
          :ui="{ body: { padding: 'p-6' } }"
        >
          <div class="flex items-center gap-2 mb-3">
            <UBadge
              :color="getFrameworkBySlug(eval._path.split('/')[1])?.color"
              size="xs"
            >
              {{ getFrameworkBySlug(eval._path.split('/')[1])?.name }}
            </UBadge>
            <UBadge color="neutral" variant="subtle" size="xs">
              {{ eval.use_case }}
            </UBadge>
          </div>
          <h3 class="text-lg font-semibold mb-2">{{ eval.title }}</h3>
          <p class="text-sm text-muted line-clamp-2">{{ eval.description }}</p>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const { frameworks, getFrameworkBySlug } = useFrameworks()

// Fetch recent evals
const { data: recentEvals } = await useAsyncData('recent-evals', () =>
  queryContent()
    .where({ _extension: 'md' })
    .sort({ created_at: -1 })
    .limit(6)
    .find()
)

// Compute stats
const { data: allEvals } = await useAsyncData('all-evals', () =>
  queryContent()
    .where({ _extension: 'md' })
    .find()
)

const stats = computed(() => ({
  totalEvals: allEvals.value?.length || 0,
  frameworks: Object.keys(frameworks).length,
  contributors: new Set(allEvals.value?.map((e: any) => e.author)).size || 0
}))
</script>
```

---

## Framework Support

### Framework Registry (`app/composables/useFrameworks.ts`)

```typescript
export interface Framework {
  name: string
  slug: string
  language: string
  type: 'local' | 'cloud' | 'agnostic'
  color: 'green' | 'blue' | 'purple' | 'orange' | 'pink'
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
      color: 'green',
      icon: 'i-simple-icons-typescript',
      description: 'TypeScript-native eval framework built on Vitest',
      website: 'https://evalite.dev',
      fileExtension: '.eval.ts',
      status: 'active',
      docsUrl: 'https://evalite.dev/docs'
    },
    promptfoo: {
      name: 'Promptfoo',
      slug: 'promptfoo',
      language: 'YAML/CLI',
      type: 'local',
      color: 'blue',
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
      color: 'purple',
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
      color: 'orange',
      icon: 'i-heroicons-light-bulb',
      description: 'Enterprise AI evaluation and monitoring',
      website: 'https://braintrust.dev',
      fileExtension: '.py',
      status: 'coming-soon',
      docsUrl: 'https://braintrust.dev/docs'
    },
    custom: {
      name: 'Custom',
      slug: 'custom',
      language: 'Agnostic',
      type: 'agnostic',
      color: 'pink',
      icon: 'i-heroicons-puzzle-piece',
      description: 'Framework-agnostic evaluation patterns',
      website: '',
      fileExtension: '',
      status: 'coming-soon'
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
```

---

## Content Organization

### Directory Structure

```
content/
├── evalite/
│   ├── _dir.yml                    # Framework metadata
│   ├── rag/
│   │   ├── _dir.yml                # Category metadata
│   │   ├── hallucination.md
│   │   ├── context-relevance.md
│   │   └── answer-accuracy.md
│   ├── chatbot/
│   │   ├── _dir.yml
│   │   ├── tone-analysis.md
│   │   ├── safety-filter.md
│   │   └── response-time.md
│   ├── code-gen/
│   │   ├── _dir.yml
│   │   ├── syntax-validity.md
│   │   └── test-coverage.md
│   └── classification/
│       ├── _dir.yml
│       ├── accuracy.md
│       └── f1-score.md
├── promptfoo/
│   └── _dir.yml                    # Coming soon
├── langsmith/
│   └── _dir.yml                    # Coming soon
└── index.md                        # Homepage content
```

### Navigation Metadata (`_dir.yml`)

**Framework level** (`content/evalite/_dir.yml`):
```yaml
title: Evalite
description: TypeScript-native evaluation patterns
icon: i-simple-icons-typescript
navigation: true
```

**Category level** (`content/evalite/rag/_dir.yml`):
```yaml
title: RAG Evals
description: Retrieval-Augmented Generation evaluation patterns
icon: i-heroicons-document-text
navigation: true
```

### Markdown Frontmatter

```yaml
---
title: RAG Hallucination Detection
description: Tests if RAG responses stick to provided context without hallucinating
use_case: rag
models: [gpt-4, claude-sonnet-4, gemini-pro]
author: Radu
github: radu
created_at: 2025-01-15
difficulty: intermediate
tags: [rag, hallucination, context, accuracy]
---
```

### Content Example

```markdown
---
title: RAG Hallucination Detection
description: Tests if RAG responses stick to provided context without hallucinating
use_case: rag
models: [gpt-4, claude-sonnet-4]
author: Radu
created_at: 2025-01-15
---

# RAG Hallucination Detection

This evaluation tests whether your RAG system stays faithful to the provided context or invents information not present in the source material.

## Use Case

When building RAG applications, one of the most critical failures is **hallucination** - when the model generates plausible-sounding but incorrect information that isn't supported by your retrieved documents.

## How It Works

1. Provides context with specific facts
2. Asks questions that require those facts
3. Checks if the answer contains only information from context
4. Flags any hallucinated content

## Implementation

\`\`\`typescript
import { evalite } from "evalite";

evalite("RAG Hallucination Detection", {
  data: async () => [
    {
      input: {
        context: "The Eiffel Tower was completed in 1889 for the World's Fair.",
        question: "When was the Eiffel Tower built?"
      },
      expected: "1889"
    },
    {
      input: {
        context: "Python was created by Guido van Rossum in 1991.",
        question: "Who created Python?"
      },
      expected: "Guido van Rossum"
    },
    {
      input: {
        context: "The company has 500 employees across 3 offices.",
        question: "What's the company's revenue?"
      },
      expected: null // Should refuse to answer
    }
  ],
  task: async (input) => {
    // Your RAG implementation
    const response = await yourRAGSystem(input.context, input.question);
    return response;
  },
  scorers: [
    (output, { input, expected }) => {
      if (expected === null) {
        // Should decline to answer
        const declined = output.toLowerCase().includes("don't know") ||
                        output.toLowerCase().includes("not mentioned") ||
                        output.toLowerCase().includes("no information");
        return {
          name: "Refuses Unknown",
          score: declined ? 1 : 0
        };
      }
      
      // Should contain expected info
      const hasExpected = output.includes(expected);
      return {
        name: "Has Expected Info",
        score: hasExpected ? 1 : 0
      };
    }
  ]
});
\`\`\`

## Variations

- **Strict mode**: Penalize ANY deviation from context
- **Soft mode**: Allow reasonable inferences
- **Citation checking**: Require sources for all claims

## Related Patterns

- [Context Relevance](./context-relevance) - Check if context is actually relevant
- [Answer Accuracy](./answer-accuracy) - Verify factual correctness
```

---

## Implementation Details

### Configuration (`nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/content'
  ],
  
  // Nuxt UI configuration
  ui: {
    icons: ['heroicons', 'simple-icons']
  },
  
  // Nuxt Content configuration
  content: {
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark'
      },
      langs: [
        'typescript',
        'javascript',
        'python',
        'yaml',
        'json',
        'bash'
      ]
    },
    navigation: {
      fields: ['title', 'description', 'icon', 'use_case', 'models', 'author']
    },
    markdown: {
      anchorLinks: true,
      toc: {
        depth: 3,
        searchDepth: 3
      }
    }
  },
  
  // App metadata
  app: {
    head: {
      title: 'Evals Directory',
      titleTemplate: '%s | Evals Directory',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Find and share AI evaluation patterns across all major frameworks'
        }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  
  // Static site generation
  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  },
  
  devtools: { enabled: true }
})
```

### Content Configuration (`content.config.ts`)

```typescript
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    evals: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        use_case: z.enum(['rag', 'chatbot', 'code-gen', 'classification', 'other']),
        models: z.array(z.string()).optional(),
        author: z.string(),
        github: z.string().optional(),
        created_at: z.string(), // ISO date format: YYYY-MM-DD
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        tags: z.array(z.string()).optional()
      })
    })
  }
})
```

---

## Setup & Deployment

### Installation

```bash
# 1. Create Nuxt project
npx nuxi init evals-directory
cd evals-directory

# 2. Install dependencies
pnpm add @nuxt/ui @nuxt/content

# 3. Create directory structure
mkdir -p app/{layouts,pages,components,composables}
mkdir -p content/evalite/{rag,chatbot,code-gen,classification}

# 4. Create config files
touch nuxt.config.ts content.config.ts

# 5. Create first eval
cat > content/evalite/rag/hallucination.md << 'EOF'
---
title: RAG Hallucination Detection
description: Tests if RAG responses stick to provided context
use_case: rag
models: [gpt-4, claude-sonnet-4]
author: YourName
created_at: 2025-01-15
---

# Your eval content here...
EOF

# 6. Create _dir.yml files
cat > content/evalite/_dir.yml << 'EOF'
title: Evalite
icon: i-simple-icons-typescript
navigation: true
EOF

cat > content/evalite/rag/_dir.yml << 'EOF'
title: RAG Evals
description: Retrieval-Augmented Generation patterns
icon: i-heroicons-document-text
navigation: true
EOF

# 7. Run dev server
pnpm dev
```

### Deployment to Cloudflare Pages

```bash
# Generate static site
pnpm generate

# Deploy
wrangler pages deploy dist
```

### Environment Variables

No environment variables needed for MVP! Everything is static.

---

## Rollout Phases

### Phase 1: Evalite Launch (Week 1) ✅
- Complete Nuxt UI docs-style layout
- 10 seed Evalite evals across all categories
- Full navigation, search, and TOC
- Mobile responsive
- Deploy to Cloudflare Pages
- Announce on X, Evalite Discord

### Phase 2: Promptfoo (Month 2)
- Add `content/promptfoo/` directory
- 10 Promptfoo YAML examples
- Framework comparison page
- Cross-framework search

### Phase 3: LangSmith (Month 3)
- Add `content/langsmith/` directory
- 10 LangSmith Python examples
- Agent workflow evals
- Migration guides between frameworks

### Phase 4: Expansion (Month 4+)
- Braintrust support
- Custom/agnostic patterns
- Community features (upvotes, comments)
- Pro features (run evals in browser)

---

## Success Metrics

### Week 1 (Launch)
- ✅ 10+ seed evals
- 🎯 500+ unique visitors
- 🎯 2+ GitHub PR submissions
- 🎯 50+ GitHub stars

### Month 2
- 🎯 30+ evals across 2 frameworks
- 🎯 2,000+ unique visitors
- 🎯 10+ community contributors

### Month 3
- 🎯 50+ evals across 3 frameworks
- 🎯 5,000+ unique visitors
- 🎯 Featured on framework docs

---

## Why This Architecture Wins

### ✅ Developer Experience
1. **Zero Custom Code** - Use Nuxt UI components as-is
2. **Auto-Generated** - Nav, TOC, search all automatic
3. **Type-Safe** - Full TypeScript support
4. **Hot Reload** - Instant dev server updates
5. **Battle-Tested** - Same stack as Nuxt docs

### ✅ User Experience
1. **Familiar Layout** - Developers already know this UI
2. **Fast** - Static generation, instant page loads
3. **Searchable** - Full-text search with ⌘K
4. **Navigable** - Clear hierarchy with breadcrumbs
5. **Accessible** - ARIA labels, keyboard nav

### ✅ Maintainability
1. **Simple** - Pure markdown files
2. **Git-Based** - Full version history
3. **Scalable** - Add frameworks without refactoring
4. **Documented** - Official Nuxt patterns
5. **Community** - Help available on Nuxt Discord

---

## FAQ

**Q: Why copy Nuxt UI docs instead of building custom?**  
A: Same reason npm registry looks like npm registry - proven UX. Plus we save 5-7 days of dev time.

**Q: Can I customize the styling?**  
A: Yes! Nuxt UI uses Tailwind. Override any component with custom classes or theme configuration.

**Q: How do I add a new framework?**  
A: 1) Create folder in `content/`, 2) Add to `useFrameworks()`, 3) Create seed evals. That's it.

**Q: What if navigation breaks?**  
A: Check your `_dir.yml` files. Ensure `navigation: true` is set and titles are present.

**Q: Can users preview evals before submitting?**  
A: Yes! Fork the repo, run `pnpm dev`, see changes locally, then submit PR.

**Q: Do I need a CMS?**  
A: No! Markdown files + GitHub = your CMS. Simple and powerful.

---

## Resources

- **Nuxt UI Docs**: https://ui.nuxt.com
- **Nuxt Content Docs**: https://content.nuxt.com
- **Nuxt UI GitHub**: https://github.com/nuxt/ui
- **Content Components**: https://content.nuxt.com/components
- **Example Implementation**: https://github.com/nuxt/ui/tree/v4/docs

---

## Ready to Ship

This is your complete blueprint for **evals.directory**:

✅ Professional Nuxt UI docs-style layout  
✅ Auto-generated navigation, search, TOC  
✅ Multi-framework architecture ready  
✅ Type-safe content with Zod schemas  
✅ GitHub PR submission workflow  
✅ 100% static hosting (free)  
✅ Mobile-first responsive design  
✅ Dark mode support  
✅ SEO optimized  

**Timeline: Ship Phase 1 in 5-7 days** 🚀

Start with: `npx nuxi init evals-directory`
