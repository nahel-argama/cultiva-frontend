<template>
  <div class="flex flex-col gap-3 rounded-2xl border border-[#dce4d8] bg-white/75 p-4 sm:flex-row sm:items-end">
    <div class="min-w-0 flex-1">
      <AppSelect
        v-model="selectedProductId"
        label="Produto"
        placeholder="Todos os produtos · busque para filtrar"
        :options="options"
        label-key="name"
        value-key="id"
        :loading="isLoading"
        :filter-locally="false"
        autocomplete
        @search="search"
      />
    </div>
    <button
      v-if="selectedProductId"
      type="button"
      class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
      @click="selectedProductId = ''"
    >Limpar filtro</button>
    <p class="pb-2 text-xs text-slate-500 sm:max-w-44 sm:text-right">Estado aparece junto ao produtor, sem filtrar a safra.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import AppSelect from '@/components/ui/AppSelect.vue';
import { useProductSearch } from '@/composables/useProductSearch';

const props = defineProps({
  modelValue: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);
const { options, isLoading, search } = useProductSearch();

const selectedProductId = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', String(value ?? '')),
});
</script>
