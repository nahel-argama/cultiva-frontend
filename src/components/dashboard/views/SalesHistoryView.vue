<template>
  <section class="space-y-6 pb-6">
    <HistoryToolbar
      :search="searchTerm"
      @update-search="onSearch"
      eyebrow="Produtor"
      title="Histórico de Venda"
      description="Confira as vendas registradas para suas ofertas."
      :item-count="totalItems"
      action-label="vendas"
    />

    <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="isLoading" role="status" class="text-sm text-slate-500">Carregando...</p>
    <HistoryList
      v-else
      :items="sales"
      empty-title="Nenhuma venda encontrada"
      empty-description="Não há registros para exibir."
      item-kind-label="Venda"
      @download-invoice="onDownloadInvoice"
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
import { computed, onMounted, onUnmounted, ref } from 'vue';
import HistoryList from './history/HistoryList.vue';
import HistoryToolbar from './history/HistoryToolbar.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import { listOrders } from '@/services/ordersService';
import { usePaginatedList } from '@/composables/usePaginatedList';
import { formatDocument, formatPostalCode } from '@/utils/formatters';
import { downloadInvoice } from '@/utils/invoiceGenerator';

const searchTerm = ref('');
const { items: orders, totalItems, currentPage, itemsPerPage, isLoading, error, load } = usePaginatedList((params) => listOrders({ ...params, search: searchTerm.value }), 10);
const sales = computed(() => orders.value.map(buildHistoryItem));

function formatDate(value) {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(parsed);
}

function formatMoney(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

function formatAddress(address) {
  if (!address) return '';

  const mainLine = [address.street, address.number, address.complement].filter(Boolean).join(', ');
  const extraLine = [address.neighborhood, address.city, address.state].filter(Boolean).join(' • ');
  const postalCode = address.zip ? `CEP ${formatPostalCode(address.zip)}` : '';

  return [mainLine, extraLine, postalCode].filter(Boolean).join(' • ');
}

function buildHistoryItem(purchase) {
  const party = purchase.counterparty ?? {};
  const document = formatDocument('CNPJ', party.document_number);

  return {
    id: purchase.id,
    rawOrder: purchase,
    contractTitle: `Venda #${purchase.id}`,
    partyLabel: 'Cliente',
    partyName: party.trade_name || party.legal_name || '',
    partyLegalName: party.legal_name || '',
    partyDocument: document ? `CNPJ ${document}` : '',
    partyLocation: formatAddress(party.address),
    partyContact: party.name || '',
    partyEmail: party.email || '',
    partyPhone: party.phone || '',
    date: formatDate(purchase.created_at),
    status: 'Registrada',
    statusTone: 'emerald',
    total: formatMoney(purchase.total_price),
    items: [{
      name: purchase.product_name,
      quantity: `${purchase.quantity} kg`,
      unit: `${formatMoney(purchase.unit_price)} / kg`,
      category: purchase.category?.name || '',
    }],
  };
}

function onDownloadInvoice(item) {
  downloadInvoice(item.rawOrder);
}

onMounted(() => load(1));
let searchTimer = null;

function onSearch(value) {
  searchTerm.value = value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => load(1), 400);
}

onUnmounted(() => clearTimeout(searchTimer));
</script>
