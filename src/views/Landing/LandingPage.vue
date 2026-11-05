<template>
  <Header />
  <Hero />
  <ProblemSection />
  <SolutionSection />
  <FeaturesSection />
  <TargetAudienceSection />
  <Footer />
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import Header from '@/components/landingPage/Header.vue';
import Hero from '@/components/landingPage/Hero.vue';
import ProblemSection from '@/components/landingPage/ProblemSection.vue';
import SolutionSection from '@/components/landingPage/SolutionSection.vue';
import FeaturesSection from '@/components/landingPage/FeaturesSection.vue';
import TargetAudienceSection from '@/components/landingPage/TargetAudienceSection.vue';
import Footer from '@/components/landingPage/Footer.vue';

let lenis;
let revealObserver;

onMounted(() => {
  lenis = new Lenis({ autoRaf: true, anchors: true });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '-140px 0px -140px 0px' });

  document.querySelectorAll('[data-scroll-reveal]').forEach((element) => revealObserver.observe(element));
  document.documentElement.classList.add('landing-reveal-ready');
});

onBeforeUnmount(() => {
  lenis?.destroy();
  revealObserver?.disconnect();
  document.documentElement.classList.remove('landing-reveal-ready');
});
</script>
