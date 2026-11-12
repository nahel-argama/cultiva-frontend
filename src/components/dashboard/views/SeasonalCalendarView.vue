<template>
  <section class="mx-auto max-w-[1500px] space-y-5 pb-8">
    <CalendarToolbar
      :can-create="isProducer"
      @create="openCreateForm"
    />

    <div v-if="isProducer" class="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="note">
      <InformationCircleIcon class="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
      <p><span class="font-bold">Seu calendário mostra apenas previsões cadastradas por você.</span> Compradores podem consultar previsões de todos os produtores.</p>
    </div>

    <CalendarFilters v-model="productId" />

    <p v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ error }}</p>

    <div class="grid items-start gap-5">
      <div class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 px-1">
          <p class="text-sm font-bold text-slate-700">{{ monthCountLabel }}</p>
          <p class="text-xs text-slate-500">Cada previsão mostra o total esperado até o fim do período.</p>
        </div>
        <div class="relative">
          <CalendarMonthGrid
            :days="days"
            :wishlist-product-ids="wishlistProductIds"
            :month-value="monthValue"
            @select-day="selectCalendarDay"
            @open-day="openAgenda"
            @select-month="selectMonth"
            @today="goToToday"
            @previous="changeMonth(-1)"
            @next="changeMonth(1)"
          />
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/65 backdrop-blur-[1px]" role="status">
            <span class="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm">
              <span class="h-4 w-4 animate-spin rounded-full border-2 border-emerald-700/25 border-t-emerald-700"></span>
              Atualizando calendário…
            </span>
          </div>
        </div>
      </div>

      <Teleport to="body">
        <transition name="forecast-modal">
          <div v-if="isAgendaOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm" @click.self="isAgendaOpen = false" @keydown.esc="isAgendaOpen = false">
            <section class="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#dce4d8] bg-[#f7f8f3] p-4 shadow-2xl sm:p-5" role="dialog" aria-modal="true" aria-labelledby="calendar-agenda-title">
              <div class="flex items-start justify-between gap-3 border-b border-[#e1e7dd] pb-4">
                <div>
                  <p class="text-xs font-bold tracking-[0.16em] text-emerald-700 uppercase">Agenda do dia</p>
                  <h3 id="calendar-agenda-title" class="mt-1 text-xl font-black text-slate-900">{{ selectedDayLabel }}</h3>
                </div>
                <div class="flex items-center gap-2">
                  <span class="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">{{ selectedForecasts.length }} {{ selectedForecasts.length === 1 ? 'previsão' : 'previsões' }}</span>
                  <button type="button" class="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-800" aria-label="Fechar agenda do dia" @click="isAgendaOpen = false">
                    <XMarkIcon class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <p v-if="isLoading && !forecasts.length" class="py-8 text-center text-sm text-slate-500" role="status">Carregando previsões…</p>
              <div v-else-if="selectedForecasts.length" class="mt-4 space-y-3">
                <CalendarForecastCard
                  v-for="forecast in selectedForecasts"
                  :key="forecast.id"
                  :forecast="forecast"
                  :can-manage="isProducer"
                  :is-favorite="favoriteIds.has(forecast.id)"
                  @toggle-favorite="toggleFavorite"
                  @edit="openEditForm"
                  @remove="openDeleteDialog"
                />
              </div>
              <div v-else class="mt-4 rounded-2xl border border-dashed border-[#d2dbcf] bg-white/60 px-5 py-9 text-center">
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <SunIcon class="h-6 w-6" />
                </div>
                <p class="mt-3 text-sm font-bold text-slate-800">Nenhuma colheita prevista neste dia</p>
                <p class="mt-1 text-xs leading-5 text-slate-500">Escolha outra data ou ajuste o produto para explorar o calendário.</p>
              </div>
            </section>
          </div>
        </transition>
      </Teleport>
    </div>

    <ForecastFormModal
      v-model="isFormOpen"
      :forecast="editingForecast"
      :is-saving="isSaving"
      @submit="saveForecast"
    />
    <AppDialog
      v-model="isDeleteDialogOpen"
      title="Remover previsão?"
      :message="deleteMessage"
      confirm-label="Remover previsão"
      :loading="isDeleting"
      @confirm="deleteForecast"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { InformationCircleIcon, SunIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import AppDialog from '@/components/ui/AppDialog.vue';
import CalendarFilters from '@/components/dashboard/views/calendar/CalendarFilters.vue';
import CalendarForecastCard from '@/components/dashboard/views/calendar/CalendarForecastCard.vue';
import CalendarMonthGrid from '@/components/dashboard/views/calendar/CalendarMonthGrid.vue';
import CalendarToolbar from '@/components/dashboard/views/calendar/CalendarToolbar.vue';
import ForecastFormModal from '@/components/dashboard/views/calendar/ForecastFormModal.vue';
import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import { listWishlistItems } from '@/services/wishlist';
import {
  createHarvestForecast,
  deleteHarvestForecast as removeHarvestForecast,
  listAllHarvestForecasts,
  updateHarvestForecast,
} from '@/services/harvestForecasts';
import {
  formatCalendarDate,
  getMonthBounds,
  getMonthDays,
  parseLocalDate,
  toLocalDateString,
} from '@/utils/harvestCalendar';

const auth = useAuth();
const toast = useToast();
const now = new Date();
const displayedMonth = ref(new Date(now.getFullYear(), now.getMonth(), 1));
const selectedDate = ref(toLocalDateString(now));
const productId = ref('');
const forecasts = ref([]);
const wishlistProductIds = ref(new Set());
const isLoading = ref(false);
const isAgendaOpen = ref(false);
const error = ref('');
const isFormOpen = ref(false);
const editingForecast = ref(null);
const isSaving = ref(false);
const isDeleteDialogOpen = ref(false);
const deletingForecast = ref(null);
const isDeleting = ref(false);
const favoriteIds = ref(new Set());
let loadSequence = 0;

const isProducer = computed(() => auth.userType.value === 'producer');
const monthValue = computed(() => `${displayedMonth.value.getFullYear()}-${String(displayedMonth.value.getMonth() + 1).padStart(2, '0')}`);
const selectedDayLabel = computed(() => formatCalendarDate(selectedDate.value, {
  weekday: 'long', day: 'numeric', month: 'long',
}));
const days = computed(() => getMonthDays(displayedMonth.value, forecasts.value, selectedDate.value));
const selectedForecasts = computed(() => forecasts.value
  .filter((forecast) => forecast.start_date <= selectedDate.value && forecast.end_date >= selectedDate.value)
  .sort((left, right) => left.start_date.localeCompare(right.start_date) || left.product.name.localeCompare(right.product.name, 'pt-BR')));
const monthCountLabel = computed(() => {
  const count = forecasts.value.length;
  return `${count} ${count === 1 ? 'previsão encontrada' : 'previsões encontradas'}`;
});
const deleteMessage = computed(() => deletingForecast.value
  ? `A previsão de ${deletingForecast.value.product?.name ?? 'produto'} será removida do calendário.`
  : 'Esta previsão será removida do calendário.');

watch([displayedMonth, productId], loadForecasts, { immediate: true });

if (!isProducer.value) {
  loadWishlist();
}

async function loadWishlist() {
  try {
    const firstPage = await listWishlistItems({ perPage: 100 });
    const items = [...firstPage.results];
    for (let page = 2; page <= firstPage.lastPage; page++) {
      const nextPage = await listWishlistItems({ perPage: 100, page });
      items.push(...nextPage.results);
    }
    wishlistProductIds.value = new Set(items.map((item) => String(item.source_product_id)));
  } catch (requestError) {
    toast.error(requestError?.message || 'Não foi possível carregar sua lista de desejos.', 'Erro ao carregar lista');
  }
}

async function loadForecasts() {
  const requestId = ++loadSequence;
  const bounds = getMonthBounds(displayedMonth.value);
  isLoading.value = true;
  error.value = '';
  forecasts.value = [];

  try {
    const result = await listAllHarvestForecasts({
      productId: productId.value,
      dateFrom: bounds.start,
      dateTo: bounds.end,
    });
    if (requestId === loadSequence) forecasts.value = result;
  } catch (requestError) {
    if (requestId === loadSequence) {
      forecasts.value = [];
      error.value = requestError?.message || 'Não foi possível carregar as previsões deste período.';
    }
  } finally {
    if (requestId === loadSequence) isLoading.value = false;
  }
}

function changeMonth(offset) {
  const nextMonth = new Date(displayedMonth.value.getFullYear(), displayedMonth.value.getMonth() + offset, 1);
  displayedMonth.value = nextMonth;
  selectedDate.value = toLocalDateString(nextMonth);
}

function goToToday() {
  const today = new Date();
  displayedMonth.value = new Date(today.getFullYear(), today.getMonth(), 1);
  selectedDate.value = toLocalDateString(today);
}

function selectMonth(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return;

  displayedMonth.value = new Date(year, month - 1, 1);
  selectedDate.value = `${value}-01`;
}

function selectCalendarDay(day) {
  selectedDate.value = day.date;
  if (!day.inCurrentMonth) {
    const date = parseLocalDate(day.date);
    displayedMonth.value = new Date(date.getFullYear(), date.getMonth(), 1);
  }
}

function openAgenda(day) {
  selectCalendarDay(day);
  isAgendaOpen.value = true;
}

function toggleFavorite(forecastId) {
  const nextFavorites = new Set(favoriteIds.value);
  if (nextFavorites.has(forecastId)) nextFavorites.delete(forecastId);
  else nextFavorites.add(forecastId);
  favoriteIds.value = nextFavorites;
}

function openCreateForm() {
  editingForecast.value = null;
  isFormOpen.value = true;
}

function openEditForm(forecast) {
  editingForecast.value = forecast;
  isFormOpen.value = true;
}

function openDeleteDialog(forecast) {
  deletingForecast.value = forecast;
  isDeleteDialogOpen.value = true;
}

async function saveForecast(payload) {
  isSaving.value = true;
  try {
    if (editingForecast.value) {
      await updateHarvestForecast(editingForecast.value.id, payload);
      toast.success('Previsão atualizada no calendário.', 'Alterações salvas');
    } else {
      const created = await createHarvestForecast(payload);
      const startDate = parseLocalDate(created.start_date);
      displayedMonth.value = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      selectedDate.value = created.start_date;
      toast.success('Sua previsão já aparece no calendário para os compradores.', 'Previsão publicada');
    }
    isFormOpen.value = false;
    await loadForecasts();
  } catch (saveError) {
    toast.error(saveError?.message || 'Não foi possível salvar a previsão.', 'Erro ao salvar');
  } finally {
    isSaving.value = false;
  }
}

async function deleteForecast() {
  if (!deletingForecast.value) return;
  isDeleting.value = true;
  try {
    await removeHarvestForecast(deletingForecast.value.id);
    isDeleteDialogOpen.value = false;
    toast.success('Previsão removida do calendário.', 'Previsão removida');
    deletingForecast.value = null;
    await loadForecasts();
  } catch (deleteError) {
    toast.error(deleteError?.message || 'Não foi possível remover a previsão.', 'Erro ao remover');
  } finally {
    isDeleting.value = false;
  }
}
</script>
