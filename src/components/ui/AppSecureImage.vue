<template>
  <img
    v-if="src && !failed"
    :src="src"
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
import { ref, watch } from 'vue';
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  objectFitClass: { type: String, default: 'object-cover' },
});
const failed = ref(false);
watch(() => props.src, () => { failed.value = false; });
</script>
