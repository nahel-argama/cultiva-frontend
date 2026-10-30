<template>
  <VueApexCharts
    type="pie"
    height="360"
    :options="chartOptions"
    :series="series"
  />
</template>

<script setup>
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const props = defineProps({
  results: { type: Array, required: true },
  others: { type: Object, default: null },
});

const series = computed(() => [
  ...props.results.map((item) => Number(item.total)),
  ...(props.others ? [Number(props.others.total)] : []),
]);

const chartOptions = computed(() => ({
  chart: { type: 'pie', fontFamily: 'inherit' },
  labels: [
    ...props.results.map((item) => item.product_name),
    ...(props.others ? ['Outros'] : []),
  ],
  legend: { position: 'bottom' },
  tooltip: { y: { formatter: (value) => `${value} desejos` } },
  responsive: [{ breakpoint: 480, options: { chart: { width: 300 } } }],
}));
</script>
