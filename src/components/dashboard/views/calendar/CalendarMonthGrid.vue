<template>
  <section class="overflow-hidden rounded-3xl border border-[#dce4d8] bg-white/90 shadow-sm" aria-label="Calendário mensal de previsões">
    <header class="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Mês anterior" :disabled="monthValue <= currentMonthValue" @click="$emit('previous')">
          <ChevronLeftIcon class="h-5 w-5" />
        </button>
        <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2" aria-label="Selecionar mês e ano">
          <CalendarDaysIcon class="h-4 w-4 text-emerald-700" />
          <select :value="monthValue.slice(5, 7)" class="bg-transparent text-sm font-bold text-slate-800 outline-none" aria-label="Mês" @change="selectMonth">
            <option v-for="month in availableMonths" :key="month" :value="month">{{ month }}</option>
          </select>
          <span class="text-sm font-semibold text-slate-400" aria-hidden="true">/</span>
          <select :value="monthValue.slice(0, 4)" class="bg-transparent text-sm font-bold text-slate-800 outline-none" aria-label="Ano" @change="selectYear">
            <option v-for="year in years" :key="year" :value="String(year)">{{ year }}</option>
          </select>
        </div>
        <button type="button" class="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Próximo mês" :disabled="monthValue >= `${currentYear + 5}-12`" @click="$emit('next')">
          <ChevronRightIcon class="h-5 w-5" />
        </button>
        <span class="ml-1 text-sm font-extrabold text-slate-800">{{ monthLabel }}</span>
      </div>
      <button type="button" class="self-start rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 sm:self-auto" @click="$emit('today')">Hoje</button>
    </header>

    <div class="grid grid-cols-7 border-b border-slate-100 bg-[#f7f8f3]">
      <div v-for="weekday in weekdays" :key="weekday" class="py-3 text-center text-[11px] font-bold tracking-wide text-slate-500 uppercase">{{ weekday }}</div>
    </div>

    <div class="grid grid-cols-7">
      <button
        v-for="day in days"
        :key="day.date"
        type="button"
        class="group relative min-h-[5.5rem] border-r border-b border-slate-100 p-1.5 text-left transition last:border-r-0 hover:bg-emerald-50/60 sm:min-h-28 sm:p-2.5"
        :class="[
          !day.inCurrentMonth ? 'bg-slate-50/60 text-slate-300' : 'text-slate-700',
          day.isSelected ? 'z-10 bg-emerald-50 ring-2 ring-inset ring-emerald-600' : '',
        ]"
        :aria-label="`${day.number}, ${day.events.length} previsões`"
        :aria-pressed="day.isSelected"
        @click="$emit('select-day', day)"
        @dblclick="$emit('open-day', day)"
      >
        <span
          class="inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-xs font-bold"
          :class="day.isToday ? 'bg-emerald-700 text-white' : day.isSelected ? 'text-emerald-800' : ''"
        >{{ day.number }}</span>
        <span v-if="day.events.length" class="mt-1 block space-y-1">
          <span
            v-for="forecast in day.events.slice(0, 2)"
            :key="forecast.id"
            class="block truncate rounded-md bg-[#e8f2e7] px-1.5 py-1 text-[10px] font-semibold leading-tight text-emerald-900 sm:px-2 sm:text-xs"
            :title="eventLabel(forecast)"
          >{{ eventLabel(forecast) }}</span>
          <span v-if="day.events.length > 2" class="block px-1.5 text-[10px] font-bold text-emerald-700 sm:px-2">+{{ day.events.length - 2 }} mais</span>
        </span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';
import { getWeekdayLabels } from '@/utils/harvestCalendar';

const props = defineProps({
  days: { type: Array, default: () => [] },
  monthLabel: { type: String, required: true },
  monthValue: { type: String, required: true },
});

const emit = defineEmits(['select-day', 'select-month', 'today', 'previous', 'next']);
const weekdays = getWeekdayLabels();
const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonthValue = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
const availableMonths = computed(() => months.filter((month) => `${props.monthValue.slice(0, 4)}-${month}` >= currentMonthValue));
const years = Array.from({ length: 6 }, (_, index) => currentYear + index);

function selectMonth(event) {
  emit('select-month', `${props.monthValue.slice(0, 4)}-${event.target.value}`);
}

function selectYear(event) {
  emit('select-month', `${event.target.value}-${props.monthValue.slice(5, 7)}`);
}

function eventLabel(forecast) {
  return `${forecast.product?.name ?? 'Produto'} · ${forecast.quantity} kg até o fim`;
}
</script>
