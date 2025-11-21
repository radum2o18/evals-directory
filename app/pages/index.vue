<script setup lang="ts">
const { data: home } = await useAsyncData(() => queryCollection('content').path('/').first())

useSeoMeta({
  title: home.value?.title,
  description: home.value?.description
})

definePageMeta({
  layout: 'default'
})
</script>

<template>
  <UPage>
    <Ucard v-if="home">
      <ContentRenderer :value="home.body" />
    </Ucard>
    <div v-else>Home not found</div>
  </UPage>
</template>
