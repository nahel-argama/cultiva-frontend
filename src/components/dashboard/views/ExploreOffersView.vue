<template>
  <section class="space-y-6 pb-6">
    <OffersHeader :search="searchTerm" @update-search="onSearch" />

    <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="isLoading" role="status" class="text-sm text-slate-500">Carregando...</p>
    <OffersGrid
      v-else
      :items="offers"
      :cart-quantities="cartQuantitiesByProduct"
      :adding-product-id="addingProductId"
      empty-title="Nenhuma oferta encontrada"
      empty-description="Não há ofertas disponíveis no momento."
      @add-to-cart="handleAddToCart"
    />

    <AppPagination
      v-model="currentPage"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      :loading="isLoading"
      @change="load"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import OffersGrid from './offers/OffersGrid.vue';
import OffersHeader from './offers/OffersHeader.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import { listProducts } from '@/services/product';
import { usePaginatedList } from '@/composables/usePaginatedList';
import { useCartStore } from '@/stores/cart';
import { useToast } from '@/composables/useToast';
import { capitalize } from '@/utils/string';

const searchTerm = ref('');
const { items: offers, totalItems, currentPage, itemsPerPage, isLoading, error, load } = usePaginatedList((params) => listProducts({ ...params, search: searchTerm.value }), 12);
const addingProductId = ref(null);

const cartStore = useCartStore();
const toast = useToast();

watch(() => cartStore.purchaseRevision, () => load());

const cartQuantitiesByProduct = computed(() => {
  const quantities = {};

  for (const order of cartStore.pendingOrdersList) {
    const items = Array.isArray(order?.items) ? order.items : [];

    for (const item of items) {
      const productId = Number(item?.product);
      if (!productId || Number.isNaN(productId)) {
        continue;
      }

      const currentQty = Number(quantities[productId] || 0);
      quantities[productId] = currentQty + Number(item?.quantity || 0);
    }
  }

  return quantities;
});

onMounted(async () => {
  await Promise.allSettled([load(1), cartStore.syncPendingOrders()]);
});

function getProducerLabel(product) {
  if (product?.producer_name) {
    return product.producer_name;
  }

  const producer = product?.producer;

  if (producer && typeof producer === 'object') {
    return producer.name || producer.nome_fantasia || `produtor #${producer.id ?? ''}`;
  }

  if (producer !== undefined && producer !== null) {
    return `produtor #${producer}`;
  }

  return 'produtor';
}

async function handleAddToCart(payload) {
  const product = payload?.product;
  const quantity = Number(payload?.quantity || 0);

  if (!product || quantity <= 0) {
    return;
  }

  addingProductId.value = product.id;

  try {
    await cartStore.addProductToCart(product, quantity);
    const productName = capitalize(product.name || 'Produto');
    const producerLabel = getProducerLabel(product);

    toast.success(
      `${productName} adicionado ao pedido do ${producerLabel}.`,
      'Carrinho atualizado',
    );
  } catch (error) {
    toast.error(
      error?.message || 'Não foi possível adicionar o produto ao carrinho.',
      'Erro ao adicionar',
    );
  } finally {
    addingProductId.value = null;
  }
}

let searchTimer = null;

function onSearch(value) {
  searchTerm.value = value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => load(1), 400);
}

onUnmounted(() => clearTimeout(searchTimer));
</script>
