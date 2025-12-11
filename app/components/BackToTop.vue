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
    enter-from-class="opacity-0 scale-90"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-90"
  >
    <div v-show="isVisible" class="fixed bottom-20 right-6 z-40">
      <UTooltip text="Back to top">
        <UButton
          icon="i-heroicons-chevron-up"
          color="neutral"
          variant="soft"
          size="md"
          square
          class="shadow-md"
          aria-label="Back to top"
          @click="scrollToTop"
        />
      </UTooltip>
    </div>
  </Transition>
</template>
