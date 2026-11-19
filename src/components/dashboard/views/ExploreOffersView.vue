<template>
  <section class="space-y-6 pb-6">
    <OffersHeader
      :search="searchTerm"
      :filters="filters"
      :can-reset="hasFilters"
      @update-search="onSearch"
      @update-filter="updateFilter"
      @reset="resetFilters"
    />

    <p v-if="!error && (!isLoading || visibleOffers.length)" :class="{ invisible: isLoading }" role="status" class="px-1 text-sm font-medium text-slate-600">
      {{ totalItems.toLocaleString('pt-BR') }} {{ totalItems === 1 ? 'oferta encontrada' : 'ofertas encontradas' }}
    </p>

    <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="isLoading && !visibleOffers.length" role="status" class="text-sm text-slate-500">Carregando...</p>
    <OffersGrid
      v-else
      :items="visibleOffers"
      :aria-busy="isLoading"
      :selected-ids="selectedOffers.map((offer) => offer.id)"
      @toggle-compare="toggleCompare"
      :cart-quantities="cartQuantitiesByProduct"
      :adding-product-id="addingProductId"
      empty-title="Nenhuma oferta encontrada"
      :empty-description="hasFilters ? 'Altere ou limpe os filtros para ver mais ofertas.' : 'Não há ofertas disponíveis no momento.'"
      @add-to-cart="handleAddToCart"
    />

    <AppPagination
      v-model="currentPage"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      :loading="isLoading"
      @change="load"
    />
    <Transition
      enter-active-class="motion-safe:transition motion-safe:duration-200"
      enter-from-class="opacity-0 motion-safe:translate-y-2 motion-safe:scale-95"
      leave-active-class="motion-safe:transition motion-safe:duration-150"
      leave-to-class="opacity-0 motion-safe:translate-y-2"
    >
      <aside
        v-if="selectedOffers.length"
        aria-label="Ofertas selecionadas"
        class="sticky bottom-4 z-20 mx-auto flex w-fit max-w-full items-center gap-2 rounded-full border border-emerald-100 bg-white/95 p-2 pr-2.5 text-emerald-950 shadow-xl shadow-emerald-950/15 backdrop-blur-md sm:gap-3 sm:p-3"
      >
        <span class="hidden size-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-800 sm:grid" aria-hidden="true">
          <ArrowsRightLeftIcon class="size-4" />
        </span>
        <button
          v-for="(offer, index) in selectedOffers"
          :key="offer.id"
          type="button"
          :aria-label="`Remover oferta ${index + 1} de ${offer.name} da comparação`"
          :title="offer.name"
          class="inline-flex min-h-10 min-w-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-emerald-600 sm:gap-1.5 sm:px-4"
          @click="toggleCompare(offer)"
        >
          <span class="max-w-44 truncate">{{ offer.name }}</span>
          <XMarkIcon class="size-4 shrink-0 text-emerald-700" aria-hidden="true" />
        </button>
        <p role="status" :class="selectedOffers.length === 2 ? 'sr-only' : 'px-1 text-sm text-slate-700'">
          {{ selectedOffers.length === 1 ? 'Escolha mais uma' : '2 ofertas selecionadas' }}
        </p>
        <button
          v-if="selectedOffers.length === 2"
          type="button"
          aria-label="Comparar ofertas"
          class="min-h-10 shrink-0 rounded-full bg-emerald-800 px-3.5 text-sm font-bold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-emerald-600 sm:px-5"
          @click="openComparison"
        >
          Comparar
        </button>
      </aside>
    </Transition>

    <OfferComparisonDialog
      v-if="comparisonOpen"
      :comparison="comparison"
      :loading="comparisonLoading"
      :error="comparisonError"
      @close="closeComparison"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { ArrowsRightLeftIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import OfferComparisonDialog from './offers/OfferComparisonDialog.vue';
import OffersGrid from './offers/OffersGrid.vue';
import OffersHeader from './offers/OffersHeader.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import { compareOffers, listProducts } from '@/services/product';
import { usePaginatedList } from '@/composables/usePaginatedList';
import { useCartStore } from '@/stores/cart';
import { useToast } from '@/composables/useToast';
import { capitalize } from '@/utils/string';

const defaultFilters = { wishlist: 'all', maxDistanceKm: '', sort: 'nearest' };
const filters = ref({ ...defaultFilters });
const searchTerm = ref('');
const selectedOffers = ref([]);
const comparisonProductId = computed(() => selectedOffers.value[0]?.source_product_id ?? null);
const hasFilters = computed(() =>
  Boolean(searchTerm.value.trim()) ||
  Object.keys(defaultFilters).some((key) => filters.value[key] !== defaultFilters[key]),
);

const { items: offers, totalItems, currentPage, itemsPerPage, isLoading, error, load } = usePaginatedList((params) => listProducts({
  ...params,
  ...filters.value,
  search: searchTerm.value,
  sourceProductId: comparisonProductId.value,
}), 12);
const visibleOffers = computed(() => {
  const productId = comparisonProductId.value;
  return isLoading.value && productId !== null
    ? offers.value.filter((offer) => offer.source_product_id === productId)
    : offers.value;
});
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

const comparisonOpen = ref(false);
const comparisonLoading = ref(false);
const comparison = ref(null);
const comparisonError = ref('');
let comparisonRequest;

function toggleCompare(offer) {
  if (selectedOffers.value.some(({ id }) => id === offer.id)) {
    selectedOffers.value = selectedOffers.value.filter(({ id }) => id !== offer.id);
  } else if (selectedOffers.value.length < 2) {
    selectedOffers.value = [...selectedOffers.value, offer];
  }
}

async function openComparison() {
  const [first, second] = selectedOffers.value;
  const request = new AbortController();
  comparisonRequest = request;
  comparison.value = null;
  comparisonError.value = '';
  comparisonLoading.value = true;
  comparisonOpen.value = true;

  try {
    const result = await compareOffers(first.id, second.id, request.signal);
    if (!request.signal.aborted) comparison.value = result;
  } catch (error) {
    if (!request.signal.aborted) {
      comparisonError.value = error.status === 404
        ? 'Uma das ofertas saiu do catálogo ou ficou sem estoque. Escolha outra oferta.'
        : error.message;
    }
  } finally {
    if (!request.signal.aborted) comparisonLoading.value = false;
  }
}

function closeComparison() {
  comparisonRequest?.abort();
  comparisonOpen.value = false;
}

let searchTimer = null;

watch(comparisonProductId, () => {
  clearTimeout(searchTimer);
  load(1);
});

function onSearch(value) {
  searchTerm.value = value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => load(1), 400);
}

function updateFilter(key, value) {
  clearTimeout(searchTimer);
  filters.value[key] = value;
  load(1);
}

function resetFilters() {
  clearTimeout(searchTimer);
  searchTerm.value = '';
  filters.value = { ...defaultFilters };
  load(1);
}

onUnmounted(() => {
  clearTimeout(searchTimer);
  closeComparison();
});
</script>
