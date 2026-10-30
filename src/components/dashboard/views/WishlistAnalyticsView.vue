<template>
  <section class="space-y-6 pb-6">
    <header class="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-emerald-700">Produtor</p>
        <h2 class="mt-1 text-2xl font-bold text-slate-900">Análise de Produtos</h2>
        <p class="mt-1 text-sm text-slate-500">Veja quais produtos estão na lista de desejos dos varejistas.</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <label class="text-sm text-slate-600">
          Estado
          <select v-model="state" :disabled="isLoading" class="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2">
            <option value="">Todos os estados</option>
            <option v-for="uf in states" :key="uf" :value="uf">{{ uf }}</option>
          </select>
        </label>
        <label class="text-sm text-slate-600">
          Produtos
          <select v-model.number="limit" :disabled="isLoading" class="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2">
            <option :value="10">Top 10</option>
            <option :value="20">Top 20</option>
            <option :value="50">Top 50</option>
          </select>
        </label>
      </div>
    </header>

    <p v-if="error" role="alert" class="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{{ error }}</p>
    <p v-else-if="isLoading" role="status" class="text-sm text-slate-500">Carregando análise...</p>
    <template v-else-if="data">
      <div class="grid gap-4 sm:grid-cols-2">
        <article class="rounded-2xl border border-slate-100 bg-white p-5">
          <p class="text-sm text-slate-500">Desejos registrados</p>
          <p class="mt-2 text-3xl font-bold text-slate-900">{{ data.total_items }}</p>
        </article>
        <article class="rounded-2xl border border-slate-100 bg-white p-5">
          <p class="text-sm text-slate-500">Produtos no ranking</p>
          <p class="mt-2 text-3xl font-bold text-slate-900">{{ data.results.length }}</p>
        </article>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <div class="flex border-b border-slate-100" role="tablist" aria-label="Visualização da análise">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :id="`${tab.id}-tab`"
            role="tab"
            :aria-selected="activeTab === tab.id"
            :aria-controls="`${tab.id}-panel`"
            class="border-b-2 px-5 py-4 text-sm font-semibold"
            :class="activeTab === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'"
            @click="activeTab = tab.id"
          >{{ tab.label }}</button>
        </div>
        <div v-if="!data.results.length" class="p-6 text-sm text-slate-500">Nenhum produto encontrado para este filtro.</div>
        <div v-else-if="activeTab === 'ranking'" id="ranking-panel" role="tabpanel" aria-labelledby="ranking-tab" class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500">
              <tr><th class="px-5 py-3">Posição</th><th class="px-5 py-3">Produto</th><th class="px-5 py-3">Desejos</th><th class="px-5 py-3">Participação</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in data.results" :key="item.source_product_id">
                <td class="px-5 py-4 font-semibold text-slate-500">#{{ item.position }}</td>
                <td class="px-5 py-4 font-medium text-slate-900">{{ item.product_name }}</td>
                <td class="px-5 py-4 text-slate-600">{{ item.total }}</td>
                <td class="px-5 py-4 text-slate-600">{{ item.percentage }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else id="chart-panel" role="tabpanel" aria-labelledby="chart-tab" class="p-4 sm:p-6">
          <WishlistPieChart :results="data.results" :others="data.others" />
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { defineAsyncComponent, onMounted, ref, watch } from 'vue';
import { getWishlistAnalytics } from '@/services/wishlistAnalytics';

const WishlistPieChart = defineAsyncComponent(() => import('./wishlist/WishlistPieChart.vue'));

const states = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];
const state = ref('');
const limit = ref(10);
const data = ref(null);
const error = ref('');
const isLoading = ref(false);
const activeTab = ref('ranking');
const tabs = [
  { id: 'ranking', label: 'Lista de ranking' },
  { id: 'chart', label: 'Gráfico de distribuição' },
];
let requestId = 0;

async function load() {
  const currentRequest = ++requestId;
  isLoading.value = true;
  error.value = '';
  try {
    const result = await getWishlistAnalytics({ state: state.value, limit: limit.value });
    if (currentRequest === requestId) data.value = result;
  } catch (cause) {
    if (currentRequest === requestId) error.value = cause.message || 'Não foi possível carregar a análise.';
  } finally {
    if (currentRequest === requestId) isLoading.value = false;
  }
}

watch([state, limit], load);
onMounted(load);
</script>
