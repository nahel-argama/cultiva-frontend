<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm sm:p-5">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="truncate text-base font-extrabold text-slate-900">{{ forecast.product?.name ?? 'Produto' }}</p>
        <p class="mt-1 text-sm font-semibold text-emerald-700">{{ quantityLabel }}</p>
      </div>
      <button
        v-if="!canManage"
        type="button"
        class="shrink-0 rounded-full p-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        :class="isFavorite ? 'bg-rose-50 text-rose-600' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-500'"
        :aria-pressed="isFavorite"
        :aria-label="isFavorite ? 'Remover dos favoritos desta sessão' : 'Marcar como favorito nesta sessão'"
        @click="$emit('toggle-favorite', forecast.id)"
      >
        <HeartIcon class="h-5 w-5" :class="isFavorite ? 'fill-current' : ''" />
      </button>
      <div v-else class="flex shrink-0 gap-1">
        <button type="button" class="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700" :aria-label="`Editar previsão de ${forecast.product?.name}`" @click="$emit('edit', forecast)">
          <PencilSquareIcon class="h-4 w-4" />
        </button>
        <button type="button" class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" :aria-label="`Remover previsão de ${forecast.product?.name}`" @click="$emit('remove', forecast)">
          <TrashIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="mt-4 flex items-start gap-3 border-t border-slate-100 pt-3">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf2e9] text-xs font-black text-emerald-800">{{ producerInitials }}</div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-slate-800">{{ forecast.producer?.name ?? 'Produtor' }}</p>
        <p class="mt-0.5 text-xs text-slate-500">{{ dateLabel }}<span v-if="forecast.producer?.state"> · {{ forecast.producer.state }}</span></p>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { HeartIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { formatCalendarDate } from '@/utils/harvestCalendar';

const props = defineProps({
  forecast: { type: Object, required: true },
  canManage: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
});

defineEmits(['toggle-favorite', 'edit', 'remove']);

const quantityLabel = computed(() => `${new Intl.NumberFormat('pt-BR').format(props.forecast.quantity)} kg previstos até o fim do período`);
const dateLabel = computed(() => {
  const start = formatCalendarDate(props.forecast.start_date);
  const end = formatCalendarDate(props.forecast.end_date);
  return start === end ? start : `${start} a ${end}`;
});
const producerInitials = computed(() => (props.forecast.producer?.name ?? 'P')
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toLocaleUpperCase('pt-BR'));
</script>
