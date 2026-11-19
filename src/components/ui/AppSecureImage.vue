<template>
  <img
    v-if="imageSource && !failed"
    :src="imageSource"
    :alt="alt"
    :class="['h-full w-full', objectFitClass]"
    loading="lazy"
    @error="failed = true"
  />
  <div v-else class="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-400">
    Imagem indisponível
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  objectFitClass: { type: String, default: 'object-cover' },
});
const failed = ref(false);
const tunnel = /^https:\/\/[^/]+\.ngrok-free\.dev(?:\/|$)/i.test(import.meta.env.VITE_API_BASE_URL ?? '')
  ? new URL(import.meta.env.VITE_API_BASE_URL)
  : null;
const imageSource = computed(() => {
  if (!import.meta.env.DEV || !tunnel || !/^https?:\/\//i.test(props.src)) return props.src;

  const url = new URL(props.src);
  const isBackend = url.origin === tunnel.origin || ['localhost', '127.0.0.1'].includes(url.hostname);
  return isBackend && url.pathname.startsWith('/storage/')
    ? `${url.pathname}${url.search}`
    : props.src;
});

watch(imageSource, () => { failed.value = false; });
</script>
