<template>
  <div class="mx-auto max-w-340 p-3 pb-8 md:p-8">
    <SeriesHeader
      title="Meta Overview"
      :visible="!!currentSeries"
      :events="currentSeries?.events ?? 0"
      :wins="currentSeries?.winDecks ?? 0"
      :decks="currentSeries?.totalDecks ?? 0"
      :archetypes="allRows.length"
    />

    <div
      class="sticky top-12 z-40 -mx-3 mb-3 bg-white px-3 py-3 transition-transform duration-300 md:-mx-8 md:px-8 dark:bg-nalika-bg"
      :class="hideFilter ? '-translate-y-full' : 'translate-y-0'"
    >
      <GeneralDropdown
        v-model="selectedKey"
        class="ml-auto w-fit md:max-w-md"
        :options="seriesOptions"
      />
    </div>

    <!-- Tier Distribution + Color Distribution + Win Rate -->
    <div class="mb-6 grid gap-4 md:grid-cols-3">
      <div
        class="rounded border border-gray-500/10 bg-shironezumi/2 p-2 dark:border-nalika-border dark:bg-nalika-surface"
      >
        <h2
          class="mb-3 text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-nalika-text-muted"
        >
          Tier Distribution
        </h2>
        <div class="space-y-2">
          <div v-for="item in tierDist" :key="item.tier" class="flex items-center gap-2">
            <span
              class="w-10 rounded px-1.5 py-0.5 text-center text-xs font-bold"
              :class="tierPillClass(item.tier)"
            >
              {{ item.tier }}
            </span>
            <div class="h-5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700/70">
              <div
                class="h-full rounded-full transition-all"
                :class="tierBarClass(item.tier)"
                :style="{ width: `${item.percent}%` }"
              />
            </div>
            <span
              class="w-8 text-right font-mono text-xs font-bold text-gray-600 dark:text-nalika-text-muted"
            >
              {{ item.count }}
            </span>
          </div>
        </div>
      </div>

      <div
        class="rounded border border-gray-500/10 bg-shironezumi/2 p-2 dark:border-nalika-border dark:bg-nalika-surface"
      >
        <div class="mb-3 flex items-center justify-between">
          <h2
            class="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-nalika-text-muted"
          >
            Color Distribution
          </h2>
          <button
            v-if="allColorDist.length > colorDist.length"
            class="text-xxs font-medium text-ruri hover:underline"
            @click="viewAllModal = 'colors'"
          >
            View All →
          </button>
        </div>
        <div v-if="colorDist.length" class="space-y-2">
          <div v-for="item in colorDist" :key="item.colors" class="flex items-center gap-2">
            <div class="flex shrink-0 items-center gap-0.5">
              <div
                v-for="dot in item.colorDots"
                :key="dot.name"
                class="inline-block h-2.5 w-2.5 rounded-full"
                :style="{ background: dot.hex }"
              />
            </div>
            <span class="w-22 truncate text-xs font-medium text-aisumicha dark:text-nalika-text">
              {{ item.colors }}
            </span>
            <div class="h-5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700/70">
              <div
                class="h-full rounded-full"
                :style="{ width: `${item.percent}%`, background: item.barGradient }"
              />
            </div>
            <span
              class="w-14 text-right font-mono text-xs font-bold text-gray-600 dark:text-nalika-text-muted"
            >
              {{ item.decks }}
            </span>
          </div>
        </div>
        <p v-else class="text-xs text-gray-400 dark:text-gray-500">No data</p>
      </div>

      <div
        class="rounded border border-gray-500/10 bg-shironezumi/2 p-2 dark:border-nalika-border dark:bg-nalika-surface"
      >
        <div class="mb-3 flex items-center justify-between">
          <h2
            class="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-nalika-text-muted"
          >
            Events Won by Color Combo
          </h2>
          <button
            v-if="allWinRateDist.length > winRateDist.length"
            class="text-xxs font-medium text-ruri hover:underline"
            @click="viewAllModal = 'winrate'"
          >
            View All →
          </button>
        </div>
        <div v-if="winRateDist.length" class="space-y-2">
          <div v-for="item in winRateDist" :key="item.colors" class="flex items-center gap-2">
            <div class="flex shrink-0 items-center gap-0.5">
              <div
                v-for="dot in item.colorDots"
                :key="dot.name"
                class="inline-block h-2.5 w-2.5 rounded-full"
                :style="{ background: dot.hex }"
              />
            </div>
            <span class="w-22 truncate text-xs font-medium text-aisumicha dark:text-nalika-text">
              {{ item.colors }}
            </span>
            <div class="h-5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700/70">
              <div
                class="h-full rounded-full"
                :style="{ width: `${item.barPercent}%`, background: item.barGradient }"
              />
            </div>
            <span
              class="w-14 text-right font-mono text-xs font-bold text-gray-600 dark:text-nalika-text-muted"
            >
              {{ item.winRate.toFixed(1) }}%
            </span>
          </div>
        </div>
        <p v-else class="text-xs text-gray-400 dark:text-gray-500">No data</p>
      </div>
    </div>

    <!-- View All modal -->
    <ViewAllModal
      :visible="!!viewAllModal"
      :items="viewAllModal === 'colors' ? allColorDist : allWinRateDist"
      :mode="viewAllModal || 'colors'"
      :title="viewAllModal === 'colors' ? 'Color Distribution' : 'Events Won by Color Combo'"
      @close="viewAllModal = null"
    />

    <!-- Color filter tabs -->
    <div class="mb-3">
      <div class="overflow-x-auto">
        <div class="flex w-fit gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-700/70">
          <button
            class="rounded-md px-3 py-1 text-xs font-medium transition-colors"
            :class="
              !colorFilter
                ? 'bg-white text-sumi shadow-xs dark:bg-nalika-surface dark:text-nalika-text'
                : 'text-gray-500 hover:text-sumi dark:text-nalika-text-muted dark:hover:text-nalika-text'
            "
            @click="colorFilter = null"
          >
            All
          </button>
          <button
            v-for="c in Object.keys(COLOR_HEX)"
            :key="c"
            class="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors"
            :class="
              colorFilter === c
                ? 'bg-white text-sumi shadow-xs dark:bg-nalika-surface dark:text-nalika-text'
                : 'text-gray-500 hover:text-sumi dark:text-nalika-text-muted dark:hover:text-nalika-text'
            "
            @click="colorFilter = c"
          >
            <span class="inline-block h-2 w-2 rounded-full" :style="{ background: COLOR_HEX[c] }" />
            {{ c }}
          </button>
        </div>
      </div>
    </div>

    <MetaCardSection
      title="Top Signature Cards"
      :cards="filteredSigCards"
      @toggle-enlarge="toggleEnlarge"
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
      show-rarity
      empty-text="Select a series to view card data"
      @toggle-enlarge="toggleEnlarge"
    >
      <template #tabs>
        <div class="overflow-x-auto">
          <div class="flex w-fit gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-700/70">
            <button
              class="rounded-md px-3 py-1 text-xs font-medium transition-colors"
              :class="
                cardTab === 'played'
                  ? 'bg-white text-sumi shadow-xs dark:bg-nalika-surface dark:text-nalika-text'
                  : 'text-gray-500 hover:text-sumi dark:text-nalika-text-muted dark:hover:text-nalika-text'
              "
              @click="cardTab = 'played'"
            >
              Most Played
            </button>
            <button
              class="rounded-md px-3 py-1 text-xs font-medium transition-colors"
              :class="
                cardTab === 'winner'
                  ? 'bg-white text-sumi shadow-xs dark:bg-nalika-surface dark:text-nalika-text'
                  : 'text-gray-500 hover:text-sumi dark:text-nalika-text-muted dark:hover:text-nalika-text'
              "
              @click="cardTab = 'winner'"
            >
              Most Featured
            </button>
          </div>
        </div>
      </template>
      <template #footer="{ card }">
        <div
          class="mt-2 flex items-center justify-center gap-2 text-xs @max-[150px]:flex-col @max-[150px]:gap-0"
        >
          <span class="font-mono text-gray-500 dark:text-nalika-text-muted" title="Decks included">
            {{ card.totalDecksIncluded }} decks
          </span>
          <span class="text-gray-300 @max-[150px]:hidden dark:text-gray-500">·</span>
          <span
            v-if="cardTab === 'played'"
            class="font-mono text-yellow-600 dark:text-yellow-600"
            title="Champion decks"
          >
            {{ card.totalWinnerDecks }} wins
          </span>
          <span v-else class="font-mono text-blue-500 dark:text-blue-400" title="Archetypes">
            {{ card.archetypeCount }} archs
          </span>
        </div>
      </template>
    </MetaCardSection>

    <MetaCardSection
      title="Top 10 by Type"
      :cards="filteredTopCardsByType"
      show-rarity
      @toggle-enlarge="toggleEnlarge"
    >
      <template #tabs>
        <div class="overflow-x-auto">
          <div class="flex w-fit gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-700/70">
            <button
              v-for="t in typeOrder"
              :key="t"
              class="rounded-md px-3 py-1 text-xs font-medium transition-colors"
              :class="
                typeTab === t
                  ? 'bg-white text-sumi shadow-xs dark:bg-nalika-surface dark:text-nalika-text'
                  : 'text-gray-500 hover:text-sumi dark:text-nalika-text-muted dark:hover:text-nalika-text'
              "
              @click="typeTab = t"
            >
              {{ t }}
            </button>
          </div>
        </div>
      </template>
      <template #footer="{ card }">
        <div
          class="mt-2 flex items-center justify-center gap-2 text-xs @max-[150px]:flex-col @max-[150px]:gap-0"
        >
          <span class="font-mono text-gray-500 dark:text-nalika-text-muted" title="Decks included">
            {{ card.totalDecksIncluded }} decks
          </span>
          <span class="text-gray-300 @max-[150px]:hidden dark:text-gray-500">·</span>
          <span class="font-mono text-yellow-600 dark:text-yellow-600" title="Champion decks">
            {{ card.totalWinnerDecks }} wins
          </span>
        </div>
      </template>
    </MetaCardSection>

    <!-- Enlarged card overlay -->
    <Teleport to="body">
      <div
        v-if="enlargedCard"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        @click.self="enlargedCard = null"
      >
        <div class="relative max-h-[85vh] overflow-hidden rounded-lg shadow-2xl">
          <img
            :src="`https://jw-assets.imgix.net/gcg-img/${enlargedCard}.webp`"
            alt="Enlarged card"
            class="h-auto max-h-[85vh] w-auto rounded-lg"
          />
          <button
            class="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
            @click="enlargedCard = null"
          >
            ×
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import tierData from '$data/tiers.json'
import { useStorage } from '@vueuse/core'

const router = useRouter()
const route = useRoute()

const seriesOptions = tierData.map(s => ({
  value: s.value,
  label: s.label,
}))

const validSeries = tierData.map(s => s.value)
const initial = validSeries.includes(route.query.series) ? route.query.series : tierData[0]?.value
const selectedKey = ref(initial ?? '')

watch(selectedKey, val => {
  router.replace({ query: { series: val } })
})

const currentSeries = computed(() => tierData.find(s => s.value === selectedKey.value))

const { hideFilter } = useScrollHide()

const allRows = computed(() => currentSeries.value?.rows ?? [])

const cardTab = useStorage('gcg-card-tab', 'played')
const colorFilter = useStorage('gcg-color-filter', null)
const enlargedCard = ref(null)
const viewAllModal = ref(null)

function toggleEnlarge(cardId) {
  enlargedCard.value = enlargedCard.value === cardId ? null : cardId
}

// ── Tier distribution ──
const tierOrder = ['T1', 'T1.5', 'T2', 'T2.5', 'T3', '--']
const totalTiered = computed(() => {
  const counts = {}
  let total = 0
  for (const row of allRows.value) {
    counts[row.tier] = (counts[row.tier] || 0) + 1
    total++
  }
  return { counts, total }
})

const tierDist = computed(() => {
  const { counts } = totalTiered.value
  const items = tierOrder.filter(t => counts[t]).map(t => ({ tier: t, count: counts[t] }))
  const maxCount = Math.max(...items.map(i => i.count), 1)
  return items.map(i => ({ ...i, percent: (i.count / maxCount) * 100 }))
})

// ── Color distribution ──
const colorDist = computed(() => {
  const map = {}
  for (const row of allRows.value) {
    const key = row.colors
    if (!map[key]) {
      map[key] = { colors: key, colorDots: row.colorDots, decks: 0 }
    }
    map[key].decks += row.decks
  }
  const items = Object.values(map).sort((a, b) => b.decks - a.decks)
  const maxDecks = items[0]?.decks || 1
  return items.slice(0, 6).map(item => ({
    ...item,
    percent: (item.decks / maxDecks) * 100,
    barGradient: `linear-gradient(to right, ${item.colorDots.map(d => d.hex).join(', ')})`,
  }))
})

// ── All color distribution (no slice) ──
const allColorDist = computed(() => {
  const map = {}
  for (const row of allRows.value) {
    const key = row.colors
    if (!map[key]) {
      map[key] = { colors: key, colorDots: row.colorDots, decks: 0 }
    }
    map[key].decks += row.decks
  }
  const items = Object.values(map).sort((a, b) => b.decks - a.decks)
  const maxDecks = items[0]?.decks || 1
  return items.map(item => ({
    ...item,
    percent: (item.decks / maxDecks) * 100,
    barGradient: `linear-gradient(to right, ${item.colorDots.map(d => d.hex).join(', ')})`,
  }))
})

// ── Top 10 by type ──
const typeOrder = ['UNIT', 'PILOT', 'COMMAND', 'BASE']
const typeTab = useStorage('gcg-type-tab', 'UNIT')

const topCardsByType = computed(() => {
  if (!aggregationResult.value) {
    return []
  }
  return aggregationResult.value.cards
    .filter(c => c.type === typeTab.value)
    .sort((a, b) => b.totalDecksIncluded - a.totalDecksIncluded)
    .slice(0, 10)
})

// ── Win rate by color combo ──
const winRateDist = computed(() => {
  const map = {}
  for (const row of allRows.value) {
    const key = row.colors
    if (!map[key]) {
      map[key] = { colors: key, colorDots: row.colorDots, decks: 0, wins: 0 }
    }
    map[key].decks += row.decks
    map[key].wins += row.wins
  }
  const items = Object.values(map)
    .map(item => ({
      ...item,
      winRate: (item.wins / (currentSeries.value?.events || 1)) * 100,
    }))
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 6)
  const maxWinRate = Math.max(...items.map(i => i.winRate), 1)
  return items.map(item => ({
    ...item,
    barPercent: (item.winRate / maxWinRate) * 100,
    barGradient: `linear-gradient(to right, ${item.colorDots.map(d => d.hex).join(', ')})`,
  }))
})

// ── All win rate by color combo (no slice) ──
const allWinRateDist = computed(() => {
  const map = {}
  for (const row of allRows.value) {
    const key = row.colors
    if (!map[key]) {
      map[key] = { colors: key, colorDots: row.colorDots, decks: 0, wins: 0 }
    }
    map[key].decks += row.decks
    map[key].wins += row.wins
  }
  const items = Object.values(map)
    .map(item => ({
      ...item,
      winRate: (item.wins / (currentSeries.value?.events || 1)) * 100,
    }))
    .sort((a, b) => b.winRate - a.winRate)
  const maxWinRate = Math.max(...items.map(i => i.winRate), 1)
  return items.map(item => ({
    ...item,
    barPercent: (item.winRate / maxWinRate) * 100,
    barGradient: `linear-gradient(to right, ${item.colorDots.map(d => d.hex).join(', ')})`,
  }))
})

// ── Card aggregation (async) ──
const aggregationResult = ref(null)
const loadingCards = ref(false)

const topCards = computed(() => {
  if (!aggregationResult.value) {
    return []
  }
  if (cardTab.value === 'played') {
    return aggregationResult.value.topPlayed
  }
  return [...aggregationResult.value.cards]
    .sort((a, b) => b.archetypeCount - a.archetypeCount)
    .slice(0, 10)
})

const topSigCards = computed(() => aggregationResult.value?.topSigCards ?? [])

const filteredSigCards = computed(() => {
  if (!colorFilter.value) {
    return topSigCards.value
  }
  return (aggregationResult.value?.sigCards ?? [])
    .filter(c => c.color === colorFilter.value)
    .slice(0, 10)
})

const filteredTopCards = computed(() => {
  if (!colorFilter.value) {
    return topCards.value
  }
  const cards = aggregationResult.value?.cards ?? []
  const sorted =
    cardTab.value === 'played'
      ? [...cards].sort((a, b) => b.totalDecksIncluded - a.totalDecksIncluded)
      : [...cards].sort((a, b) => b.archetypeCount - a.archetypeCount)
  return sorted.filter(c => c.color === colorFilter.value).slice(0, 10)
})

const filteredTopCardsByType = computed(() => {
  if (!colorFilter.value) {
    return topCardsByType.value
  }
  return (aggregationResult.value?.cards ?? [])
    .filter(c => c.type === typeTab.value && c.color === colorFilter.value)
    .sort((a, b) => b.totalDecksIncluded - a.totalDecksIncluded)
    .slice(0, 10)
})

async function loadCardData(seriesKey) {
  if (!seriesKey) {
    aggregationResult.value = null
    return
  }
  loadingCards.value = true
  try {
    aggregationResult.value = await aggregateCards(seriesKey)
  } catch {
    aggregationResult.value = null
  } finally {
    loadingCards.value = false
  }
}

watch(selectedKey, async val => {
  await loadCardData(val)
})

onMounted(() => loadCardData(selectedKey.value))
</script>
