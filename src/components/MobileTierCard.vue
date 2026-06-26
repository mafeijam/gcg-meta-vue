<template>
  <div class="overflow-hidden rounded-lg bg-white not-dark:shadow not-dark:shadow-gray-400/10 dark:bg-nalika-surface">
    <div :class="['flex h-9 items-center justify-between px-4', tierBarClass(row.tier)]">
      <span class="text-sm font-bold text-gray-700 uppercase dark:text-gray-200">
        {{ row.tier }}
      </span>
      <span class="text-sm font-bold text-gray-700 dark:text-gray-200">
        {{ row.score }}
      </span>
    </div>

    <div class="px-4 pt-3 pb-2">
      <span class="inline-flex items-center gap-0.5">
        <span
          v-for="dot in row.colorDots"
          :key="dot.name"
          class="inline-block h-2 w-2 rounded-full"
          :style="{ background: dot.hex }"
        />
        <span class="font-bold text-gray-800 dark:text-nalika-text">{{ row.colors }}</span>
      </span>
      <span class="mt-0.5 block text-xs text-gray-500 dark:text-nalika-text-muted">
        （{{ row.archetype }}）
      </span>
    </div>

    <div class="grid grid-cols-4 gap-2 px-4 pb-2">
      <div>
        <span class="block text-[0.6rem] font-semibold tracking-widest text-gray-400 uppercase">Decks</span>
        <span
          class="font-mono text-sm font-bold text-gray-700 tabular-nums dark:text-nalika-text-muted"
        >
          {{ row.decks }}
        </span>
      </div>
      <div>
        <span class="block text-[0.6rem] font-semibold tracking-widest text-gray-400 uppercase">Wins</span>
        <span
          class="font-mono text-sm font-bold text-gray-700 tabular-nums dark:text-nalika-text-muted"
        >
          {{ row.wins }}
        </span>
      </div>
      <div class="col-start-4">
        <span class="block text-[0.6rem] font-semibold tracking-widest text-gray-400 uppercase">Top4</span>
        <span
          class="font-mono text-sm font-bold text-gray-700 tabular-nums dark:text-nalika-text-muted"
        >
          {{ row.top4 }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-2 px-4 pb-4">
      <div>
        <span class="block text-[0.6rem] font-semibold tracking-widest text-gray-400 uppercase">Use%</span>
        <span
          class="font-mono text-xs font-bold text-gray-700 tabular-nums dark:text-nalika-text-muted"
        >
          {{ row.usePct }}
        </span>
      </div>
      <div>
        <span class="block text-[0.6rem] font-semibold tracking-widest text-gray-400 uppercase">Win/Ev</span>
        <span
          class="font-mono text-xs font-bold text-gray-700 tabular-nums dark:text-nalika-text-muted"
        >
          {{ row.winPerEv }}
        </span>
      </div>
      <div>
        <span class="block text-[0.6rem] font-semibold tracking-widest text-gray-400 uppercase">Win/Dk</span>
        <span
          class="font-mono text-xs font-bold text-gray-700 tabular-nums dark:text-nalika-text-muted"
        >
          {{ row.winPerDk }}
        </span>
      </div>
      <div>
        <span class="block text-[0.6rem] font-semibold tracking-widest text-gray-400 uppercase">T4/Dk</span>
        <span
          class="font-mono text-xs font-bold text-gray-700 tabular-nums dark:text-nalika-text-muted"
        >
          {{ row.t4PerDk }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { tierBarClass } from '@/utils/tier'

defineProps({
  row: { type: Object, required: true },
})
</script>
