<template>
  <div class="flex h-full flex-col px-4 py-5">
    <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 p-3">
      <div class="flex items-center gap-3">
        <img src="/favicon.png" alt="Cultiva" class="h-11 w-11 object-contain" />
        <div>
          <p class="font-display text-lg leading-none font-semibold text-emerald-700">Cultiva</p>
          <p class="mt-1 text-xs font-medium text-slate-500">Dashboard</p>
        </div>
      </div>

      <button
        class="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600 lg:hidden"
        type="button"
        @click="$emit('close-sidebar')"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>

    <nav class="mt-8 space-y-1.5">
      <p
        v-if="!isVerified"
        class="mb-3 rounded-xl bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-700"
        role="status"
      >
        Envie seus documentos para liberar o acesso ao menu.
      </p>
      <button
        v-for="item in profile.navItems"
        :key="item.label"
        type="button"
        class="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-600"
        :class="item.id === activeItemId ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700' : 'hover:bg-emerald-50 hover:text-emerald-700'"
        :disabled="!isVerified && item.id !== 'meu-perfil'"
        :aria-current="item.id === activeItemId ? 'page' : undefined"
        :aria-disabled="!isVerified && item.id !== 'meu-perfil'"
        @click="$emit('select', item.id)"
      >
        <component
          :is="item.icon"
          class="h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-emerald-500"
          :class="item.id === activeItemId ? 'text-white group-hover:text-white' : ''"
        />
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { XMarkIcon } from '@heroicons/vue/24/outline';

defineProps({
  profile: {
    type: Object,
    required: true,
  },
  activeItemId: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['close-sidebar', 'select']);
</script>
