<template>
  <div
    class="dashboard-theme min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(44,169,97,0.10),_transparent_34%),linear-gradient(180deg,_#F7F5EF_0%,_#F1F4ED_100%)] text-slate-900"
  >
    <div class="flex min-h-screen w-full">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-30 bg-slate-950/45 lg:hidden"
        aria-hidden="true"
        @click="$emit('close-sidebar')"
      ></div>

      <aside
        class="fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-[#DFE3D9] bg-[#F7F5EF]/95 shadow-[0_12px_28px_rgba(39,59,48,0.08)] backdrop-blur-xl transition-transform duration-300 lg:translate-x-0"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      >
        <slot name="sidebar" />
      </aside>

      <div class="flex min-h-screen w-full flex-1 flex-col lg:ml-72">
        <div class="sticky top-0 z-20 w-full border-b border-[#DFE3D9] bg-[#F7F5EF]/90 backdrop-blur-xl">
          <slot name="topbar" />
        </div>

        <main class="flex-1 px-4 pb-5 sm:p-6 lg:p-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  sidebarOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['close-sidebar']);
</script>
