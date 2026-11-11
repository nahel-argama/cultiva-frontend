<template>
  <section class="flex flex-col gap-5 rounded-3xl border border-[#dce4d8] bg-white/85 p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
    <div class="flex items-start gap-4">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f2e7] text-emerald-700">
        <CalendarDaysIcon class="h-6 w-6" />
      </div>
      <div>
        <p class="text-xs font-bold tracking-[0.18em] text-emerald-700 uppercase">Planejamento de safra</p>
        <h2 class="mt-1 text-2xl font-black tracking-tight text-slate-900">{{ monthLabel }}</h2>
        <p class="mt-1 text-sm text-slate-600">Previsões compartilhadas para planejar o que vem da terra.</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
        @click="$emit('today')"
      >Hoje</button>
      <div class="flex items-center rounded-xl border border-slate-200 bg-white p-1" aria-label="Navegar pelos meses">
        <button type="button" class="rounded-lg p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" aria-label="Mês anterior" @click="$emit('previous')">
          <ChevronLeftIcon class="h-5 w-5" />
        </button>
        <button type="button" class="rounded-lg p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" aria-label="Próximo mês" @click="$emit('next')">
          <ChevronRightIcon class="h-5 w-5" />
        </button>
      </div>
      <button
        v-if="canCreate"
        type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        @click="$emit('create')"
      >
        <PlusIcon class="h-4 w-4" />
        Nova previsão
      </button>
    </div>
  </section>
</template>

<script setup>
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/vue/24/outline';

defineProps({
  monthLabel: { type: String, required: true },
  canCreate: { type: Boolean, default: false },
});

defineEmits(['today', 'previous', 'next', 'create']);
</script>
