<template>
  <article
    class="group overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg"
  >
    <div class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h3 class="mt-2 truncate text-xl font-black tracking-tight text-slate-900">
            {{ capitalize(item.name) }}
          </h3>
          <p class="mt-1 text-sm font-medium text-slate-500">
            {{ item.available_quantity }} kg disponíveis | R$ {{ item.price }}/kg
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="item.description"
            type="button"
            class="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-emerald-200 hover:text-emerald-600 focus:outline-none"
            :aria-label="`Ver descrição de ${capitalize(item.name)}`"
            @click="openDescriptionModal"
          >
            <InformationCircleIcon class="h-5 w-5" />
          </button>

          <button
            type="button"
            class="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none"
            :aria-label="`Zerar estoque disponível de ${capitalize(item.name)}`"
            :disabled="isRemoving || item.available_quantity <= 0"
            @click="openDeleteDialog"
          >
            <TrashIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        v-if="imageUrl"
        class="mt-5 overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50"
      >
        <div class="aspect-[4/3] w-full">
          <AppSecureImage
            :src="imageUrl"
            :alt="capitalize(item.name)"
            object-fit-class="object-cover"
          />
        </div>
      </div>

      <div
        v-else
        class="mt-5 flex aspect-[4/3] items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50"
      >
        <div class="text-center">
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm"
          >
            <PhotoIcon class="h-7 w-7" />
          </div>
          <p class="mt-3 text-sm font-semibold text-slate-500">Imagem não disponível</p>
        </div>
      </div>
    </div>

    <AppDialog
      v-model="isDialogOpen"
      title="Zerar estoque disponível?"
      :message="`Zerar o saldo disponível de ${capitalize(item.name)}? Quantidades reservadas e histórico serão preservados. A oferta continuará no estoque com saldo disponível zero.`"
      variant="danger"
      confirm-label="Zerar estoque"
      :loading="isRemoving"
      @confirm="confirmDelete"
    />

    <AppDialog
      v-model="isDescriptionOpen"
      :title="`Descrição: ${capitalize(item.name)}`"
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
import { computed, ref } from 'vue';
import { PhotoIcon, TrashIcon, InformationCircleIcon } from '@heroicons/vue/24/outline';
import AppSecureImage from '@/components/ui/AppSecureImage.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import { clearAvailableStock } from '@/services/product';
import { capitalize } from '@/utils/string';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['updated']);

const isRemoving = ref(false);
const isDialogOpen = ref(false);
const isDescriptionOpen = ref(false);

const imageUrl = computed(() => {
  return props.item.images?.[0]?.image || null;
});

const formattedDescription = computed(() => {
  if (!props.item.description) return '';
  // Converte **texto** para <strong>texto</strong> e converte quebras de linha
  return props.item.description
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
});

function openDescriptionModal() {
  isDescriptionOpen.value = true;
}

function openDeleteDialog() {
  isDialogOpen.value = true;
}

async function confirmDelete() {
  isRemoving.value = true;
  try {
    await clearAvailableStock(props.item.id);
    emit('updated', props.item.id);
    isDialogOpen.value = false;
  } catch {
    // Silencia o erro, mantendo o estado do botão
  } finally {
    isRemoving.value = false;
  }
}
</script>
