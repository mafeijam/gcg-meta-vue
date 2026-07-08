<template>
  <div class="mx-auto max-w-340 p-3 max-sm:pb-6 md:p-8">
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

    <CardStatsSection
      :total-card-count="totalCardCount"
      :used-card-count="usedCardCount"
      :series-timeline="seriesTimeline"
      :color-counts="colorCounts"
      :archetype-product-groups="archetypeProductGroups"
    />

    <DistributionsGrid
      :tier-dist="tierDist"
      :color-dist="colorDist"
      :all-color-dist="allColorDist"
      :win-rate-dist="winRateDist"
      :all-win-rate-dist="allWinRateDist"
      @view-all="viewAllModal = $event"
    />

    <!-- Archetype Quadrants (full width) -->
    <div
      class="mb-6 rounded border border-gray-500/10 bg-shironezumi/3 p-2 dark:border-nalika-border dark:bg-nalika-surface"
    >
      <h2
        class="mb-3 text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-nalika-text-muted"
      >
        Archetype Quadrants
      </h2>
      <ArchetypeQuadrantChart v-if="quadrantData.length" :items="quadrantData" />
      <p v-else class="py-4 text-center text-sm text-gray-400 dark:text-gray-500">No data</p>
    </div>

    <!-- View All modal -->
    <ViewAllModal
      :visible="!!viewAllModal"
      :items="viewAllModal === 'colors' ? allColorDist : allWinRateDist"
      :mode="viewAllModal || 'colors'"
      :title="viewAllModal === 'colors' ? 'Color Distribution' : 'Events Won by Color Combo'"
      @close="viewAllModal = null"
    />

    <SeriesComparisonCards
      :series-comparison="seriesComparison"
      :previous-series="previousSeries"
    />

    <CardStateCards :card-state-comparison="cardStateComparison" />

    <!-- Level & Cost Distribution -->
    <div class="mb-6 grid gap-4 md:grid-cols-2">
      <DistributionBars title="Level Distribution" :items="levelDist" color="#005caf" />
      <DistributionBars title="Cost Distribution" :items="costDist" color="#0b346e" />
    </div>

    <!-- Color filter tabs -->
    <div class="mb-3">
      <div class="overflow-x-auto">
        <MetaTabGroup v-model="colorFilter" :options="colorTabOptions" class="xl:w-fit" />
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
      empty-text="Select a series to view card data"
      @toggle-enlarge="toggleEnlarge"
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

    <MetaCardSection
      title="Newcomers"
      :cards="recentlyUsedCards"
      empty-text="No new cards used"
      @toggle-enlarge="toggleEnlarge"
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

    <!-- Card Quadrants -->
    <div
      class="mb-6 rounded border border-gray-500/10 bg-shironezumi/3 p-2 dark:border-nalika-border dark:bg-nalika-surface"
    >
      <h2
        class="mb-3 text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-nalika-text-muted"
      >
        Card Quadrants
      </h2>
      <div class="mb-3 overflow-x-auto">
        <MetaTabGroup v-model="cardTypeChart" :options="cardTypeOptions" />
      </div>
      <CardQuadrantChart
        :card-items="filteredCardItems"
        :card-type-chart="cardTypeChart"
        :series-key="selectedKey"
      />
    </div>

    <!-- Enlarged card overlay -->
    <Teleport to="body">
      <div
        v-if="enlargedCard"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        @click.self="enlargedCard = null"
      >
        <div class="relative max-h-[85vh] overflow-hidden rounded-lg shadow-2xl">
          <img
            :src="`https://jw-assets.imgix.net/gcg-img/${enlargedCard}.webp?auto=format,compress`"
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
import { useStorage } from '@vueuse/core'
import MetaTabGroup from '@/components/MetaTabGroup.vue'
import { COLOR_HEX } from '@/utils/colors.js'

const ArchetypeQuadrantChart = defineAsyncComponent(
  () => import('@/components/ArchetypeQuadrantChart.vue'),
)
const CardQuadrantChart = defineAsyncComponent(() => import('@/components/CardQuadrantChart.vue'))

const {
  seriesOptions,
  selectedKey,
  currentSeries,
  totalSeriesDecks,
  totalSeriesWinnerDecks,
  percentOf1,
  previousSeries,
  eventCutoffDate,
  eventMinDate,
  seriesTimeline,
  hideFilter,
  allRows,
  totalArchetypes,
  quadrantData,
} = useSeriesState()

const { loadTierData } = useTierData()

// ── Card aggregation (async) ──
const aggregationResult = ref(null)
const loadingCards = ref(false)
const cardMeta = ref([])

const cardItems = computed(() =>
  (aggregationResult.value?.cards ?? []).filter(c => c.totalDecksIncluded >= 20),
)

const CARD_TYPE_OPTIONS = ['UNIT', 'PILOT', 'COMMAND', 'BASE']

const cardTypeChart = useStorage('gcg-card-type-chart', null)

const filteredCardItems = computed(() => {
  if (!cardTypeChart.value) {
    return cardItems.value
  }
  const typeKey = cardTypeChart.value.toUpperCase()
  return cardItems.value.filter(card => (card.type ?? '').toUpperCase() === typeKey)
})

// ── Card tab state ──
const cardTab = useStorage('gcg-card-tab', 'played')
if (cardTab.value === 'winner') {
  cardTab.value = 'archetype'
}

const typeOrder = ['UNIT', 'PILOT', 'COMMAND', 'BASE']
const typeTab = useStorage('gcg-type-tab', null)
const colorFilter = useStorage('gcg-color-filter', null)
const enlargedCard = ref(null)
const viewAllModal = ref(null)

const colorTabOptions = [
  { value: null, label: 'All' },
  ...Object.entries(COLOR_HEX).map(([label, color]) => ({ value: label, label, dotColor: color })),
]

const cardMetricOptions = [
  { value: 'played', label: 'Most Played' },
  { value: 'archetype', label: 'Most Archetypes' },
]

const cardTypeOptions = [
  { value: null, label: 'All' },
  ...CARD_TYPE_OPTIONS.map(t => ({ value: t, label: t })),
]

function toggleEnlarge(cardId) {
  enlargedCard.value = enlargedCard.value === cardId ? null : cardId
}

// ── Date helpers ──
function addDays(dateStr, days) {
  if (!dateStr) {
    return dateStr
  }
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function isReleasedByCutoff(card, cutoffDate) {
  if (!cutoffDate) {
    return true
  }
  if (!card.releaseDate) {
    return false
  }
  return addDays(card.releaseDate, 7) <= cutoffDate
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

  // Add "Other" for unassigned decks (no signature LR card, or filtered out)
  const otherDecks = totalSeriesDecks.value - items.reduce((s, i) => s + i.decks, 0)
  if (otherDecks > 0) {
    items.push({
      colors: 'Other',
      abbr: 'OTH',
      colorDots: [
        { name: 'Other', hex: '#6b7280' },
        { name: 'Other', hex: '#6b7280' },
      ],
      decks: otherDecks,
      isOther: true,
    })
  }

  const maxDecks = items[0]?.decks || 1
  const totalDecks = items.reduce((sum, item) => sum + item.decks, 0)
  const hasPrevious = !!previousSeries.value
  return items.map(item => {
    const prevDecks = previousColorMap.value.map[item.colors] ?? 0
    const prevRate =
      previousColorMap.value.total > 0 ? (prevDecks / previousColorMap.value.total) * 100 : 0
    const rate = totalDecks > 0 ? (item.decks / totalDecks) * 100 : 0
    return {
      ...item,
      percent: (item.decks / maxDecks) * 100,
      rate,
      barGradient: `linear-gradient(to right, ${item.colorDots.map(d => d.hex).join(', ')})`,
      rateDiff: hasPrevious ? rate - prevRate : undefined,
    }
  })
})

const colorDist = computed(() => allColorDist.value.filter(i => !i.isOther).slice(0, 6))

// ── Series comparison ──
const previousSeriesRows = computed(() => previousSeries.value?.rows ?? [])
const previousTopColor = computed(() => {
  const map = {}
  for (const row of previousSeriesRows.value) {
    map[row.colors] = (map[row.colors] || 0) + row.decks
  }
  const items = Object.entries(map).sort((a, b) => b[1] - a[1])
  return items[0]?.[0] || null
})

// Color rates in the previous series, used for diff arrows in color distribution
const previousColorMap = computed(() => {
  const rows = previousSeriesRows.value
  const total = previousSeries.value?.totalDecks ?? 0
  const assigned = rows.reduce((s, r) => s + r.decks, 0)
  const map = {}
  for (const row of rows) {
    map[row.colors] = (map[row.colors] ?? 0) + row.decks
  }
  const unassigned = total - assigned
  if (unassigned > 0) {
    map['Other'] = (map['Other'] ?? 0) + unassigned
  }
  return { map, total }
})

// Win rates in the previous series, used for diff arrows in events won distribution
const previousWinColorMap = computed(() => {
  const rows = previousSeriesRows.value
  const events = previousSeries.value?.events ?? 0
  const assigned = rows.reduce((s, r) => s + r.wins, 0)
  const map = {}
  for (const row of rows) {
    map[row.colors] = (map[row.colors] ?? 0) + row.wins
  }
  const unassigned = (previousSeries.value?.winDecks ?? 0) - assigned
  if (unassigned > 0) {
    map['Other'] = (map['Other'] ?? 0) + unassigned
  }
  return { map, events }
})

// ── Level & Cost distribution ──
const levelDist = computed(() => {
  const counts = {}
  const qtySums = {}
  const cards = aggregationResult.value?.cards ?? []
  for (const card of cards) {
    const lv = parseInt(card.level)
    if (lv >= 1 && lv <= 9) {
      counts[lv] = (counts[lv] || 0) + 1
      qtySums[lv] = (qtySums[lv] || 0) + (card.avgQty || 0)
    }
  }
  return Array.from({ length: 9 }, (_, i) => ({
    label: i + 1,
    count: counts[i + 1] || 0,
    sumAvgQty: Math.round(qtySums[i + 1] || 0),
  }))
})

const costDist = computed(() => {
  const counts = {}
  const qtySums = {}
  const cards = aggregationResult.value?.cards ?? []
  for (const card of cards) {
    const c = parseInt(card.cost)
    if (c >= 1 && c <= 9) {
      counts[c] = (counts[c] || 0) + 1
      qtySums[c] = (qtySums[c] || 0) + (card.avgQty || 0)
    }
  }
  return Array.from({ length: 9 }, (_, i) => ({
    label: i + 1,
    count: counts[i + 1] || 0,
    sumAvgQty: Math.round(qtySums[i + 1] || 0),
  }))
})

const seriesComparison = computed(() => {
  const current = currentSeries.value
  const prev = previousSeries.value
  if (!current || !prev) {
    return null
  }
  const topColor = allColorDist.value[0]?.colors || null
  const makeMetric = (label, currentVal, previousVal, format = v => v) => ({
    label,
    current: currentVal,
    previous: previousVal,
    diff: currentVal - previousVal,
    format,
  })
  const currentT1Share =
    (current.rows.filter(r => r.tier === 'T1' || r.tier === 'T1.5').length / current.rows.length) *
    100
  const prevT1Share =
    (prev.rows.filter(r => r.tier === 'T1' || r.tier === 'T1.5').length / prev.rows.length) * 100
  return {
    metrics: [
      makeMetric('Events', current.events, prev.events),
      makeMetric('Total decks', current.totalDecks, prev.totalDecks),
      makeMetric('Win decks', current.winDecks, prev.winDecks),
      makeMetric('Archetypes', current.rows.length, prev.rows.length),
      makeMetric('T1 + T1.5%', currentT1Share, prevT1Share, v => `${v.toFixed(1)}%`),
    ],
    topColor: { current: topColor, previous: previousTopColor.value },
  }
})

// ── Card state comparison ──
const cardStateComparison = computed(() => {
  const current = currentSeries.value
  const prev = previousSeries.value
  if (!current?.cardState || !prev?.cardState) {
    return null
  }
  const currentState = current.cardState
  const prevState = prev.cardState
  const makeMetric = (label, currentVal, previousVal, format = v => v) => ({
    label,
    current: currentVal,
    previous: previousVal,
    diff: currentVal - previousVal,
    format,
  })
  const currentUsedPct =
    currentState.releasedCards > 0 ? (currentState.usedCards / currentState.releasedCards) * 100 : 0
  const prevUsedPct =
    prevState.releasedCards > 0 ? (prevState.usedCards / prevState.releasedCards) * 100 : 0
  const currentTopColor =
    Object.entries(currentState.usedByColor).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  const prevTopColor =
    Object.entries(prevState.usedByColor).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  return {
    metrics: [
      makeMetric('Released', currentState.releasedCards, prevState.releasedCards),
      makeMetric('Used', currentState.usedCards, prevState.usedCards),
      makeMetric('Unused', currentState.unusedCards, prevState.unusedCards),
      makeMetric('Used %', currentUsedPct, prevUsedPct, v => `${v.toFixed(1)}%`),
    ],
    topColor: { current: currentTopColor, previous: prevTopColor },
  }
})

// ── Win rate by color combo ──
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

  // Add "Other" for unassigned winners
  const sumWins = items.reduce((s, i) => s + i.wins, 0)
  const otherWins = totalSeriesWinnerDecks.value - sumWins
  if (otherWins > 0) {
    items.push({
      colors: 'Other',
      abbr: 'OTH',
      colorDots: [
        { name: 'Other', hex: '#6b7280' },
        { name: 'Other', hex: '#6b7280' },
      ],
      decks: 0,
      wins: otherWins,
      winRate: (otherWins / (currentSeries.value?.events || 1)) * 100,
      isOther: true,
    })
  }

  const maxWinRate = Math.max(...items.map(i => i.winRate), 1)
  const hasPrevious = !!previousSeries.value
  return items.map(item => {
    const prevWins = previousWinColorMap.value.map[item.colors] ?? 0
    const prevWinRate =
      previousWinColorMap.value.events > 0 ? (prevWins / previousWinColorMap.value.events) * 100 : 0
    return {
      ...item,
      barPercent: (item.winRate / maxWinRate) * 100,
      barGradient: `linear-gradient(to right, ${item.colorDots.map(d => d.hex).join(', ')})`,
      winRateDiff: hasPrevious ? item.winRate - prevWinRate : undefined,
    }
  })
})

const winRateDist = computed(() => allWinRateDist.value.slice(0, 6))

// ── Card aggregation computed ──
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
  if (!aggregationResult.value) {
    return []
  }
  const hasFilter = colorFilter.value || typeTab.value
  if (!hasFilter) {
    return topCards.value
  }
  const cards = aggregationResult.value.cards ?? []
  const sorted =
    cardTab.value === 'played'
      ? [...cards].sort((a, b) => b.totalDecksIncluded - a.totalDecksIncluded)
      : [...cards].sort((a, b) => b.archetypeCount - a.archetypeCount)
  let filtered = sorted
  if (colorFilter.value) {
    filtered = filtered.filter(c => c.color === colorFilter.value)
  }
  if (typeTab.value) {
    filtered = filtered.filter(c => c.type === typeTab.value)
  }
  return filtered.slice(0, 10)
})

const cardInfoById = computed(() => {
  const map = {}
  for (const card of cardMeta.value) {
    if (card.id) {
      map[card.id] = card
    }
  }
  return map
})

const colorCounts = computed(() => {
  if (!aggregationResult.value?.cards?.length) {
    return []
  }
  const counts = {}
  for (const card of aggregationResult.value.cards) {
    counts[card.color] = (counts[card.color] || 0) + 1
  }
  return Object.entries(counts)
    .map(([color, count]) => ({
      color,
      count,
      hex: COLOR_HEX[color] || '#718096',
    }))
    .sort((a, b) => b.count - a.count)
})

const extractProductPrefix = name => {
  const match = name?.match(/\[([A-Z]{2})\d*\]/i)
  return match ? match[1].toUpperCase() : null
}

const archetypeProducts = computed(() => {
  if (!aggregationResult.value?.cards?.length) {
    return []
  }
  const map = {}
  const infoMap = cardInfoById.value
  const min = eventMinDate.value
  const max = eventCutoffDate.value
  for (const card of aggregationResult.value.cards) {
    const acquisition = infoMap[card.cardId]?.acquisitionInfo?.trim()
    if (!acquisition) {
      continue
    }
    if (!map[acquisition]) {
      map[acquisition] = { count: 0, isNew: false }
    }
    map[acquisition].count++
    if (!map[acquisition].isNew && min && max) {
      const releaseDate = infoMap[card.cardId]?.releaseDate
      if (releaseDate && addDays(releaseDate, 7) <= max && releaseDate >= addDays(min, -20)) {
        map[acquisition].isNew = true
      }
    }
  }
  const entries = Object.entries(map).map(([name, { count, isNew }]) => ({ name, count, isNew }))
  return entries
    .sort((a, b) => {
      const prefixA = extractProductPrefix(a.name)
      const prefixB = extractProductPrefix(b.name)
      if (prefixA && prefixB) {
        const prefixCompare = prefixA.localeCompare(prefixB)
        if (prefixCompare !== 0) {
          return prefixCompare
        }
        return b.count - a.count
      }
      if (prefixA) {
        return -1
      }
      if (prefixB) {
        return 1
      }
      return a.name.localeCompare(b.name)
    })
    .map(item => ({
      ...item,
      name: item.name.replace(/^(.+?)\s*(\[[A-Z]{2}\d*\])$/i, '$2 $1'),
    }))
})

const archetypeProductGroups = computed(() => {
  const groups = []
  let currentGroup = null
  for (const item of archetypeProducts.value) {
    const prefix = extractProductPrefix(item.name) || 'Other'
    if (!currentGroup || currentGroup.prefix !== prefix) {
      currentGroup = { prefix, items: [] }
      groups.push(currentGroup)
    }
    currentGroup.items.push(item)
  }
  return groups
})

// ── Eligible cards ──
const eligibleCards = computed(() =>
  cardMeta.value.filter(
    c =>
      !c.id.includes('_p') &&
      typeOrder.includes(c.type) &&
      isReleasedByCutoff(c, eventCutoffDate.value),
  ),
)

const totalCardCount = computed(() => eligibleCards.value.length)

const newcomerEligibleCards = computed(() => {
  const cutoff = eventCutoffDate.value
  const min = eventMinDate.value
  if (!cutoff || !min) {
    return []
  }
  return cardMeta.value.filter(
    c =>
      !c.id.includes('_p') &&
      typeOrder.includes(c.type) &&
      c.releaseDate &&
      addDays(c.releaseDate, 7) <= cutoff &&
      c.releaseDate >= addDays(min, -20),
  )
})

const usedCardCount = computed(() => {
  if (!aggregationResult.value) {
    return 0
  }
  const usedIds = new Set(aggregationResult.value.cards.map(c => c.cardId))
  return eligibleCards.value.filter(c => usedIds.has(c.id)).length
})

const recentlyUsedCards = computed(() => {
  if (!currentSeries.value || !aggregationResult.value) {
    return []
  }
  const max = currentSeries.value?.eventMaxDate
  if (!max) {
    return []
  }
  const usedMap = {}
  for (const c of aggregationResult.value.cards) {
    usedMap[c.cardId] = c
  }
  let latestRelease = null
  for (const card of newcomerEligibleCards.value) {
    if (card.releaseDate && card.releaseDate <= max) {
      if (!latestRelease || card.releaseDate > latestRelease) {
        latestRelease = card.releaseDate
      }
    }
  }
  if (!latestRelease) {
    return []
  }
  return newcomerEligibleCards.value
    .filter(c => {
      if (c.releaseDate !== latestRelease) {
        return false
      }
      if (!colorFilter.value) {
        return true
      }
      return c.color === colorFilter.value
    })
    .map(c => {
      const used = usedMap[c.id]
      return {
        cardId: c.id,
        name: c.name,
        color: c.color,
        type: c.type,
        rarity: c.rarity,
        totalDecksIncluded: used?.totalDecksIncluded || 0,
        totalWinnerDecks: used?.totalWinnerDecks || 0,
        avgQty: used?.avgQty || 0,
      }
    })
    .filter(c => c.totalDecksIncluded > 0)
    .sort((a, b) => {
      if (b.totalDecksIncluded !== a.totalDecksIncluded) {
        return b.totalDecksIncluded - a.totalDecksIncluded
      }
      return a.cardId.localeCompare(b.cardId)
    })
    .slice(0, 20)
})

// ── Data loading ──
async function loadCardMeta() {
  if (cardMeta.value.length) {
    return
  }
  try {
    const mod = await import('$data/card-meta.json')
    cardMeta.value = mod.default ?? []
  } catch {
    cardMeta.value = []
  }
}

async function loadCardData(seriesKey) {
  if (!seriesKey) {
    aggregationResult.value = null
    return
  }
  await loadCardMeta()
  const loadingTimeout = setTimeout(() => {
    loadingCards.value = true
    aggregationResult.value = null
  }, 200)
  try {
    const result = await aggregateCards(seriesKey)
    clearTimeout(loadingTimeout)
    aggregationResult.value = result
  } catch {
    clearTimeout(loadingTimeout)
    aggregationResult.value = null
  } finally {
    loadingCards.value = false
  }
}

watch(selectedKey, async val => {
  await loadCardData(val)
})

onMounted(async () => {
  await loadTierData()
  await loadCardData(selectedKey.value)
})
</script>
