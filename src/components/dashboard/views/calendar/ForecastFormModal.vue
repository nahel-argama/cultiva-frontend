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

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="forecast-start-date" class="mb-2 block text-sm font-bold text-slate-700">Data inicial</label>
                <input id="forecast-start-date" v-model="form.startDate" type="date" :min="startDateMin" required class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10" />
              </div>
              <div>
                <label for="forecast-end-date" class="mb-2 block text-sm font-bold text-slate-700">Data final</label>
                <input id="forecast-end-date" v-model="form.endDate" type="date" :min="form.startDate || today" required class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10" />
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
              <button type="submit" :disabled="isSaving" class="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">{{ isSaving ? 'Salvando…' : forecast ? 'Salvar alterações' : 'Publicar previsão' }}</button>
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
import { toLocalDateString } from '@/utils/harvestCalendar';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  forecast: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'submit']);
const { options: searchOptions, isLoading: searchLoading, search: searchProducts, reset: resetProductSearch } = useProductSearch();
const initialProduct = ref(null);
const formError = ref('');
const form = reactive({
  sourceProductId: '',
  quantity: '',
  startDate: '',
  endDate: '',
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

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) initializeForm();
  else resetForm();
});

function initializeForm() {
  formError.value = '';
  resetProductSearch();

  if (props.forecast) {
    const product = props.forecast.product ?? {};
    initialProduct.value = { id: product.source_product_id, name: product.name };
    form.sourceProductId = String(product.source_product_id ?? '');
    form.quantity = Number(props.forecast.quantity);
    form.startDate = props.forecast.start_date;
    form.endDate = props.forecast.end_date;
    return;
  }

  initialProduct.value = null;
  form.sourceProductId = '';
  form.quantity = '';
  form.startDate = '';
  form.endDate = '';
}

function resetForm() {
  initialProduct.value = null;
  formError.value = '';
  form.sourceProductId = '';
  form.quantity = '';
  form.startDate = '';
  form.endDate = '';
  resetProductSearch();
}

function selectProduct(product) {
  initialProduct.value = product ?? null;
  form.sourceProductId = String(product?.id ?? '');
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
