// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxthub/core',
    '@vueuse/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  hub: {
    database: true
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in', duration: 150 },
    layoutTransition: { name: 'layout', mode: 'out-in', duration: 150 }
  },
  fonts: {
    families: [
      { name: 'Inter', provider: 'google' },
      { name: 'JetBrains Mono', provider: 'google' }
    ]
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark'
          }
        }
      }
    }
  }
})