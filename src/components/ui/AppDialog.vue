<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
      @click.self="cancel"
    >
      <section class="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" :aria-label="title">
        <div class="flex items-start justify-between gap-4">
          <h2 class="text-xl font-black text-slate-900">{{ title }}</h2>
          <button type="button" class="rounded-lg px-2 text-xl leading-none text-slate-400 hover:text-slate-700" aria-label="Fechar" @click="cancel">&times;</button>
        </div>
        <p v-if="message" class="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{{ message }}</p>
        <div v-if="$slots.default" class="mt-4"><slot /></div>
        <div class="mt-6 flex justify-end gap-3">
          <button v-if="showCancel" type="button" class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700" @click="cancel">{{ cancelLabel }}</button>
          <button type="button" class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60" :disabled="loading" @click="confirm">{{ loading ? 'Aguarde...' : confirmLabel }}</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  variant: { type: String, default: 'success' },
  confirmLabel: { type: String, default: 'Confirmar' },
  cancelLabel: { type: String, default: 'Cancelar' },
  showCancel: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);
function confirm() {
  emit('confirm');
}
function cancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>
