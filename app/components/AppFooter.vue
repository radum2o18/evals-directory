<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const footerLinks: NavigationMenuItem[] = [
  {
    label: 'About',
    to: '/about'
  },
  {
    label: 'Contribute',
    to: 'https://github.com/radum2o18/evals-directory',
    target: '_blank'
  }
]

const now = new Date()
</script>

<template>
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">Made with 💚 ~ © <NuxtTime :datetime="now" year="numeric" /> Radu M. All rights reserved.</p>
    </template>

    <UNavigationMenu :items="footerLinks" variant="link" />

    <template #right>
      <UButton
        icon="i-simple-icons-x"
        color="neutral"
        variant="ghost"
        to="https://x.com/radum2o18"
        target="_blank"
        aria-label="Follow on X"
      />
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/radum2o18/evals-directory"
        target="_blank"
        aria-label="GitHub"
      />
    </template>
  </UFooter>
</template>
