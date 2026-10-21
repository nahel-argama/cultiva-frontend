<template>
  <nav v-if="totalItems > itemsPerPage" class="flex items-center justify-between gap-4" aria-label="Paginação">
    <p class="text-sm text-slate-500">{{ startItem }}–{{ endItem }} de {{ totalItems }}</p>
    <div class="flex gap-2">
      <button type="button" class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50" :disabled="currentPage <= 1" @click="goTo(currentPage - 1)">Anterior</button>
      <button type="button" class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50" :disabled="currentPage >= pageCount" @click="goTo(currentPage + 1)">Próxima</button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  totalItems: { type: Number, default: 0 },
  itemsPerPage: { type: Number, default: 12 },
});
const emit = defineEmits(['update:modelValue', 'change']);
const currentPage = computed(() => Math.max(1, props.modelValue));
const pageCount = computed(() => Math.max(1, Math.ceil(props.totalItems / props.itemsPerPage)));
const startItem = computed(() => props.totalItems ? (currentPage.value - 1) * props.itemsPerPage + 1 : 0);
const endItem = computed(() => Math.min(currentPage.value * props.itemsPerPage, props.totalItems));
function goTo(page) {
  const next = Math.max(1, Math.min(page, pageCount.value));
  emit('update:modelValue', next);
  emit('change', next);
}
</script>
