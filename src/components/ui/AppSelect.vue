<template>
  <div>
    <label v-if="label" class="mb-2 block text-sm font-bold text-gray-700">{{ label }}</label>
    <div v-if="autocomplete" class="relative">
      <input
        :value="searchText"
        type="text"
        :placeholder="placeholder"
        :disabled="loading"
        class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-800 focus:outline-none"
        :class="{ 'border-red-500': error }"
        @focus="isOpen = true"
        @input="onSearch"
        @keydown.esc="isOpen = false"
      />
      <div
        v-if="isOpen && (visibleOptions.length || loading)"
        class="absolute z-40 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
      >
        <p v-if="loading" class="px-3 py-2 text-sm text-slate-500">Carregando...</p>
        <button
          v-for="option in visibleOptions"
          :key="option[valueKey] ?? option.value ?? option.id"
          type="button"
          class="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50"
          @click="selectOption(option)"
        >{{ option[labelKey] ?? option.label ?? option.name ?? option[valueKey] ?? option.id }}</button>
      </div>
    </div>
    <select
      v-else
      :value="modelValue"
      class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-800 focus:outline-none"
      :class="{ 'border-red-500': error }"
      :disabled="loading"
      @change="onNativeChange"
    >
      <option value="" disabled>{{ loading ? 'Carregando...' : placeholder }}</option>
      <option
        v-for="option in options"
        :key="option[valueKey] ?? option.value ?? option.id"
        :value="option[valueKey] ?? option.value ?? option.id"
      >{{ option[labelKey] ?? option.label ?? option.name }}</option>
    </select>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  loading: Boolean,
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Selecione' },
  error: { type: String, default: '' },
  autocomplete: { type: Boolean, default: false },
  filterLocally: { type: Boolean, default: true },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
});

const emit = defineEmits(['update:modelValue', 'search', 'select']);
const searchText = ref('');
const isOpen = ref(false);
const visibleOptions = computed(() => {
  if (!props.filterLocally || !searchText.value.trim()) return props.options;
  const query = searchText.value.toLocaleLowerCase('pt-BR');
  return props.options.filter((option) =>
    String(option[props.labelKey] ?? option.label ?? option.name ?? '')
      .toLocaleLowerCase('pt-BR')
      .includes(query),
  );
});

function onSearch(event) {
  searchText.value = event.target.value;
  emit('update:modelValue', '');
  emit('search', searchText.value);
  isOpen.value = true;
}

function selectOption(option) {
  const value = option[props.valueKey] ?? option.value ?? option.id;
  searchText.value = String(option[props.labelKey] ?? option.label ?? option.name ?? value);
  emit('update:modelValue', value);
  emit('select', option);
  isOpen.value = false;
}

function onNativeChange(event) {
  const option = props.options.find(
    (item) => String(item[props.valueKey] ?? item.value ?? item.id) === event.target.value,
  );
  emit('update:modelValue', event.target.value);
  if (option) emit('select', option);
}

watch(() => props.modelValue, (value) => {
  if (!value) {
    if (!isOpen.value) searchText.value = '';
    return;
  }
  if (props.autocomplete) {
    const option = props.options.find(
      (item) => String(item[props.valueKey] ?? item.value ?? item.id) === String(value),
    );
    if (option) searchText.value = String(option[props.labelKey] ?? option.label ?? option.name ?? '');
  }
});
</script>
