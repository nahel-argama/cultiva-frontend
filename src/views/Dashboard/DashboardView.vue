<template>
  <DashboardShell :sidebar-open="sidebarOpen" @close-sidebar="sidebarOpen = false">
    <template #sidebar>
      <DashboardSidebar
        :profile="profile"
        :active-item-id="activeItemId"
        :is-verified="isVerified"
        @close-sidebar="sidebarOpen = false"
        @select="handleSelect"
      />
    </template>

    <template #topbar>
      <DashboardTopbar
        :title="profile.title"
        :subtitle="profile.subtitle"
        :role-label="roleLabel"
        :user-name="userName"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />
    </template>

    <component
      :is="activeViewComponent"
      :role-label="roleLabel"
      :eyebrow="roleLabel"
      :title="activeNavItem?.title || profile.title"
      :description="activeNavItem?.description || profile.subtitle"
    />
  </DashboardShell>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import DashboardShell from '@/components/dashboard/DashboardShell.vue';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar.vue';
import DashboardTopbar from '@/components/dashboard/DashboardTopbar.vue';
import { dashboardProfiles } from '@/data/dashboard';
import StockView from '@/components/dashboard/views/StockView.vue';
import ExploreOffersView from '@/components/dashboard/views/ExploreOffersView.vue';
import WishlistView from '@/components/dashboard/views/WishlistView.vue';
import PurchaseHistoryView from '@/components/dashboard/views/PurchaseHistoryView.vue';
import SalesHistoryView from '@/components/dashboard/views/SalesHistoryView.vue';
import ProfileView from '@/components/dashboard/views/ProfileView.vue';
import DashboardPlaceholderView from '@/components/dashboard/views/DashboardPlaceholderView.vue';

const auth = useAuth();
const route = useRoute();
const dashboardViewRegistry = {
  producer: {
    'meu-estoque': StockView,
    'historico-venda': SalesHistoryView,
    'wishlist-analytics': DashboardPlaceholderView,
    'meu-perfil': ProfileView,
  },
  retailer: {
    'explorar-ofertas': ExploreOffersView,
    'lista-desejos': WishlistView,
    'historico-compra': PurchaseHistoryView,
    'meu-perfil': ProfileView,
  },
  delivery: {
    'visao-geral': DashboardPlaceholderView,
    'minhas-entregas': DashboardPlaceholderView,
    'historico-entregas': DashboardPlaceholderView,
    'meu-perfil': ProfileView,
  },
};

const sidebarOpen = ref(false);
const activeItemId = ref('');
const isVerified = computed(() => auth.profileData.value?.user?.is_verified === true);

const currentRole = computed(() => auth.profileData.value?.profile_type || 'retailer');
const profile = computed(() => dashboardProfiles[currentRole.value] || dashboardProfiles.retailer);
const defaultActiveItemId = computed(() =>
  !isVerified.value && profile.value.navItems.some((item) => item.id === 'meu-perfil')
    ? 'meu-perfil'
    : profile.value.navItems[0]?.id || '',
);
const userName = computed(() => auth.profileData.value?.user?.name || 'Usuário Cultiva');
const roleLabel = computed(() => {
  return { producer: 'Produtor', retailer: 'Varejista', delivery: 'Entregador' }[currentRole.value] || 'Usuário';
});

const activeViewComponent = computed(() => {
  return (
    dashboardViewRegistry[currentRole.value]?.[activeItemId.value] ||
    dashboardViewRegistry[currentRole.value]?.[defaultActiveItemId.value] ||
    DashboardPlaceholderView
  );
});

const activeNavItem = computed(() => profile.value.navItems.find((item) => item.id === activeItemId.value));

function hasNavItem(itemId) {
  return profile.value.navItems.some((item) => item.id === itemId);
}

function handleSelect(itemId) {
  if (!isVerified.value && itemId !== 'meu-perfil') return;
  activeItemId.value = itemId;
  sidebarOpen.value = false;
}

watch(
  defaultActiveItemId,
  (nextDefaultItemId) => {
    if (!hasNavItem(activeItemId.value) || (!isVerified.value && activeItemId.value !== 'meu-perfil')) {
      activeItemId.value = nextDefaultItemId;
    }
  },
  { immediate: true },
);

onMounted(() => {
  auth.refreshProfile().catch(() => {});
});

watch(
  () => route.query.tab,
  (tabFromQuery) => {
    if (typeof tabFromQuery !== 'string') {
      return;
    }

    if (hasNavItem(tabFromQuery) && (isVerified.value || tabFromQuery === 'meu-perfil')) {
      activeItemId.value = tabFromQuery;
    }
  },
  { immediate: true },
);
</script>
