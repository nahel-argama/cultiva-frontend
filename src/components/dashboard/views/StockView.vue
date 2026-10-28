<template>
  <section class="space-y-6 pb-6">
    <StockToolbar
      :search="searchTerm"
      @update-search="onSearch"
      :loading="isLoading"
      @open-modal="isCreateModalOpen = true"
    />

    <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="isLoading" role="status" class="text-sm text-slate-500">Carregando...</p>
    <StockGrid v-else :items="products" @updated="refreshStock" />

    <AppPagination
      v-model="currentPage"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      :loading="isLoading"
      @change="load"
    />

    <StockCreateModal v-model="isCreateModalOpen" @submit="onProductCreated" />
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import StockCreateModal from './stock/StockCreateModal.vue';
import StockGrid from './stock/StockGrid.vue';
import StockToolbar from './stock/StockToolbar.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import { listProducts } from '@/services/product';
import { usePaginatedList } from '@/composables/usePaginatedList';
import { useToast } from '@/composables/useToast';
import { capitalize } from '@/utils/string';

const toast = useToast();

const isCreateModalOpen = ref(false);
const searchTerm = ref('');
const { items: products, totalItems, currentPage, itemsPerPage, isLoading, error, load } = usePaginatedList((params) => listProducts({ ...params, search: searchTerm.value }), 12);

onMounted(() => load(1));

async function onProductCreated(newProduct) {
  await load(currentPage.value);

  const name = newProduct.name ? capitalize(newProduct.name) : 'Produto';
  toast.success(`"${name}" foi adicionado ao estoque com sucesso!`, 'Adicionado');
}

function refreshStock() {
  return load(currentPage.value);
}

let searchTimer = null;

function onSearch(value) {
  searchTerm.value = value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => load(1), 400);
}

onUnmounted(() => clearTimeout(searchTimer));
</script>
