<template>
  <div class="mx-auto max-w-7xl space-y-6 p-2 md:p-8">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-nalika-text">Welcome to GCG</h1>

    <p class="text-gray-600 dark:text-nalika-text-muted">
      This is body text using Tailwind gray utilities.
    </p>

    <div class="space-y-3 md:hidden">
      <MobileTierCard v-for="row in rows" :key="row.archetype" :row="row" />
    </div>

    <TierTable :rows="rows" />
  </div>
</template>

<script setup>
import { rows } from '@/data/tiers'
</script>
