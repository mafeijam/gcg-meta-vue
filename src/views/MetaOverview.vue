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

    <!-- State Overview -->
    <div
      class="mb-6 rounded border border-gray-500/10 bg-shironezumi/2 p-2 dark:border-nalika-border dark:bg-nalika-surface"
    >
      <div class="mb-3 flex items-center justify-between gap-1">
        <h2
          class="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-nalika-text-muted"
        >
          Card stats
        </h2>

        <div v-if="seriesTimeline" class="text-xs text-gray-500 dark:text-gray-400">
          {{ seriesTimeline }}
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>
          <strong class="text-gray-700 dark:text-nalika-text">{{ totalCardCount }}</strong>
          released
        </span>
        <span>
          <strong class="text-gray-700 dark:text-nalika-text">{{ usedCardCount }}</strong>
          used
        </span>
        <span>
          <strong class="text-gray-700 dark:text-nalika-text">
            {{ totalCardCount - usedCardCount }}
          </strong>
          unused
        </span>
      </div>
      <div v-if="colorCounts.length" class="mt-3 mb-5 flex flex-wrap gap-1.5">
        <span
          v-for="item in colorCounts"
          :key="item.color"
          class="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          <span class="mr-1 inline-block h-2 w-2 rounded-full" :style="{ background: item.hex }" />
          <span class="mr-1 text-xxs">{{ item.color }}:</span>
          <span class="font-mono font-bold text-gray-500 dark:text-gray-400">{{ item.count }}</span>
        </span>
      </div>
      <div v-if="archetypeProductGroups.length" class="mt-3 space-y-4">
        <div
          v-for="group in archetypeProductGroups"
          :key="group.prefix"
          class="flex flex-wrap gap-1.5"
        >
          <span
            v-for="item in group.items"
            :key="item.name"
            class="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <span class="mr-1 text-xxs">{{ item.name }}:</span>
            <span class="font-mono font-bold text-gray-500 dark:text-gray-400">{{ item.count }}</span>
          </span>
        </div>
      </div>
      <p v-else class="py-4 text-center text-sm text-gray-400 dark:text-gray-500">Product info unavailable</p>
    </div>

    <!-- Tier Distribution + Color Distribution + Win Rate -->
    <div class="mb-6 grid gap-4 md:grid-cols-3">
      <div
        class="rounded border border-gray-500/10 bg-shironezumi/3 p-2 dark:border-nalika-border dark:bg-nalika-surface"
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
        class="rounded border border-gray-500/10 bg-shironezumi/3 p-2 dark:border-nalika-border dark:bg-nalika-surface"
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
            <span
              class="w-6 shrink-0 text-center text-xs font-medium text-aisumicha dark:text-nalika-text"
            >
              {{ item.colorDots.map(d => d.name[0]).join('') }}
            </span>
            <div class="h-5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700/70">
              <div
                class="h-full rounded-full"
                :style="{ width: `${item.percent}%`, background: item.barGradient }"
              />
            </div>
            <span
              class="w-12 text-right font-mono text-xs font-bold text-gray-600 dark:text-nalika-text-muted"
            >
              {{ item.decks }}
            </span>
          </div>
        </div>
        <p v-else class="py-4 text-center text-sm text-gray-400 dark:text-gray-500">No data</p>
      </div>

      <div
        class="rounded border border-gray-500/10 bg-shironezumi/3 p-2 dark:border-nalika-border dark:bg-nalika-surface"
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
            <span
              class="w-6 shrink-0 text-center text-xs font-medium text-aisumicha dark:text-nalika-text"
            >
              {{ item.colorDots.map(d => d.name[0]).join('') }}
            </span>
            <div class="h-5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700/70">
              <div
                class="h-full rounded-full"
                :style="{ width: `${item.barPercent}%`, background: item.barGradient }"
              />
            </div>
            <span
              class="w-12 text-right font-mono text-xs font-bold text-gray-600 dark:text-nalika-text-muted"
            >
              {{ item.winRate.toFixed(1) }}%
            </span>
          </div>
        </div>
        <p v-else class="py-4 text-center text-sm text-gray-400 dark:text-gray-500">No data</p>
      </div>
    </div>

    <!-- Archetype Quadrants (full width) -->
    <div
      class="mb-6 rounded border border-gray-500/10 bg-shironezumi/3 p-2 dark:border-nalika-border dark:bg-nalika-surface"
    >
      <h2
        class="mb-3 text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-nalika-text-muted"
      >
        Archetype Quadrants
      </h2>
      <QuadrantChart v-if="quadrantData.length" :items="quadrantData" />
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

    <!-- Series Comparison -->
    <div
      class="mb-6 rounded border border-gray-500/10 bg-shironezumi/2 p-2 dark:border-nalika-border dark:bg-nalika-surface"
    >
      <div class="mb-3 flex items-center justify-between max-sm:flex-col max-sm:items-start">
        <h2
          class="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-nalika-text-muted"
        >
          vs Previous Series
        </h2>
        <div v-if="previousSeries" class="text-xs text-gray-500 dark:text-gray-400">
          {{ previousSeries.label }}
        </div>
      </div>
      <div v-if="seriesComparison" class="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div
          v-for="m in seriesComparison.metrics"
          :key="m.label"
          class="rounded border border-gray-500/10 bg-shironezumi/4 p-2 dark:border-nalika-border dark:bg-nalika-surface"
        >
          <div class="text-xs text-gray-500 dark:text-gray-400">{{ m.label }}</div>
          <div class="mt-1 flex items-center justify-between">
            <span class="text-lg font-bold text-gray-700 dark:text-nalika-text">
              {{ m.format(m.current) }}
            </span>
            <span
              class="text-xs font-medium"
              :class="
                m.format(m.current) === m.format(m.previous) || m.diff > 0
                  ? 'text-green-600 dark:text-green-500'
                  : m.diff < 0
                    ? 'text-red-600 dark:text-red-500'
                    : 'text-gray-500 dark:text-gray-400'
              "
            >
              <template v-if="m.format(m.current) === m.format(m.previous)">same</template>
              <template v-else>{{ m.diff > 0 ? '+' : '' }}{{ m.format(m.diff) }}</template>
            </span>
          </div>
          <div class="text-xs text-gray-400 dark:text-gray-500">
            previous: {{ m.format(m.previous) }}
          </div>
        </div>
        <div
          class="rounded border border-gray-500/10 bg-shironezumi/4 p-2 dark:border-nalika-border dark:bg-nalika-surface"
        >
          <div class="text-xs text-gray-500 dark:text-gray-400">Top color</div>
          <div class="mt-1 flex items-center justify-between">
            <span class="text-sm font-bold text-gray-700 dark:text-nalika-text">
              {{ seriesComparison.topColor.current || '—' }}
            </span>
            <span
              v-if="seriesComparison.topColor.current !== seriesComparison.topColor.previous"
              class="text-xs text-gray-500 dark:text-gray-400"
            >
              was {{ seriesComparison.topColor.previous || '—' }}
            </span>
            <span v-else class="text-xs text-green-600 dark:text-green-500">same</span>
          </div>
        </div>
      </div>
      <p v-else class="py-4 text-center text-sm text-gray-400 dark:text-gray-500">No previous series</p>
    </div>

    <!-- Card State vs Previous -->
    <div
      v-if="cardStateComparison"
      class="mb-6 rounded border border-gray-500/10 bg-shironezumi/2 p-2 dark:border-nalika-border dark:bg-nalika-surface"
    >
      <div class="mb-3 flex items-center justify-between max-sm:flex-col max-sm:items-start">
        <h2
          class="text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-nalika-text-muted"
        >
          Card State vs Previous
        </h2>
      </div>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div
          v-for="m in cardStateComparison.metrics"
          :key="m.label"
          class="rounded border border-gray-500/10 bg-shironezumi/4 p-2 dark:border-nalika-border dark:bg-nalika-surface"
        >
          <div class="text-xs text-gray-500 dark:text-gray-400">{{ m.label }}</div>
          <div class="mt-1 flex items-center justify-between">
            <span class="text-lg font-bold text-gray-700 dark:text-nalika-text">
              {{ m.format(m.current) }}
            </span>
            <span
              class="text-xs font-medium"
              :class="
                m.format(m.current) === m.format(m.previous) || m.diff > 0
                  ? 'text-green-600 dark:text-green-500'
                  : m.diff < 0
                    ? 'text-red-600 dark:text-red-500'
                    : 'text-gray-500 dark:text-gray-400'
              "
            >
              <template v-if="m.format(m.current) === m.format(m.previous)">same</template>
              <template v-else>{{ m.diff > 0 ? '+' : '' }}{{ m.format(m.diff) }}</template>
            </span>
          </div>
          <div class="text-xs text-gray-400 dark:text-gray-500">
            previous: {{ m.format(m.previous) }}
          </div>
        </div>
        <div
          class="rounded border border-gray-500/10 bg-shironezumi/4 p-2 dark:border-nalika-border dark:bg-nalika-surface"
        >
          <div class="text-xs text-gray-500 dark:text-gray-400">Top used color</div>
          <div class="mt-1 flex items-center justify-between">
            <span class="text-sm font-bold text-gray-700 dark:text-nalika-text">
              {{ cardStateComparison.topColor.current || '—' }}
            </span>
            <span
              v-if="cardStateComparison.topColor.current !== cardStateComparison.topColor.previous"
              class="text-xs text-gray-500 dark:text-gray-400"
            >
              was {{ cardStateComparison.topColor.previous || '—' }}
            </span>
            <span v-else class="text-xs text-green-600 dark:text-green-500">same</span>
          </div>
        </div>
      </div>
    </div>

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
      empty-text="Select a series to view card data"
      @toggle-enlarge="toggleEnlarge"
    >
      <template #tabs>
        <div class="ml-auto flex flex-col gap-2 sm:flex-row sm:items-center">
          <div class="flex justify-end overflow-x-auto">
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
                Most Archetypes
              </button>
            </div>
          </div>
          <div class="flex justify-end overflow-x-auto">
            <div class="flex w-fit gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-700/70">
              <button
                class="rounded-md px-3 py-1 text-xs font-medium transition-colors"
                :class="
                  typeTab === null
                    ? 'bg-white text-sumi shadow-xs dark:bg-nalika-surface dark:text-nalika-text'
                    : 'text-gray-500 hover:text-sumi dark:text-nalika-text-muted dark:hover:text-nalika-text'
                "
                @click="typeTab = null"
              >
                All
              </button>
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
        </div>
      </template>
      <template #footer="{ card }">
        <div class="mt-2 flex items-center justify-center gap-2 text-xs">
          <span class="font-mono text-gray-500 dark:text-nalika-text-muted" title="Decks included">
            {{ card.totalDecksIncluded }}
          </span>
          <span class="text-gray-300 dark:text-gray-500">·</span>
          <span
            v-if="cardTab === 'winner'"
            class="font-mono text-blue-500 dark:text-blue-400"
            title="Archetypes"
          >
            {{ card.archetypeCount }}
          </span>
          <span
            v-else
            class="font-mono text-yellow-600 dark:text-yellow-600"
            title="Champion decks"
          >
            {{ card.totalWinnerDecks }}
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
const previousSeries = computed(() => {
  const current = currentSeries.value
  if (!current?.eventMinDate) {
    return null
  }
  const candidates = tierData.filter(
    s => s.value !== current.value && s.eventMaxDate && s.eventMaxDate < current.eventMinDate,
  )
  candidates.sort((a, b) => b.eventMaxDate.localeCompare(a.eventMaxDate))
  return candidates[0] || null
})
const eventCutoffDate = computed(() => currentSeries.value?.eventMaxDate ?? null)
const seriesTimeline = computed(() => {
  const min = currentSeries.value?.eventMinDate
  const max = currentSeries.value?.eventMaxDate
  if (!min && !max) {
    return null
  }
  if (!min) {
    return `Until ${max}`
  }
  if (!max) {
    return `From ${min}`
  }
  return `${min} → ${max}`
})

const { hideFilter } = useScrollHide()

const allRows = computed(() => currentSeries.value?.rows ?? [])

const quadrantData = computed(() =>
  allRows.value.map(r => ({
    archetype: r.archetype,
    usePct: r.usePct,
    winPerDk: r.winPerDk,
    decks: r.decks,
    wins: r.wins,
    tier: r.tier,
  })),
)

const cardTab = useStorage('gcg-card-tab', 'played')
const colorFilter = useStorage('gcg-color-filter', null)
const enlargedCard = ref(null)
const viewAllModal = ref(null)
const cardMeta = ref([])

function toggleEnlarge(cardId) {
  enlargedCard.value = enlargedCard.value === cardId ? null : cardId
}

function isReleasedByCutoff(card, cutoffDate) {
  if (!cutoffDate) {
    return true
  }
  if (!card.releaseDate) {
    return false
  }
  return card.releaseDate <= cutoffDate
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

// ── Top 10 by type ──
const typeOrder = ['UNIT', 'PILOT', 'COMMAND', 'BASE']
const typeTab = useStorage('gcg-type-tab', null)

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
  for (const card of eligibleCards.value) {
    if (card.releaseDate && card.releaseDate <= max) {
      if (!latestRelease || card.releaseDate > latestRelease) {
        latestRelease = card.releaseDate
      }
    }
  }
  if (!latestRelease) {
    return []
  }
  return eligibleCards.value
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
  const counts = {}
  const infoMap = cardInfoById.value
  for (const card of aggregationResult.value.cards) {
    const acquisition = infoMap[card.cardId]?.acquisitionInfo?.trim()
    if (!acquisition) {
      continue
    }
    counts[acquisition] = (counts[acquisition] || 0) + 1
  }
  const entries = Object.entries(counts).map(([name, count]) => ({ name, count }))
  return entries.sort((a, b) => {
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
    name: item.name.replace(/^(.+?)\s+(\[[A-Z]{2}\d*\])$/i, '$2 $1'),
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

const eligibleCards = computed(() =>
  cardMeta.value.filter(
    c =>
      !c.id.includes('_p') &&
      typeOrder.includes(c.type) &&
      isReleasedByCutoff(c, eventCutoffDate.value),
  ),
)

const totalCardCount = computed(() => eligibleCards.value.length)

const usedCardCount = computed(() => {
  if (!aggregationResult.value) {
    return 0
  }
  const usedIds = new Set(aggregationResult.value.cards.map(c => c.cardId))
  return eligibleCards.value.filter(c => usedIds.has(c.id)).length
})

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
  loadingCards.value = true
  try {
    const result = await aggregateCards(seriesKey)
    aggregationResult.value = result
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
