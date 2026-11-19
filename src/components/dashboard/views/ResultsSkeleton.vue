<template>
  <div role="status" aria-label="Carregando resultados" class="grid gap-4" :class="cards && 'sm:grid-cols-2 xl:grid-cols-3'">
    <div v-for="index in (cards ? 6 : 5)" :key="index" class="rounded-3xl border border-slate-200 bg-white p-5" aria-hidden="true">
      <template v-if="cards">
        <AppSkeleton v-if="offerCards" class="mb-3 aspect-[2/1] w-full rounded-xl" />
        <AppSkeleton class="mb-3 h-5 w-2/3" />
        <AppSkeleton class="h-4 w-1/3" />
        <AppSkeleton v-if="!offerCards" class="mt-5 aspect-[4/3] w-full rounded-[22px]" />
        <AppSkeleton v-else class="mt-4 h-10 w-full rounded-xl" />
      </template>
      <div v-else class="flex items-center justify-between gap-4">
        <div class="flex-1 space-y-2">
          <AppSkeleton class="h-5 w-20 rounded-full" />
          <AppSkeleton class="h-6 w-2/3 max-w-48" />
          <AppSkeleton class="h-3 w-1/3 max-w-24" />
        </div>
        <AppSkeleton class="h-5 w-16 rounded-full sm:w-24" />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppSkeleton from '@/components/ui/AppSkeleton.vue';

defineProps({ cards: Boolean, offerCards: Boolean });
</script>
