<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <UApp>
    <UMain class="min-h-screen flex items-center justify-center">
      <UContainer>
        <div class="text-center space-y-8">
          <!-- Error Icon -->
          <div class="flex justify-center">
            <div class="rounded-full bg-error/10 p-6">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-error" />
            </div>
          </div>

          <!-- Error Code -->
          <div class="text-6xl font-bold text-highlighted">
            {{ error.statusCode }}
          </div>

          <!-- Error Message -->
          <div class="space-y-2">
            <h1 class="text-2xl font-semibold text-highlighted">
              {{ error.statusMessage || 'Page not found' }}
            </h1>
            <p class="text-muted max-w-md mx-auto">
              {{ error.statusCode === 404 
                ? "The page you're looking for doesn't exist or has been moved."
                : "Something went wrong. Please try again later."
              }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap justify-center gap-4">
            <UButton
              color="primary"
              size="lg"
              icon="i-heroicons-home"
              @click="handleError"
            >
              Go home
            </UButton>
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              icon="i-heroicons-arrow-left"
              @click="$router.back()"
            >
              Go back
            </UButton>
          </div>
        </div>
      </UContainer>
    </UMain>
  </UApp>
</template>


