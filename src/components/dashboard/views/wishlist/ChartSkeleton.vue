<template>
  <div role="status" aria-label="Carregando gráfico" class="grid min-h-72 place-items-center gap-6 p-6 sm:grid-cols-2">
    <AppSkeleton class="aspect-square w-full max-w-52 rounded-full" />
    <div class="w-full max-w-48 space-y-3">
      <AppSkeleton v-for="index in 5" :key="index" class="h-4 w-full" />
    </div>
  </div>
</template>

<script setup>
import AppSkeleton from '@/components/ui/AppSkeleton.vue';
</script>
