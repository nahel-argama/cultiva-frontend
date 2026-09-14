<template>
  <div>
    <label v-if="label" class="mb-2 block text-sm font-bold text-gray-700">{{ label }}</label>
    <select
      :value="modelValue"
      class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-800 focus:outline-none"
      :class="{ 'border-red-500': error }"
      :disabled="loading"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="" disabled>{{ loading ? 'Carregando...' : placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  loading: Boolean,
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Selecione' },
  error: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
</script>
