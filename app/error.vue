<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()
</script>

<template>
    <UError :error="{ statusCode: error.statusCode, statusMessage: error.statusMessage }" />
</template>


