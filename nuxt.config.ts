// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/sitemap',
    'nuxt-og-image',
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
    families: [
      { name: 'DM Sans', provider: 'google', preload: true, weights: [400, 500, 600, 700] },
      { name: 'JetBrains Mono', provider: 'google', preload: true }
    ]
  },

  site: {
    url: 'https://evals.directory'
  },

  sitemap: {
    autoLastmod: true,
    excludeAppSources: ['nuxt:pages']
  },

  ogImage: {
    zeroRuntime: false,
    defaults: {
      component: 'OgImageDefault',
      renderer: 'satori'
    },
    runtimeCacheStorage: false,
    compatibility: {
      prerender: {
        chromium: false
      },
      runtime: {
        chromium: false
      }
    }
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
  }
})