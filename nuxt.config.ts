import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/sitemap',
    '@nuxt/content',
    '@nuxthub/core',
    '@vueuse/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  hub: {
    database: true
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in', duration: 100 },
    layoutTransition: { name: 'layout', mode: 'out-in', duration: 100 }
  },

  fonts: {
    defaults: {
      fallbacks: {
        'serif': ['Georgia', 'Times New Roman', 'serif'],
        'sans-serif': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'monospace': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace']
      }
    },
    families: [
      { name: 'DM Sans', provider: 'google', preload: true, weights: [400, 500, 600, 700], display: 'fallback' },
      { name: 'JetBrains Mono', provider: 'google', preload: true, display: 'fallback' }
    ]
  },

  site: {
    url: 'https://evals.directory'
  },

  sitemap: {
    autoLastmod: true,
    excludeAppSources: ['nuxt:pages']
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark'
          },
          langs: ['python', 'yaml', 'typescript', 'javascript', 'json', 'bash']
        }
      }
    }
  },

  $development: {
    hub: {
      projectUrl: process.env.NUXT_HUB_PROJECT_URL,
      remote: true
    }
  }
})