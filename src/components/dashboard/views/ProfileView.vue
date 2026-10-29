<template>
  <section class="space-y-6 pb-6">
    <!-- Estado de loading -->
    <ProfileSkeleton v-if="isLoading" />

    <!-- Estado de erro -->
    <div
      v-else-if="error"
      class="flex min-h-[calc(100vh-12rem)] items-center justify-center rounded-[28px] border border-dashed border-red-200 bg-red-50/40 p-10"
    >
      <div class="max-w-sm text-center">
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-500"
        >
          <ExclamationTriangleIcon class="h-7 w-7" />
        </div>
        <h3 class="text-base font-bold text-slate-800">Erro ao carregar perfil</h3>
        <p class="mt-2 text-sm text-slate-500">{{ error }}</p>
        <button
          type="button"
          class="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
          @click="load"
        >
          <ArrowPathIcon class="h-4 w-4" />
          Tentar novamente
        </button>
      </div>
    </div>

    <!-- Conteúdo do perfil -->
    <template v-else-if="profile">
      <ProfileBanner
        :name="profile.name"
        :user-type="userTypeLabel"
        :location="cityStateLabel"
        :banner-src="BANNER_IMAGE"
      />

      <article class="rounded-[28px] border border-slate-200/85 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-7">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 class="text-xl font-black tracking-tight text-slate-900">Verificação de documento</h3>
            <p class="mt-1 text-sm text-slate-500">
              A validação do seu documento libera o acesso completo à plataforma.
            </p>
          </div>
          <span
            class="rounded-full px-3 py-1.5 text-sm font-bold"
            :class="isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'"
          >
            {{ isVerified ? 'Verificado' : 'Pendente' }}
          </span>
        </div>

        <template v-if="!isVerified">
          <p class="mt-5 text-sm leading-relaxed text-slate-600">
            Envie uma imagem do seu RG para análise. Aceitamos JPG, PNG ou WebP de até 5 MB.
          </p>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label class="flex min-h-12 flex-1 cursor-pointer items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50/50 focus-within:ring-2 focus-within:ring-emerald-300">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="sr-only"
                :disabled="isUploading || isVerificationPending"
                @change="selectDocument"
              />
              <span class="truncate">{{ selectedDocument?.name || 'Selecionar imagem do RG' }}</span>
            </label>
            <button
              type="button"
              class="min-h-12 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!selectedDocument || isUploading || isVerificationPending"
              @click="sendDocument"
            >
              {{ isUploading ? 'Enviando...' : 'Enviar documento' }}
            </button>
          </div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p class="text-sm text-slate-500">Após o envio, a análise pode levar alguns instantes.</p>
          </div>
        </template>
      </article>

      <AccountInfoCard title="Informações da Conta" :sections="accountSections" />
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

import ProfileBanner from './profile/ProfileBanner.vue';
import AccountInfoCard from './profile/AccountInfoCard.vue';
import ProfileSkeleton from './profile/ProfileSkeleton.vue';

import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import { getDocumentVerificationStatus, uploadDocument } from '@/services/api';

// ── Props ─────────────────────────────────────────────────────────────────────

const props = defineProps({
  roleLabel: {
    type: String,
    required: true,
  },
});

// ── State ─────────────────────────────────────────────────────────────────────

const profile = ref(null);
const isLoading = ref(false);
const error = ref(null);
const auth = useAuth();
const toast = useToast();
const selectedDocument = ref(null);
const isUploading = ref(false);
const isVerificationPending = ref(false);
const isVerified = computed(() => auth.profileData.value?.user?.is_verified === true);
let verificationGeneration = 0;
let verificationTimer;

// ── Fetch ─────────────────────────────────────────────────────────────────────

async function load() {
  isLoading.value = true;
  error.value = null;

  try {
    const data = auth.profileData.value;
    if (!data?.user || !data?.profile_type || !data?.profile) {
      throw new Error('Profile data is not available in the current session.');
    }

    profile.value = {
      name: data.user.name,
      email: data.user.email,
      profile_type: data.profile_type,
      profile: data.profile,
    };
  } catch {
    error.value = 'Entre novamente para carregar as informações do seu perfil.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(load);
onUnmounted(stopVerificationPolling);

function stopVerificationPolling() {
  verificationGeneration += 1;
  clearTimeout(verificationTimer);
  verificationTimer = undefined;
  isVerificationPending.value = false;
}

function startVerificationPolling() {
  stopVerificationPolling();
  isVerificationPending.value = true;
  const generation = verificationGeneration;

  function scheduleCheck(delay) {
    verificationTimer = setTimeout(checkVerification, delay);
  }

  async function checkVerification() {
    if (generation !== verificationGeneration) return;

    let response;
    try {
      response = await getDocumentVerificationStatus();
    } catch (statusError) {
      if (generation !== verificationGeneration) return;
      if (statusError?.status === 404) {
        stopVerificationPolling();
        toast.error(statusError.message || 'Não foi possível localizar o status do documento.', 'Falha na verificação');
        return;
      }
      scheduleCheck(5_000);
      return;
    }

    if (generation !== verificationGeneration) return;
    const { status, message } = response?.data ?? {};

    if (status === 'approved') {
      try {
        await auth.refreshProfile();
      } catch {
        if (generation === verificationGeneration) scheduleCheck(5_000);
        return;
      }
      if (generation !== verificationGeneration) return;
      stopVerificationPolling();
      toast.success('Seu documento foi validado.', 'Verificação concluída');
      return;
    }

    if (status === 'failed') {
      stopVerificationPolling();
      toast.error(message || 'Não foi possível validar seu documento.', 'Falha na verificação');
      return;
    }

    if (status !== 'pending') {
      stopVerificationPolling();
      toast.error('Não foi possível consultar o status do documento.', 'Falha na verificação');
      return;
    }

    if (generation !== verificationGeneration) return;
    scheduleCheck(5_000);
  }

  scheduleCheck(8_000);
}

function selectDocument(event) {
  const file = event.target.files?.[0] ?? null;
  event.target.value = '';
  selectedDocument.value = null;

  if (!file) return;

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    toast.warning('Escolha uma imagem JPG, PNG ou WebP.', 'Formato inválido');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.warning('O arquivo deve ter no máximo 5 MB.', 'Arquivo muito grande');
    return;
  }

  selectedDocument.value = file;
}

async function sendDocument() {
  if (!selectedDocument.value || isUploading.value || isVerificationPending.value) return;

  isUploading.value = true;
  try {
    await uploadDocument(selectedDocument.value);
    selectedDocument.value = null;
    startVerificationPolling();
  } catch (uploadError) {
    toast.error(uploadError?.message || 'Não foi possível enviar o documento.', 'Falha no envio');
  } finally {
    isUploading.value = false;
  }
}

// ── Computed fields ───────────────────────────────────────────────────────────

const USER_TYPE_LABEL = {
  PRODUTOR: 'Produtor',
  VAREJISTA: 'Varejista',
  DELIVERY: 'Entregador',
  ADMIN: 'Administrador',
};

const ACTIVITY_SEGMENT_LABEL = {
  vegetables: 'Hortaliças',
  fruits: 'Frutas',
  tubers_roots: 'Tubérculos e raízes',
  herbs_spices: 'Ervas e especiarias',
  grains: 'Grãos',
  specialty: 'Especialidades',
};

const BUSINESS_TYPE_LABEL = {
  supermarket: 'Supermercado',
  hortifruti: 'Hortifruti',
  restaurant: 'Restaurante',
};

const CARGO_TYPE_LABEL = {
  dry: 'Carga seca',
  climate_controlled: 'Climatizada',
  refrigerated: 'Refrigerada',
};

const BANNER_IMAGE = '/Hero_image.jpg';

const userTypeLabel = computed(() => {
  const p = profile.value;
  if (!p) return props.roleLabel;
  const profileType = String(p.profile_type ?? p.user_type ?? '').toUpperCase();
  return USER_TYPE_LABEL[profileType] || props.roleLabel;
});

const cityStateLabel = computed(() => {
  return 'Localização não informada';
});

const accountSections = computed(() => {
  const p = profile.value;
  if (!p) return [];

  const roleFields = [];

  if (p.profile_type === 'producer') {
    roleFields.push({
      label: 'Segmento de atividade',
      value: ACTIVITY_SEGMENT_LABEL[p.profile?.activity_segment] ?? p.profile?.activity_segment,
    });
  } else if (p.profile_type === 'retailer') {
    roleFields.push({
      label: 'Tipo de negócio',
      value: BUSINESS_TYPE_LABEL[p.profile?.business_type] ?? p.profile?.business_type,
    });
  } else if (p.profile_type === 'delivery') {
    roleFields.push(
      { label: 'Categoria da CNH', value: p.profile?.cnh_category },
      { label: 'Placa do veículo', value: p.profile?.vehicle?.plate },
      {
        label: 'Tipo de carga',
        value: CARGO_TYPE_LABEL[p.profile?.vehicle?.cargo_type] ?? p.profile?.vehicle?.cargo_type,
      },
    );
  }

  const sections = [
    {
      title: 'Dados Básicos',
      fields: [
        { label: 'Email', value: p.email },
        { label: 'Tipo de Usuário', value: userTypeLabel.value },
      ],
    },
    {
      title: 'Informações adicionais',
      fields: [
        { label: 'Nome Fantasia', value: p.profile?.trade_name, full: true },
      ],
    },
  ];

  if (roleFields.length) {
    sections.push({ title: 'Informações do perfil', fields: roleFields });
  }

  return sections;
});
</script>
