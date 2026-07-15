<template>
  <div>
    <div class="mb-3">
      <div class="overflow-x-auto">
        <MetaTabGroup v-model="colorFilter" :options="colorTabOptions" class="xl:w-fit" />
      </div>
    </div>

    <MetaCardSection
      title="Top Signature Cards"
      :cards="filteredSigCards"
      @toggle-enlarge="$emit('toggle-enlarge', $event)"
    >
      <template #footer="{ card }">
        <div class="mt-2 text-center font-mono text-xs text-gray-500 dark:text-nalika-text-muted">
          {{ card.archetypeCount }} archetypes
        </div>
      </template>
    </MetaCardSection>

    <MetaCardSection
      title="Top 10 Cards"
      :cards="filteredTopCards"
      :loading="loadingCards"
      empty-text="Select a series to view card data"
      @toggle-enlarge="$emit('toggle-enlarge', $event)"
    >
      <template #tabs>
        <div class="ml-auto flex flex-col gap-2 sm:flex-row">
          <div class="flex justify-end overflow-x-auto">
            <MetaTabGroup v-model="cardTab" :options="cardMetricOptions" />
          </div>
          <div class="flex justify-end overflow-x-auto">
            <MetaTabGroup v-model="typeTab" :options="cardTypeOptions" />
          </div>
        </div>
      </template>
      <template #footer="{ card }">
        <div class="mt-2 flex flex-col items-center justify-center text-xs">
          <span class="font-mono text-gray-500 dark:text-nalika-text-muted" title="Decks included">
            {{ card.totalDecksIncluded }} ({{
              percentOf1(card.totalDecksIncluded, totalSeriesDecks)
            }}%)
          </span>
          <span
            v-if="cardTab === 'archetype'"
            class="font-mono text-blue-500 dark:text-blue-400"
            title="Archetypes"
          >
            {{ card.archetypeCount }}
            <span v-if="card.archetypeCount">
              ({{ percentOf1(card.archetypeCount, totalArchetypes) }}%)
            </span>
          </span>
          <span
            v-else
            class="font-mono text-yellow-600 dark:text-yellow-600"
            title="Champion decks"
          >
            {{ card.totalWinnerDecks }} ({{
              percentOf1(card.totalWinnerDecks, totalSeriesWinnerDecks)
            }}%)
          </span>
        </div>
      </template>
    </MetaCardSection>
  </div>
</template>

<script setup>
const colorFilter = defineModel('colorFilter', { type: String, default: null })
const cardTab = defineModel('cardTab', { type: String, default: 'played' })
const typeTab = defineModel('typeTab', { type: String, default: null })

defineProps({
  filteredSigCards: { type: Array, default: () => [] },
  filteredTopCards: { type: Array, default: () => [] },
  loadingCards: { type: Boolean, default: false },
  colorTabOptions: { type: Array, default: () => [] },
  cardMetricOptions: { type: Array, default: () => [] },
  cardTypeOptions: { type: Array, default: () => [] },
  percentOf1: { type: Function, required: true },
  totalSeriesDecks: { type: Number, default: 0 },
  totalArchetypes: { type: Number, default: 0 },
  totalSeriesWinnerDecks: { type: Number, default: 0 },
})

defineEmits(['toggle-enlarge'])
</script>
