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

      <AccountInfoCard title="Informações da Conta" :sections="accountSections" />
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';

import ProfileBanner from './profile/ProfileBanner.vue';
import AccountInfoCard from './profile/AccountInfoCard.vue';
import ProfileSkeleton from './profile/ProfileSkeleton.vue';

import { useAuth } from '@/composables/useAuth';

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
