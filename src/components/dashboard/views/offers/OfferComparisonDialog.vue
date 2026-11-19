<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      aria-labelledby="offer-comparison-title"
      class="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 sm:p-7"
      @close="$emit('close')"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 id="offer-comparison-title" class="text-xl font-black sm:text-2xl">Comparar ofertas</h2>
          <p v-if="comparison" class="mt-1 text-sm text-slate-600">{{ comparison.offers[0].name }}</p>
        </div>
        <button type="button" autofocus aria-label="Fechar comparação" class="rounded-xl p-2 text-slate-600 hover:bg-slate-100" @click="dialog.close()">
          <XMarkIcon class="size-5" />
        </button>
      </div>

      <div v-if="loading" role="status" aria-label="Comparando ofertas" class="grid grid-cols-2 gap-3 py-4">
        <div v-for="column in 2" :key="column" class="space-y-4 rounded-xl border border-slate-200 p-4">
          <AppSkeleton class="h-5 w-3/4" />
          <AppSkeleton v-for="row in 4" :key="row" class="h-4 w-2/3" />
        </div>
      </div>
      <p v-else-if="error" role="alert" class="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{{ error }}</p>
      <template v-else-if="comparison">
        <p class="mt-4 text-sm text-slate-600">
          {{ comparison.recommended_offer_id ? 'A recomendação venceu em mais critérios.' : 'Empate na pontuação. Veja os destaques de cada oferta.' }}
          Cada critério vale um ponto.
        </p>

        <div class="mt-4 grid grid-cols-2 gap-2 sm:gap-4">
          <section
            v-for="offer in comparison.offers"
            :key="offer.id"
            :aria-label="offer.producer_name"
            class="rounded-2xl border-2 p-2.5 sm:p-4"
            :class="offer.id === comparison.recommended_offer_id ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100' : 'border-slate-200'"
          >
            <div class="relative aspect-[2/1] overflow-hidden rounded-xl bg-slate-100">
              <AppSecureImage :src="offer.image_url ?? ''" :alt="offer.name" />
              <span v-if="offer.id === comparison.recommended_offer_id" class="recommendation absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-1 text-[11px] font-bold text-white sm:top-2 sm:left-2 sm:text-xs">
                <StarIcon class="size-3.5 shrink-0" aria-hidden="true" />
                Recomendada
              </span>
            </div>
            <h3 class="mt-2 min-h-10 line-clamp-2 break-words text-sm font-bold sm:text-base" :title="offer.producer_name">{{ offer.producer_name }}</h3>
            <dl class="space-y-2">
              <div
                v-for="metric in metrics"
                :key="metric.key"
                class="rounded-xl px-2 py-2 sm:px-3"
                :class="comparison.criteria[metric.key] === offer.id ? 'bg-emerald-100 text-emerald-950' : 'bg-slate-100 text-slate-800'"
              >
                <dt class="text-xs font-medium">{{ metric.label }}</dt>
                <dd class="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm font-extrabold sm:text-base">
                  {{ offer[metric.key] == null ? 'Sem dados' : metric.format(offer[metric.key]) }}
                  <CheckCircleIcon
                    v-if="comparison.criteria[metric.key] === offer.id"
                    class="size-4 text-emerald-700"
                    aria-label="Vence neste critério"
                  />
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </template>
    </dialog>
  </Teleport>
</template>

<script setup>
import AppSkeleton from '@/components/ui/AppSkeleton.vue';
import { onMounted, ref } from 'vue';
import { CheckCircleIcon, StarIcon, XMarkIcon } from '@heroicons/vue/24/solid';
import AppSecureImage from '@/components/ui/AppSecureImage.vue';

defineProps({ comparison: Object, loading: Boolean, error: String });
defineEmits(['close']);

const dialog = ref(null);
const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const metrics = [
  { key: 'unit_price', label: 'Preço por kg', format: (value) => money.format(value) },
  { key: 'distance_km', label: 'Distância', format: (value) => `${number.format(value)} km` },
  { key: 'available_quantity', label: 'Estoque', format: (value) => `${number.format(value)} kg` },
  { key: 'recent_sales', label: 'Vendas em 90 dias', format: (value) => number.format(value) },
];

onMounted(() => dialog.value.showModal());
</script>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .recommendation {
    animation: float-in 700ms ease-out;
  }

  @keyframes float-in {
    0% { transform: translateY(5px); opacity: 0; }
    65% { transform: translateY(-3px); opacity: 1; }
    100% { transform: translateY(0); }
  }
}
</style>
