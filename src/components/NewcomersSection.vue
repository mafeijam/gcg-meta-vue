<template>
  <MetaCardSection
    title="Newcomers"
    :cards="recentlyUsedCards"
    empty-text="No new cards used"
    @toggle-enlarge="$emit('toggle-enlarge', $event)"
  >
    <template #footer="{ card }">
      <div class="mt-2 flex flex-col items-center justify-center text-xs">
        <span class="font-mono text-gray-500 dark:text-nalika-text-muted" title="Decks included">
          {{ card.totalDecksIncluded }} ({{
            percentOf1(card.totalDecksIncluded, totalSeriesDecks)
          }}%)
        </span>
        <span class="font-mono text-yellow-600 dark:text-yellow-600" title="Champion decks">
          {{ card.totalWinnerDecks }} ({{
            percentOf1(card.totalWinnerDecks, totalSeriesWinnerDecks)
          }}%)
        </span>
      </div>
    </template>
  </MetaCardSection>
</template>

<script setup>
defineProps({
  recentlyUsedCards: { type: Array, default: () => [] },
  percentOf1: { type: Function, required: true },
  totalSeriesDecks: { type: Number, default: 0 },
  totalSeriesWinnerDecks: { type: Number, default: 0 },
})

defineEmits(['toggle-enlarge'])
</script>
