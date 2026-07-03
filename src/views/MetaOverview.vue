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

    <!-- Tier Distribution + Color Distribution -->
    <div class="mb-6 grid gap-4 md:grid-cols-2">
      <div
        class="rounded border border-gray-500/10 bg-shironezumi/7 p-4 dark:border-nalika-border dark:bg-nalika-surface"
      >
        <h2
          class="mb-3 text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-nalika-text-muted"
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
        class="rounded border border-gray-500/10 bg-shironezumi/7 p-4 dark:border-nalika-border dark:bg-nalika-surface"
      >
        <h2
          class="mb-3 text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-nalika-text-muted"
        >
          Color Distribution
        </h2>
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
    </div>

    <!-- Top Signature Cards -->
    <div
      v-if="topSigCards.length"
      class="mb-6 rounded border border-gray-500/10 bg-shironezumi/7 p-4 dark:border-nalika-border dark:bg-nalika-surface"
    >
      <h2
        class="mb-3 text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-nalika-text-muted"
      >
        Top Signature Cards
      </h2>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <div
          v-for="card in topSigCards"
          :key="card.cardId"
          class="cursor-pointer rounded border border-gray-500/10 bg-shironezumi/7 p-2 transition-shadow hover:shadow-md dark:border-nalika-border dark:bg-nalika-surface"
          @click="enlargedCard = enlargedCard === card.cardId ? null : card.cardId"
        >
          <div class="flex items-center gap-1">
            <span
              class="inline-block h-2 w-2 shrink-0 rounded-full"
              :style="{ background: COLOR_HEX[card.color] || '#718096' }"
            />
            <span class="font-mono text-xs text-gray-600 dark:text-nalika-text-muted">
              {{ card.cardId }}
            </span>
          </div>
          <div class="group relative mt-1.5 aspect-[3/2] overflow-hidden rounded">
            <img
              :src="`https://jw-assets.imgix.net/gcg-img/${card.cardId}.webp?fit=crop&ar=3:2&w=300&crop=focalpoint&fp-x=0.5&fp-y=0.05`"
              :alt="card.name"
              class="h-full w-full scale-150 object-cover brightness-85 transition-all duration-200 group-hover:brightness-95"
              loading="lazy"
            />
          </div>
          <div
            class="mt-1.5 w-full truncate text-center text-xs font-semibold text-aisumicha dark:text-nalika-text"
          >
            {{ card.name }}
          </div>
          <div class="mt-2 text-center font-mono text-xs text-gray-500 dark:text-nalika-text-muted">
            {{ card.archetypeCount }} archetypes
          </div>
        </div>
      </div>
    </div>

    <!-- Top 10 Cards -->
    <div
      class="mb-6 rounded border border-gray-500/10 bg-shironezumi/7 p-4 dark:border-nalika-border dark:bg-nalika-surface"
    >
      <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2
          class="text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-nalika-text-muted"
        >
          Top 10 Cards
        </h2>
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
            Most Wins
          </button>
        </div>
      </div>

      <div v-if="loadingCards" class="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        Loading…
      </div>
      <div
        v-else-if="topCards.length"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <div
          v-for="card in topCards"
          :key="card.cardId"
          class="cursor-pointer rounded border border-gray-500/10 bg-shironezumi/7 p-2 transition-shadow hover:shadow-md dark:border-nalika-border dark:bg-nalika-surface"
          @click="enlargedCard = enlargedCard === card.cardId ? null : card.cardId"
        >
          <div class="flex items-center gap-1">
            <span
              class="inline-block h-2 w-2 shrink-0 rounded-full"
              :style="{ background: COLOR_HEX[card.color] || '#718096' }"
            />
            <span class="font-mono text-xs text-gray-600 dark:text-nalika-text-muted">
              {{ card.cardId }}
            </span>
            <span
              v-if="card.rarity"
              class="font-mono text-xs"
              :class="{
                'font-semibold text-yellow-600 dark:text-yellow-400/80':
                  card.rarity.startsWith('LR'),
                'text-gray-400 dark:text-gray-500': !card.rarity.startsWith('LR'),
              }"
            >
              {{ card.rarity.replace(/\+{1,2}$/, '') }}
            </span>
          </div>
          <div class="group relative mt-1.5 aspect-[3/2] overflow-hidden rounded">
            <img
              :src="`https://jw-assets.imgix.net/gcg-img/${card.cardId}.webp?fit=crop&ar=3:2&w=300&crop=focalpoint&fp-x=0.5&fp-y=0.05`"
              :alt="card.name"
              class="h-full w-full scale-150 object-cover brightness-85 transition-all duration-200 group-hover:brightness-95"
              loading="lazy"
            />
          </div>
          <div
            class="mt-1.5 w-full truncate text-center text-xs font-semibold text-aisumicha dark:text-nalika-text"
          >
            {{ card.name }}
          </div>
          <div class="mt-2 flex items-center justify-center gap-2 text-xs">
            <span
              class="font-mono text-gray-500 dark:text-nalika-text-muted"
              title="Decks included"
            >
              {{ card.totalDecksIncluded }} decks
            </span>
            <span class="text-gray-300 dark:text-gray-500">·</span>
            <span class="font-mono text-yellow-600 dark:text-yellow-600" title="Champion decks">
              {{ card.totalWinnerDecks }} wins
            </span>
          </div>
        </div>
      </div>
      <p v-else class="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
        Select a series to view card data
      </p>
    </div>

    <!-- Top 10 by Type -->
    <div
      v-if="topCardsByType.length"
      class="mb-6 rounded border border-gray-500/10 bg-shironezumi/7 p-4 dark:border-nalika-border dark:bg-nalika-surface"
    >
      <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2
          class="text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-nalika-text-muted"
        >
          Top 10 by Type
        </h2>
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

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <div
          v-for="card in topCardsByType"
          :key="card.cardId"
          class="cursor-pointer rounded border border-gray-500/10 bg-shironezumi/7 p-2 transition-shadow hover:shadow-md dark:border-nalika-border dark:bg-nalika-surface"
          @click="enlargedCard = enlargedCard === card.cardId ? null : card.cardId"
        >
          <div class="flex items-center gap-1">
            <span
              class="inline-block h-2 w-2 shrink-0 rounded-full"
              :style="{ background: COLOR_HEX[card.color] || '#718096' }"
            />
            <span class="font-mono text-xs text-gray-600 dark:text-nalika-text-muted">
              {{ card.cardId }}
            </span>
            <span
              v-if="card.rarity"
              class="font-mono text-xs"
              :class="{
                'font-semibold text-yellow-600 dark:text-yellow-400/80':
                  card.rarity.startsWith('LR'),
                'text-gray-400 dark:text-gray-500': !card.rarity.startsWith('LR'),
              }"
            >
              {{ card.rarity.replace(/\+{1,2}$/, '') }}
            </span>
          </div>
          <div class="group relative mt-1.5 aspect-[3/2] overflow-hidden rounded">
            <img
              :src="`https://jw-assets.imgix.net/gcg-img/${card.cardId}.webp?fit=crop&ar=3:2&w=300&crop=focalpoint&fp-x=0.5&fp-y=0.05`"
              :alt="card.name"
              class="h-full w-full scale-150 object-cover brightness-85 transition-all duration-200 group-hover:brightness-95"
              loading="lazy"
            />
          </div>
          <div
            class="mt-1.5 w-full truncate text-center text-xs font-semibold text-aisumicha dark:text-nalika-text"
          >
            {{ card.name }}
          </div>
          <div class="mt-2 flex items-center justify-center gap-2 text-xs">
            <span
              class="font-mono text-gray-500 dark:text-nalika-text-muted"
              title="Decks included"
            >
              {{ card.totalDecksIncluded }} decks
            </span>
            <span class="text-gray-300 dark:text-gray-500">·</span>
            <span class="font-mono text-yellow-600 dark:text-yellow-600" title="Champion decks">
              {{ card.totalWinnerDecks }} wins
            </span>
          </div>
        </div>
      </div>
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

    <!-- Top Archetypes -->
    <div
      class="rounded border border-gray-500/10 bg-shironezumi/7 p-4 dark:border-nalika-border dark:bg-nalika-surface"
    >
      <h2
        class="mb-3 text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-nalika-text-muted"
      >
        Top Archetypes
      </h2>
      <div v-if="topArchetypes.length" class="space-y-2">
        <div
          v-for="row in topArchetypes"
          :key="row.archetype"
          class="flex flex-wrap items-center gap-2"
        >
          <span
            class="w-10 rounded px-1.5 py-0.5 text-center text-xs font-bold"
            :class="tierPillClass(row.tier)"
          >
            {{ row.tier }}
          </span>
          <div class="flex shrink-0 items-center gap-0.5">
            <div
              v-for="dot in row.colorDots"
              :key="dot.name"
              class="inline-block h-2 w-2 rounded-full"
              :style="{ background: dot.hex }"
            />
          </div>
          <span
            class="min-w-0 flex-1 truncate text-xs font-medium text-aisumicha dark:text-nalika-text"
          >
            {{ row.archetype }}
          </span>
          <div class="flex w-full items-center justify-end gap-2 sm:w-auto">
            <span class="font-mono text-xs text-gray-500 dark:text-nalika-text-muted">
              {{ row.decks }} decks
            </span>
            <span class="font-mono text-xs text-yellow-600 dark:text-yellow-600">
              {{ row.wins }} wins
            </span>
          </div>
        </div>
      </div>
      <p v-else class="text-xs text-gray-400 dark:text-gray-500">No data</p>
    </div>
  </div>
</template>

<script setup>
import tierData from '$data/tiers.json'
import { aggregateCards } from '@/utils/metaAgg'

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

const cardTab = ref('played')
const enlargedCard = ref(null)

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

// ── Top 10 by type ──
const typeOrder = ['UNIT', 'PILOT', 'COMMAND', 'BASE']
const typeTab = ref('UNIT')

const topCardsByType = computed(() => {
  if (!aggregationResult.value) {
    return []
  }
  return aggregationResult.value.cards
    .filter(c => c.type === typeTab.value)
    .sort((a, b) => b.totalDecksIncluded - a.totalDecksIncluded)
    .slice(0, 10)
})

// ── Top archetypes ──
const topArchetypes = computed(() =>
  [...allRows.value].sort((a, b) => b.decks - a.decks).slice(0, 10),
)

// ── Card aggregation (async) ──
const aggregationResult = ref(null)
const loadingCards = ref(false)

const topCards = computed(() => {
  if (!aggregationResult.value) {
    return []
  }
  return cardTab.value === 'played'
    ? aggregationResult.value.topPlayed
    : aggregationResult.value.topWinner
})

const topSigCards = computed(() => aggregationResult.value?.topSigCards ?? [])

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
