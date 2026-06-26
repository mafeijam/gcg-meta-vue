<template>
  <div class="mx-auto max-w-7xl space-y-6 p-3 md:p-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-nalika-text">Archetype Tier</h1>
      <select
        v-model="selectedKey"
        class="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-nalika-border dark:bg-nalika-surface dark:text-nalika-text"
      >
        <option value="jun">NTC MISSION3（6月開催）</option>
        <option value="may">NTC MISSION3（5月開催）</option>
        <option value="mar">NTC MISSION2（3月開催）</option>
      </select>
    </div>

    <div class="space-y-3 md:hidden">
      <MobileTierCard v-for="row in rows" :key="row.archetype" :row="row" />
    </div>

    <TierTable :rows="rows" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { rowsJun, rowsMay, rowsMar } from '@/data/tiers'

const selectedKey = ref('jun')
const map = { jun: rowsJun, may: rowsMay, mar: rowsMar }
const rows = computed(() => map[selectedKey.value])
</script>
