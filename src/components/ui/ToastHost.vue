<template>
  <div class="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3">
    <TransitionGroup name="toast" tag="div" class="flex flex-col gap-3">
      <div
        v-for="item in state.items"
        :key="item.id"
        class="pointer-events-auto rounded-xl border bg-white p-4 shadow-xl"
        :class="item.type === 'error' ? 'border-red-200' : item.type === 'warning' ? 'border-amber-200' : 'border-green-200'"
      >
        <div class="flex items-start gap-3">
          <span
            class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
            :class="item.type === 'error' ? 'bg-red-500' : item.type === 'warning' ? 'bg-amber-500' : 'bg-[#2CA961]'"
          >
            {{ item.type === 'error' ? '!' : item.type === 'warning' ? '!' : '✓' }}
          </span>
          <div class="min-w-0 flex-1">
            <p v-if="item.title" class="text-sm font-black text-slate-900">{{ item.title }}</p>
            <p class="text-sm leading-relaxed text-slate-600">{{ item.message }}</p>
          </div>
          <button class="text-lg leading-none text-slate-400 hover:text-slate-700" aria-label="Fechar" @click="dismiss(item.id)">
            &times;
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast';

const { state, dismiss } = useToast();
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
</style>
