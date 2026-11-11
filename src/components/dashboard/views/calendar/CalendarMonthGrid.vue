<template>
  <section class="overflow-hidden rounded-3xl border border-[#dce4d8] bg-white/90 shadow-sm" aria-label="Calendário mensal de previsões">
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
import { getWeekdayLabels } from '@/utils/harvestCalendar';

defineProps({
  days: { type: Array, default: () => [] },
});

defineEmits(['select-day']);
const weekdays = getWeekdayLabels();

function eventLabel(forecast) {
  return `${forecast.product?.name ?? 'Produto'} · ${forecast.quantity} kg`;
}
</script>
