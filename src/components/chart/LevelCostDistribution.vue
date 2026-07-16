<template>
  <div class="mb-6 grid gap-4 md:grid-cols-2">
    <ChartDistributionBars title="Level Distribution" :items="levelDist" color="#005caf" />
    <ChartDistributionBars title="Cost Distribution" :items="costDist" color="#0b346e" />
  </div>
</template>

<script setup>
defineProps({
  levelDist: { type: Array, default: () => [] },
  costDist: { type: Array, default: () => [] },
})
</script>
