<template>
  <Teleport to="body">
    <transition name="forecast-modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
        @click.self="$emit('update:modelValue', false)"
      >
        <section class="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#e2e7df] bg-[#fcfcf8] shadow-[0_24px_80px_rgba(15,42,27,0.24)]" role="dialog" aria-modal="true" :aria-labelledby="'forecast-form-title'">
          <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
            <div>
              <p class="text-xs font-bold tracking-[0.16em] text-emerald-700 uppercase">Calendário de safras</p>
              <h2 id="forecast-form-title" class="mt-1 text-2xl font-black text-slate-900">{{ forecast ? 'Editar previsão' : 'Nova previsão' }}</h2>
              <p class="mt-1 text-sm text-slate-600">Previsão independente do estoque disponível para venda.</p>
            </div>
            <button type="button" class="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-800" aria-label="Fechar" @click="$emit('update:modelValue', false)">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <form class="space-y-5 px-6 py-6 sm:px-8" @submit.prevent="submit">
            <div>
              <AppSelect
                v-model="form.sourceProductId"
                label="Produto"
                placeholder="Busque pelo nome do produto"
                :options="productOptions"
                label-key="name"
                value-key="id"
                :loading="searchLoading"
                :filter-locally="false"
                autocomplete
                @search="searchProducts"
                @select="selectProduct"
              />
            </div>

            <div v-if="form.sourceProductId && seasonPeriods.length" class="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <label for="season-period" class="mb-2 block text-sm font-bold text-emerald-900">Referência sazonal do sistema</label>
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select id="season-period" v-model.number="form.seasonIndex" class="min-w-0 flex-1 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10" @change="applySeason">
                  <option v-for="(season, index) in seasonPeriods" :key="`${season.start_month}-${season.end_month}-${index}`" :value="index">
                    {{ monthRangeLabel(season) }} · {{ season.source }}
                  </option>
                </select>
                <button type="button" class="rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100" @click="useSeason">
                  Usar período
                </button>
              </div>
              <p class="mt-2 text-xs leading-5 text-emerald-900/75">Referência geral para confirmar ou substituir pelas datas da sua previsão.</p>
            </div>
            <p v-else-if="form.sourceProductId && seasonUnavailable" class="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900" role="status">Não foi possível carregar uma referência sazonal. Você pode informar as datas manualmente.</p>
            <p v-else-if="form.sourceProductId && seasonLoaded" class="rounded-xl bg-[#f1f3ed] px-4 py-3 text-xs leading-5 text-slate-600">Sem período sazonal cadastrado para este produto. Informe as datas da previsão.</p>

            <fieldset class="grid gap-3 sm:grid-cols-2">
              <legend class="mb-2 text-sm font-bold text-slate-700">Tipo de previsão</legend>
              <label class="flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition" :class="form.mode === 'specific' ? 'border-emerald-500 bg-emerald-50/70' : 'border-slate-200 bg-white'">
                <input v-model="form.mode" type="radio" value="specific" class="mt-1 accent-emerald-700" />
                <span><span class="block text-sm font-bold text-slate-800">Data específica</span><span class="mt-0.5 block text-xs text-slate-500">Um dia de colheita ou um intervalo informado por você.</span></span>
              </label>
              <label v-if="seasonPeriods.length" class="flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition" :class="form.mode === 'season' ? 'border-emerald-500 bg-emerald-50/70' : 'border-slate-200 bg-white'">
                <input v-model="form.mode" type="radio" value="season" class="mt-1 accent-emerald-700" @change="useSeason" />
                <span><span class="block text-sm font-bold text-slate-800">Período sazonal</span><span class="mt-0.5 block text-xs text-slate-500">Confirmar referência geral do produto.</span></span>
              </label>
            </fieldset>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="forecast-start-date" class="mb-2 block text-sm font-bold text-slate-700">{{ form.mode === 'season' ? 'Início sugerido' : 'Início da previsão' }}</label>
                <input id="forecast-start-date" v-model="form.startDate" type="date" :min="startDateMin" :readonly="form.mode === 'season'" required class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10" />
              </div>
              <div>
                <label for="forecast-end-date" class="mb-2 block text-sm font-bold text-slate-700">{{ form.mode === 'season' ? 'Fim sugerido' : 'Fim da previsão' }}</label>
                <input id="forecast-end-date" v-model="form.endDate" type="date" :min="form.startDate || today" :readonly="form.mode === 'season'" required class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10" />
              </div>
            </div>

            <div>
              <label for="forecast-quantity" class="mb-2 block text-sm font-bold text-slate-700">Quantidade total estimada (kg)</label>
              <input id="forecast-quantity" v-model.number="form.quantity" type="number" min="1" step="1" required placeholder="Ex.: 250" class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10" />
              <p class="mt-1.5 text-xs text-slate-500">Para um intervalo, informe a quantidade total prevista para todo o período.</p>
            </div>

            <p v-if="formError" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ formError }}</p>

            <div class="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button type="button" class="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" @click="$emit('update:modelValue', false)">Cancelar</button>
              <button type="submit" :disabled="isSaving" class="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">{{ isSaving ? 'Salvando…' : forecast ? 'Salvar alterações' : 'Confirmar previsão' }}</button>
            </div>
          </form>
        </section>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import AppSelect from '@/components/ui/AppSelect.vue';
import { useProductSearch } from '@/composables/useProductSearch';
import { listHarvestSeasonPeriods } from '@/services/harvestForecasts';
import { monthSeasonRange, toLocalDateString } from '@/utils/harvestCalendar';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  forecast: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'submit']);
const { options: searchOptions, isLoading: searchLoading, search: searchProducts, reset: resetProductSearch } = useProductSearch();
const initialProduct = ref(null);
const seasonPeriods = ref([]);
const seasonLoaded = ref(false);
const seasonUnavailable = ref(false);
const formError = ref('');
const form = reactive({
  sourceProductId: '',
  quantity: '',
  startDate: '',
  endDate: '',
  mode: 'specific',
  seasonIndex: 0,
});

const productOptions = computed(() => {
  const options = [...searchOptions.value];
  if (initialProduct.value && !options.some((item) => String(item.id) === String(initialProduct.value.id))) {
    options.unshift(initialProduct.value);
  }
  return options;
});
const today = toLocalDateString(new Date());
const startDateMin = computed(() => form.startDate && form.startDate < today ? form.startDate : today);
let seasonRequestSequence = 0;

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) initializeForm();
  else resetForm();
});

function initializeForm() {
  seasonRequestSequence++;
  formError.value = '';
  seasonPeriods.value = [];
  seasonLoaded.value = false;
  seasonUnavailable.value = false;
  resetProductSearch();

  if (props.forecast) {
    const product = props.forecast.product ?? {};
    initialProduct.value = { id: product.source_product_id, name: product.name };
    form.sourceProductId = String(product.source_product_id ?? '');
    form.quantity = Number(props.forecast.quantity);
    form.startDate = props.forecast.start_date;
    form.endDate = props.forecast.end_date;
    loadSeasonPeriods(form.sourceProductId);
    return;
  }

  initialProduct.value = null;
  form.sourceProductId = '';
  form.quantity = '';
  form.startDate = '';
  form.endDate = '';
  form.mode = 'specific';
  form.seasonIndex = 0;
}

function resetForm() {
  seasonRequestSequence++;
  initialProduct.value = null;
  seasonPeriods.value = [];
  seasonLoaded.value = false;
  seasonUnavailable.value = false;
  formError.value = '';
  form.sourceProductId = '';
  form.quantity = '';
  form.startDate = '';
  form.endDate = '';
  form.mode = 'specific';
  form.seasonIndex = 0;
  resetProductSearch();
}

function selectProduct(product) {
  seasonRequestSequence++;
  initialProduct.value = product ?? null;
  form.sourceProductId = String(product?.id ?? '');
  seasonPeriods.value = [];
  seasonLoaded.value = false;
  seasonUnavailable.value = false;
  form.mode = 'specific';

  if (form.sourceProductId) loadSeasonPeriods(form.sourceProductId);
}

async function loadSeasonPeriods(productId) {
  const requestId = ++seasonRequestSequence;
  seasonUnavailable.value = false;
  try {
    const periods = await listHarvestSeasonPeriods(productId);
    if (requestId !== seasonRequestSequence) return;
    seasonPeriods.value = periods;
    seasonLoaded.value = true;
    if (seasonPeriods.value.length) {
      form.seasonIndex = 0;
    }
  } catch (error) {
    if (requestId !== seasonRequestSequence) return;
    if (error?.status === 422) seasonLoaded.value = true;
    else seasonUnavailable.value = true;
  }
}

function useSeason() {
  const season = seasonPeriods.value[Number(form.seasonIndex)];
  if (!season) return;
  const dates = monthSeasonRange(season.start_month, season.end_month);
  form.mode = 'season';
  form.startDate = dates.startDate;
  form.endDate = dates.endDate;
}

function applySeason() {
  if (form.mode === 'season') useSeason();
}

function monthRangeLabel(season) {
  const month = (value) => new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2024, value - 1, 1));
  return `${month(season.start_month)} a ${month(season.end_month)}`;
}

function submit() {
  formError.value = '';
  const quantity = Number(form.quantity);

  if (!form.sourceProductId || !Number.isInteger(quantity) || quantity < 1) {
    formError.value = 'Selecione um produto e informe uma quantidade inteira maior que zero.';
    return;
  }
  if (!form.startDate || !form.endDate || form.endDate < form.startDate) {
    formError.value = 'Informe um período válido para a previsão.';
    return;
  }

  if (!props.forecast) {
    if (form.startDate < today || form.endDate < today) {
      formError.value = 'As datas da previsão devem ser hoje ou futuras.';
      return;
    }
    emit('submit', {
      source_product_id: String(form.sourceProductId),
      quantity,
      start_date: form.startDate,
      end_date: form.endDate,
    });
    return;
  }

  const payload = {};
  if (String(form.sourceProductId) !== String(props.forecast.product?.source_product_id)) payload.source_product_id = String(form.sourceProductId);
  if (quantity !== Number(props.forecast.quantity)) payload.quantity = quantity;
  if (form.startDate !== props.forecast.start_date) payload.start_date = form.startDate;
  if (form.endDate !== props.forecast.end_date) payload.end_date = form.endDate;

  if (!Object.keys(payload).length) {
    formError.value = 'Nenhuma alteração para salvar.';
    return;
  }
  if ((payload.start_date && payload.start_date < today) || (payload.end_date && payload.end_date < today)) {
    formError.value = 'As novas datas devem ser hoje ou futuras.';
    return;
  }
  emit('submit', payload);
}
</script>

<style scoped>
.forecast-modal-enter-active,
.forecast-modal-leave-active {
  transition: opacity 180ms ease;
}

.forecast-modal-enter-from,
.forecast-modal-leave-to {
  opacity: 0;
}
</style>
