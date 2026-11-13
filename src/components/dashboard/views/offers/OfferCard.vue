<template>
  <article
    class="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    :class="item.is_in_wishlist ? 'border-2 border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 hover:border-emerald-200'"
  >
    <div v-if="cartQuantity > 0" class="absolute right-5 top-5 z-10">
      <div class="group/cart relative" tabindex="0" :aria-label="`${cartQuantity} kg no carrinho`">
        <span class="flex h-10 min-w-10 items-center justify-center rounded-full bg-emerald-700 px-2 text-base font-black text-white shadow-md">{{ cartQuantity }} kg</span>
        <span role="tooltip" class="pointer-events-none absolute right-0 top-full mt-2 w-max max-w-48 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/cart:opacity-100 group-focus/cart:opacity-100">
          {{ cartQuantity }} kg deste produto no carrinho
        </span>
      </div>
    </div>
    <div class="flex flex-1 flex-col p-3">
      <div
        v-if="imageUrl"
        class="overflow-hidden rounded-xl bg-slate-50"
      >
        <div class="aspect-[2/1] w-full">
          <AppSecureImage
            :src="imageUrl"
            :alt="capitalize(item.name || '')"
            object-fit-class="object-cover"
          />
        </div>
      </div>
      <div v-else class="rounded-xl bg-slate-50">
        <div
          class="flex aspect-[2/1] items-center justify-center text-slate-300"
        >
          <div class="text-center">
            <div
              class="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-300"
            >
              <PhotoIcon class="h-7 w-7" />
            </div>
            <p class="mt-1 text-xs font-semibold text-slate-500">Sem foto</p>
          </div>
        </div>
      </div>


      <div class="mt-3 flex items-start justify-between gap-2">
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <h3 class="truncate text-2xl font-bold tracking-tight text-slate-900">
              {{ capitalize(item.name || '') }}
            </h3>
            <span
              v-if="item.is_in_wishlist"
              class="shrink-0 rounded-full bg-rose-100 px-3 py-1 text-base font-bold text-rose-800"
            >♥ Na lista de desejos</span>
          </div>
          <p v-if="item.producer_name" class="mt-0.5 text-sm text-slate-500">
            Vendido por: <span class="font-semibold text-slate-700">{{ item.producer_name }}</span>
          </p>
          <p
            v-if="item.distance_km !== null && item.distance_km !== undefined"
            class="mt-0.5 flex items-center gap-1 text-sm text-slate-500"
          >
            <MapPinIcon class="h-4 w-4 shrink-0 text-slate-700" />
            <span class="truncate">A <span class="font-bold text-slate-700">{{ item.distance_km }} km</span> de distância</span>
          </p>
        </div>
        <button
          v-if="item.description"
          type="button"
          class="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-emerald-200 hover:text-emerald-600 focus:outline-none"
          :aria-label="`Ver descrição de ${capitalize(item.name || '')}`"
          @click="openDescriptionModal"
        >
          <InformationCircleIcon class="h-5 w-5" />
        </button>
      </div>

      <div class="mt-auto pt-3">
        <div class="inline-flex max-w-full items-center gap-3 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-900">
          <p class="whitespace-nowrap text-xl font-extrabold">R$ {{ item.price }} <span class="text-sm font-semibold text-emerald-700">/kg</span></p>
          <div class="flex min-w-0 items-center gap-2 border-l border-emerald-200 pl-3 text-sm font-semibold">
            <CubeIcon class="h-5 w-5 shrink-0" />
            <span>{{ availableQuantity }} kg disponíveis</span>
          </div>
        </div>
      </div>

      <div class="mt-3 space-y-2">
        <button
          type="button"
          class="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-base font-extrabold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          :disabled="isAdding || availableQuantity <= 0"
          @click="openQuantityModal"
        >
          {{ isAdding ? 'Adicionando...' : 'Adicionar ao Carrinho' }}
        </button>
      </div>
    </div>

    <AppDialog
      v-model="isQuantityOpen"
      :title="`Adicionar ${capitalize(item.name || '')} ao carrinho`"
      confirm-label="Adicionar ao carrinho"
      @confirm="handleAddToCart"
    >
      <p class="text-sm text-slate-600">Quantidade disponível: {{ availableQuantity }} kg</p>
      <label :for="`offer-quantity-${item.id}`" class="mt-4 block text-sm font-semibold text-slate-700">Quantos kg deseja adicionar?</label>
      <input
        :id="`offer-quantity-${item.id}`"
        v-model.number="selectedQuantity"
        type="number"
        min="1"
        step="1"
        :max="availableQuantity"
        class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100"
        @blur="normalizeQuantity"
        @keyup.enter="handleAddToCart"
      />
    </AppDialog>

    <AppDialog
      v-model="isDescriptionOpen"
      :title="`Descrição: ${capitalize(item.name || '')}`"
      variant="success"
      confirm-label="Fechar"
      :show-cancel="false"
      @confirm="isDescriptionOpen = false"
    >
      <div 
        class="whitespace-pre-wrap text-left text-sm text-slate-600 leading-relaxed max-h-[40vh] overflow-y-auto px-1 custom-scrollbar" 
        v-html="formattedDescription"
      ></div>
    </AppDialog>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { PhotoIcon, InformationCircleIcon, MapPinIcon, CubeIcon } from '@heroicons/vue/24/outline';
import AppSecureImage from '@/components/ui/AppSecureImage.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import { capitalize } from '@/utils/string';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  cartQuantity: {
    type: Number,
    default: 0,
  },
  isAdding: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['add-to-cart']);
const selectedQuantity = ref(1);

const imageUrl = computed(() => {
  return props.item.image_url || null;
});

const availableQuantity = computed(() => Number(props.item.available_quantity));

const isDescriptionOpen = ref(false);
const isQuantityOpen = ref(false);

const formattedDescription = computed(() => {
  if (!props.item.description) return '';
  return props.item.description
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
});

function openDescriptionModal() {
  isDescriptionOpen.value = true;
}

const canAddToCart = computed(() => {
  return (
    !props.isAdding &&
    availableQuantity.value > 0 &&
    Number.isInteger(selectedQuantity.value) &&
    selectedQuantity.value > 0 &&
    selectedQuantity.value <= availableQuantity.value
  );
});

function normalizeQuantity() {
  const nextValue = Math.trunc(Number(selectedQuantity.value || 0));

  if (!Number.isFinite(nextValue) || nextValue < 1) {
    selectedQuantity.value = 1;
    return;
  }

  selectedQuantity.value = Math.min(nextValue, Math.max(1, availableQuantity.value));
}

function openQuantityModal() {
  selectedQuantity.value = 1;
  isQuantityOpen.value = true;
}

function handleAddToCart() {
  normalizeQuantity();

  if (!canAddToCart.value) {
    return;
  }

  isQuantityOpen.value = false;
  emit('add-to-cart', {
    product: props.item,
    quantity: selectedQuantity.value,
  });
}

watch(availableQuantity, (nextAvailable) => {
  if (nextAvailable <= 0) {
    selectedQuantity.value = 1;
    return;
  }

  if (selectedQuantity.value > nextAvailable) {
    selectedQuantity.value = nextAvailable;
  }
});
</script>
