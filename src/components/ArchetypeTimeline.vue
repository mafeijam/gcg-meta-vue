<template>
  <div
    class="mb-6 rounded border border-gray-500/10 bg-shironezumi/2 p-2 dark:border-nalika-border dark:bg-nalika-surface"
  >
    <h2
      class="mb-3 text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-nalika-text-muted"
    >
      Archetype Timeline
    </h2>
    <div v-if="timeline.length > 1">
      <table class="grid w-full table-fixed text-xs sm:table">
        <colgroup class="hidden sm:table-column-group">
          <col />
          <col class="w-[60px]" />
          <col class="w-[60px]" />
          <col class="w-[60px]" />
          <col class="w-[60px]" />
          <col class="w-[60px]" />
        </colgroup>
        <thead class="hidden sm:table-header-group">
          <tr class="border-b border-gray-200 text-left dark:border-gray-700">
            <th class="pr-3 pb-2 font-semibold text-gray-500 dark:text-gray-400">Series</th>
            <th class="pr-3 pb-2 font-semibold text-gray-500 dark:text-gray-400">Tier</th>
            <th class="pr-3 pb-2 text-right font-semibold text-gray-500 dark:text-gray-400">
              Cards
            </th>
            <th class="pr-3 pb-2 text-right font-semibold text-gray-500 dark:text-gray-400">
              Wins
            </th>
            <th class="pr-3 pb-2 text-right font-semibold text-gray-500 dark:text-gray-400">
              Decks
            </th>
            <th class="pb-2 text-right font-semibold text-gray-500 dark:text-gray-400">Use %</th>
          </tr>
        </thead>
        <tbody class="contents sm:table-row-group">
          <tr
            v-for="entry in timeline"
            :key="entry.seriesKey"
            class="mb-2 grid grid-cols-4 gap-1 rounded p-2 sm:mb-0 sm:table-row sm:gap-0 sm:rounded-none sm:p-0"
            :class="[
              entry.isCurrent
                ? 'bg-primary/5 dark:bg-primary/10'
                : 'cursor-pointer bg-gray-50/50 hover:bg-gray-100 sm:cursor-pointer sm:bg-transparent sm:hover:bg-gray-50 dark:bg-white/[0.03] dark:hover:bg-white/[0.05] sm:dark:hover:bg-white/[0.03]',
            ]"
            @click="goToEntry(entry)"
          >
            <td class="col-span-4 pr-3 sm:col-span-1 md:py-2 dark:text-nalika-text">
              <span class="font-medium">{{ entry.label }}</span>
            </td>
            <td class="pt-1.5 pr-3 md:py-2">
              <span
                class="inline-block w-10 rounded px-1.5 py-0.5 text-center text-xxs font-bold"
                :class="tierPillClass(entry.tier)"
              >
                {{ entry.tier }}
              </span>
            </td>
            <td
              class="pt-1.5 pr-3 text-right font-mono text-gray-700 sm:pr-3 md:py-2 dark:text-nalika-text"
            >
              {{ entry.cardCount }}
            </td>
            <td
              class="hidden pt-1.5 pr-3 text-right font-mono text-gray-700 sm:table-cell md:py-2 dark:text-nalika-text"
            >
              {{ entry.winnerDeckCount }}
            </td>
            <td
              class="pt-1.5 pr-3 text-right font-mono text-gray-700 sm:pr-3 md:py-2 dark:text-nalika-text"
            >
              {{ entry.deckCount }}
            </td>
            <td class="pt-1.5 text-right font-mono text-gray-700 md:py-2 dark:text-nalika-text">
              {{ entry.percent }}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
      This archetype only appeared in the current series
    </p>
  </div>
</template>

<script setup>
import manifest from '$data/archetypes/index.json'

const props = defineProps({
  combo: { type: String, required: true },
  currentSeriesKey: { type: String, required: true },
})

const emit = defineEmits(['navigate'])

const timeline = computed(() =>
  manifest
    .map(series => {
      const arch = series.archetypes.find(a => a.combo === props.combo)
      if (!arch) {
        return null
      }
      const archIndex = series.archetypes.findIndex(a => a.combo === props.combo)
      return {
        seriesKey: series.value,
        archIndex,
        label: series.label,
        deckCount: arch.deckCount,
        winnerDeckCount: arch.winnerDeckCount,
        percent: arch.percent,
        cardCount: arch.cardCount,
        tier: arch.tier,
        isCurrent: series.value === props.currentSeriesKey,
      }
    })
    .filter(Boolean),
)

function goToEntry(entry) {
  if (entry.isCurrent) {
    return
  }
  emit('navigate', { seriesKey: entry.seriesKey, archIndex: String(entry.archIndex) })
}
</script>
