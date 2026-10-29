<template>
  <header class="sticky top-0 z-50 bg-[#F7F5EF]">
    <div class="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-6 min-[1080px]:px-[7.22%]">
      <a href="#topo" class="flex shrink-0 items-center gap-3" aria-label="Cultiva, início">
        <img src="/favicon.png" alt="" class="h-11 w-11 rounded-[10px] object-contain" />
        <span class="font-display text-[27px] font-semibold text-[#287A4E]">Cultiva</span>
      </a>

      <nav class="hidden items-center gap-4 text-[12px] text-[#56665D] min-[720px]:flex min-[1080px]:gap-7 min-[1080px]:text-sm">
        <a href="#como-funciona" class="landing-nav-link hover:text-[#2CA961]">Como Funciona</a>
        <a href="#beneficios" class="landing-nav-link hover:text-[#2CA961]">Benefícios</a>
        <a href="#tecnologia" class="landing-nav-link hover:text-[#2CA961]">Tecnologia</a>
        <a href="#impacto" class="landing-nav-link hover:text-[#2CA961]">Impacto</a>
      </nav>

      <RouterLink
        :to="auth.isLoggedIn ? '/dashboard' : '/login'"
        class="landing-button shrink-0 rounded-full bg-[#287A4E] px-4 py-3 text-xs font-semibold text-white hover:bg-[#226640] min-[1080px]:px-7 min-[1080px]:text-[15px]"
      >
        Acessar Dashboard
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth';

const auth = useAuth();
</script>
