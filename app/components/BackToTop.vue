<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { y } = useWindowScroll({ behavior: 'smooth' })

const isVisible = computed(() => y.value > 400)

const scrollToTop = () => {
  y.value = 0
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div v-show="isVisible" class="fixed bottom-6 right-6 z-50">
      <UButton
        icon="i-heroicons-chevron-up"
        color="neutral"
        variant="soft"
        size="lg"
        square
        class="shadow-lg"
        aria-label="Back to top"
        @click="scrollToTop"
      />
    </div>
  </Transition>
</template>
