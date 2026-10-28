<template>
  <section class="space-y-6 pb-6">
    <WishlistToolbar
      :search="searchTerm"
      :loading="isLoading"
      @update-search="onSearch"
      @open-modal="isCreateModalOpen = true"
    />

    <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="isLoading" role="status" class="text-sm text-slate-500">Carregando...</p>
    <WishlistGrid v-else :items="wishlistItems" @remove="removeProduct" />

    <AppPagination
      v-model="currentPage"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      :loading="isLoading"
      @change="load"
    />

    <WishlistCreateModal v-model="isCreateModalOpen" @submit="onItemCreated" />
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import WishlistCreateModal from './wishlist/WishlistCreateModal.vue';
import WishlistGrid from './wishlist/WishlistGrid.vue';
import WishlistToolbar from './wishlist/WishlistToolbar.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import { listWishlistItems } from '@/services/wishlist';
import { usePaginatedList } from '@/composables/usePaginatedList';
import { useToast } from '@/composables/useToast';
import { capitalize } from '@/utils/string';

// ── Composables ───────────────────────────────────────────────────────────────

const toast = useToast();

// ── State ─────────────────────────────────────────────────────────────────────

const searchTerm = ref('');
const isCreateModalOpen = ref(false);

const { items: wishlistItems, totalItems, currentPage, itemsPerPage, isLoading, error, load } = usePaginatedList(
  (params) => listWishlistItems({ ...params, productName: searchTerm.value }),
  12,
);

onMounted(() => load(1));

// ── Search (debounced, delegado à API) ────────────────────────────────────────

let searchTimer = null;

function onSearch(value) {
  searchTerm.value = value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => load(1), 400);
}

onUnmounted(() => clearTimeout(searchTimer));

// ── Actions ───────────────────────────────────────────────────────────────────

/** Recarrega a página mantendo busca, ordenação e totais do backend. */
async function onItemCreated(newItem) {
  await load(currentPage.value);

  const productName = newItem.product_name ? capitalize(newItem.product_name) : 'Produto';
  toast.success(`"${productName}" foi adicionado com sucesso!`, 'Adicionado');
}

function removeProduct() {
  return load(currentPage.value);
}
</script>
