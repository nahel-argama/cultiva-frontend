<template>
  <span aria-hidden="true" class="app-skeleton block rounded-md"></span>
</template>

<style scoped>
.app-skeleton {
  background: #e7ede8;
}

@media (prefers-reduced-motion: no-preference) {
  .app-skeleton {
    background-image: linear-gradient(105deg, transparent 35%, #f4f8f4 50%, transparent 65%);
    background-size: 250% 100%;
    animation: shimmer 1.8s ease-in-out infinite;
  }
}

@keyframes shimmer {
  from { background-position: 100% 0; }
  to { background-position: -65% 0; }
}
</style>
