<template>
  <header
    class="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-2xl font-black tracking-tight text-slate-900">Explorar Ofertas</h2>
        </div>

        <div class="flex min-w-0 items-center gap-2 lg:w-[29rem]">
          <label class="relative block min-w-0 flex-1" for="offers-search">
            <span class="sr-only">Buscar oferta</span>
            <input
              id="offers-search"
              :value="search"
              type="text"
              maxlength="255"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
              placeholder="Buscar produto..."
              @input="$emit('update-search', $event.target.value)"
            />
            <MagnifyingGlassIcon
              class="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-slate-400"
            />
          </label>

          <button
            type="button"
            class="inline-flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-emerald-700 sm:px-4"
            :class="isOpen || activeCount ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'"
            :aria-expanded="isOpen"
            aria-controls="offers-filters"
            @click="isOpen = !isOpen"
          >
            <AdjustmentsHorizontalIcon class="size-4" aria-hidden="true" />
            Filtros
            <span v-if="activeCount" class="grid size-5 place-items-center rounded-full bg-emerald-700 text-xs text-white">
              {{ activeCount }}
            </span>
          </button>
        </div>
      </div>
      <div v-show="isOpen" id="offers-filters" class="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 sm:p-4">
        <div class="grid gap-3 sm:grid-cols-3">
          <label v-for="field in fields" :key="field.key" class="min-w-0">
            <span class="mb-1.5 block text-xs font-semibold text-slate-700">{{ field.label }}</span>
            <span class="relative block">
              <component :is="field.icon" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-emerald-700" aria-hidden="true" />
              <select
                :value="filters[field.key]"
                class="min-h-11 w-full appearance-none rounded-xl border border-emerald-200/80 bg-white py-2 pr-8 pl-9 text-sm font-medium text-slate-900 transition hover:border-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-700"
                @change="$emit('update-filter', field.key, $event.target.value)"
              >
                <option v-for="[value, label] in field.options" :key="value" :value="value">{{ label }}</option>
              </select>
              <ChevronDownIcon class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            </span>
          </label>
        </div>
        <div v-if="canReset" class="mt-2 flex justify-end">
          <button
            type="button"
            class="rounded-lg px-2 py-1 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-emerald-700"
            @click="$emit('reset')"
          >
            Limpar filtros
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue';
import {
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from '@heroicons/vue/24/outline';

const fields = [
  {
    key: 'wishlist',
    label: 'Lista de desejos',
    icon: HeartIcon,
    options: [
      ['all', 'Todas as ofertas'],
      ['included', 'Na minha lista'],
      ['excluded', 'Fora da minha lista'],
    ],
  },
  {
    key: 'maxDistanceKm',
    label: 'Distância do seu endereço',
    icon: MapPinIcon,
    options: [['', 'Qualquer distância'], ...[10, 25, 50, 100].map((km) => [String(km), `Até ${km} km`])],
  },
  {
    key: 'sort',
    label: 'Ordenar por',
    icon: ArrowsUpDownIcon,
    options: [
      ['nearest', 'Proximidade'],
      ['recent', 'Mais recentes'],
      ['price_asc', 'Menor preço unitário'],
      ['price_desc', 'Maior preço unitário'],
    ],
  },
];

const props = defineProps({
  filters: { type: Object, required: true },
  canReset: Boolean,
  search: {
    type: String,
    default: '',
  },
});

const isOpen = ref(false);
const activeCount = computed(() =>
  fields.filter(({ key, options }) => props.filters[key] !== options[0][0]).length,
);

defineEmits(['update-search', 'update-filter', 'reset']);
</script>
