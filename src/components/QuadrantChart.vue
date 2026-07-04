<template>
  <div class="w-full">
    <div
      class="mb-2 flex max-w-full flex-nowrap gap-1 overflow-x-auto rounded-lg bg-gray-100 p-0.5 xl:w-fit dark:bg-gray-700/70"
    >
      <button
        v-for="mode in MODES"
        :key="mode.key"
        class="rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors"
        :class="
          chartMode === mode.key
            ? 'bg-white text-sumi shadow-xs dark:bg-nalika-surface dark:text-nalika-text'
            : 'text-gray-500 hover:text-sumi dark:text-nalika-text-muted dark:hover:text-nalika-text'
        "
        @click="chartMode = mode.key"
      >
        {{ mode.label }}
      </button>
    </div>
    <p v-if="!hasDataForMode" class="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
      Loading card data…
    </p>
    <Suspense v-else>
      <VueApexCharts
        :key="chartMode"
        type="bubble"
        :height="chartHeight"
        width="100%"
        :options="chartOptions"
        :series="chartSeries"
      />
      <template #fallback>
        <div class="py-4 text-center text-xs text-gray-400 dark:text-gray-500">Loading chart…</div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStorage, useWindowSize } from '@vueuse/core'
import { isDark } from '@/composables/useDarkMode'

const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))

const props = defineProps({
  items: { type: Array, default: () => [] },
  cardItems: { type: Array, default: () => [] },
})

const TIER_ORDER = ['T1', 'T1.5', 'T2', 'T2.5', 'T3', '--']
const TIER_COLORS = ['#fca5a5', '#fdba74', '#fbbf24', '#86efac', '#93c5fd', '#d1d5db']
const CARD_COLOR_ORDER = ['Blue', 'Green', 'Purple', 'Red', 'White']
const CARD_COLOR_MAP = {
  Blue: '#2b6cb0',
  Green: '#38a169',
  Purple: '#805ad5',
  Red: '#e53e3e',
  White: '#cbd5e1',
}

const MODES = [
  {
    key: 'usage-winEv',
    label: 'Usage - Win.Ev',
    group: 'archetype',
    xKey: 'usePct',
    yKey: 'winPerEv',
    xLabel: 'Usage Rate (%)',
    yLabel: 'Win Rate / Event (%)',
    xIsPercent: true,
    yIsPercent: true,
    minWins: 3,
  },
  {
    key: 'usage-winDk',
    label: 'Usage - Win.Dk',
    group: 'archetype',
    xKey: 'usePct',
    yKey: 'winPerDk',
    xLabel: 'Usage Rate (%)',
    yLabel: 'Win Rate / Deck (%)',
    xIsPercent: true,
    yIsPercent: true,
  },
  {
    key: 'usage-t4',
    label: 'Usage - Top4',
    group: 'archetype',
    xKey: 'usePct',
    yKey: 't4PerDk',
    xLabel: 'Usage Rate (%)',
    yLabel: 'Top 4 / Deck (%)',
    xIsPercent: true,
    yIsPercent: true,
  },
  {
    key: 'usage-score',
    label: 'Usage - Score',
    group: 'archetype',
    xKey: 'usePct',
    yKey: 'score',
    xLabel: 'Usage Rate (%)',
    yLabel: 'Tier Score',
    xIsPercent: true,
    yIsPercent: false,
  },
  {
    key: 'winDk-winEv',
    label: 'Win.Dk - Win.Ev',
    group: 'archetype',
    xKey: 'winPerDk',
    yKey: 'winPerEv',
    xLabel: 'Win Rate / Deck (%)',
    yLabel: 'Win Rate / Event (%)',
    xIsPercent: true,
    yIsPercent: true,
    minWins: 3,
  },

  {
    key: 'card-impact',
    label: 'Card Impact',
    group: 'card',
    xKey: 'totalDecksIncluded',
    yKey: '_winnerRate',
    xLabel: 'Decks Included',
    yLabel: 'Winner Rate (%)',
    xIsPercent: false,
    yIsPercent: true,
  },
  {
    key: 'card-versatility',
    label: 'Card Versatility',
    group: 'card',
    xKey: 'totalDecksIncluded',
    yKey: 'archetypeCount',
    xLabel: 'Decks Included',
    yLabel: 'Archetypes',
    xIsPercent: false,
    yIsPercent: false,
  },
]

const chartMode = useStorage('gcg-quadrant-mode', 'usage-winDk')

const config = computed(() => MODES.find(m => m.key === chartMode.value))

const hasDataForMode = computed(() => {
  const cfg = config.value
  if (!cfg) {
    return false
  }
  return cfg.group === 'card' ? props.cardItems.length > 0 : props.items.length > 0
})

const { width: winWidth } = useWindowSize()
const chartHeight = computed(() => (winWidth.value < 640 ? 350 : 500))
const bubbleRadius = computed(() =>
  winWidth.value < 640 ? { min: 4, max: 10 } : { min: 8, max: 24 },
)

const parsed = computed(() => {
  const cfg = config.value
  if (!cfg) {
    return []
  }
  if (cfg.group === 'card') {
    return props.cardItems
      .filter(item => {
        if (cfg.key === 'card-versatility' && item.archetypeCount <= 1) {
          return false
        }
        return true
      })
      .sort((a, b) => b.totalDecksIncluded - a.totalDecksIncluded)
      .slice(0, 60)
      .map(item => {
        const enriched = { ...item }
        if (cfg.yKey === '_winnerRate') {
          enriched._winnerRate =
            item.totalDecksIncluded > 0
              ? (item.totalWinnerDecks / item.totalDecksIncluded) * 100
              : 0
        }
        const x = parseFloat(enriched[cfg.xKey])
        const v = enriched[cfg.yKey]
        const y = cfg.yIsPercent ? parseFloat(v) : Number(v)
        if (isNaN(x) || isNaN(y)) {
          return null
        }
        return { ...enriched, _x: x, _y: y }
      })
      .filter(Boolean)
  }
  return props.items
    .filter(item => item.decks >= 3 && item.wins >= (cfg.minWins ?? 1))
    .map(item => {
      const x = parseFloat(item[cfg.xKey])
      const v = item[cfg.yKey]
      const y = cfg.yIsPercent ? parseFloat(v) : Number(v)
      if (isNaN(x) || isNaN(y)) {
        return null
      }
      return { ...item, _x: x, _y: y }
    })
    .filter(Boolean)
})

const medX = computed(() => median(parsed.value.map(d => d._x)))
const medY = computed(() => median(parsed.value.map(d => d._y)))

const xMax = computed(() => {
  const mx = Math.max(...parsed.value.map(d => d._x), 0)
  return mx === 0 ? 1 : Math.ceil(mx * 1.15)
})

const yMax = computed(() => {
  const mx = Math.max(...parsed.value.map(d => d._y), 0)
  return mx === 0 ? 1 : Math.ceil(mx * 1.15)
})

const chartSeries = computed(() => {
  const cfg = config.value
  if (!cfg) {
    return []
  }
  if (cfg.group === 'card') {
    const groups = {}
    for (const item of parsed.value) {
      const color = CARD_COLOR_ORDER.includes(item.color) ? item.color : 'Other'
      const group = (groups[color] ??= [])
      group.push({
        x: item._x,
        y: item._y,
        z: item.totalDecksIncluded,
        meta: {
          name: item.name,
          cardId: item.cardId,
          color: item.color,
          type: item.type,
          totalDecksIncluded: item.totalDecksIncluded,
          totalWinnerDecks: item.totalWinnerDecks,
          archetypeCount: item.archetypeCount,
        },
      })
    }
    return CARD_COLOR_ORDER.filter(c => groups[c]).map(c => ({ name: c, data: groups[c] }))
  }
  const groups = {}
  for (const item of parsed.value) {
    const group = (groups[item.tier] ??= [])
    group.push({
      x: item._x,
      y: item._y,
      z: item.wins,
      meta: {
        archetype: item.archetype,
        usePct: item.usePct,
        winPerDk: item.winPerDk,
        winPerEv: item.winPerEv,
        t4PerDk: item.t4PerDk,
        decks: item.decks,
        wins: item.wins,
        top4: item.top4,
        score: item.score,
      },
    })
  }
  return TIER_ORDER.filter(t => groups[t]).map(t => ({ name: t, data: groups[t] }))
})

const seriesColors = computed(() => {
  const cfg = config.value
  if (!cfg) {
    return TIER_COLORS
  }
  if (cfg.group === 'card') {
    const present = new Set(chartSeries.value.map(s => s.name))
    return CARD_COLOR_ORDER.filter(c => present.has(c)).map(c => CARD_COLOR_MAP[c])
  }
  const present = new Set(chartSeries.value.map(s => s.name))
  return TIER_ORDER.filter(t => present.has(t)).map((_, i) => TIER_COLORS[i])
})

const chartOptions = computed(() => {
  const cfg = config.value
  if (!cfg) {
    return {}
  }
  const dark = isDark.value
  const textColor = dark ? '#9ca3af' : '#999'
  const gridColor = dark ? '#374151' : '#e5e7eb'
  const annotColor = dark ? '#6b7280' : '#999'
  const labelColor = dark ? '#6b7280' : '#bbb'
  const fontFamily = "'Roboto Mono', 'Noto Sans TC', monospace"
  const isCard = cfg.group === 'card'

  const fmtX = v => (cfg.xIsPercent ? Math.round(v) + '%' : Math.round(v))
  const fmtY = v => (cfg.yIsPercent ? Math.round(v) + '%' : Math.round(v))

  function getQuadrantLabels(key) {
    if (key === 'card-impact') {
      return ['Elite', 'Hidden Gem', 'Fringe', 'Overplayed']
    }
    if (key === 'card-versatility') {
      return ['Staples', 'Specialist', 'Obscure', 'One-Trick']
    }
    return ['Meta', 'Sleeper', 'Niche', 'Trap']
  }

  const qLabels = []
  if (medX.value !== null && medY.value !== null) {
    const [tr, tl, bl, br] = getQuadrantLabels(cfg.key)
    qLabels.push(
      { x: (medX.value + xMax.value) / 2, y: (medY.value + yMax.value) / 2, text: tr },
      { x: medX.value / 2, y: (medY.value + yMax.value) / 2, text: tl },
      { x: medX.value / 2, y: medY.value / 2, text: bl },
      { x: (medX.value + xMax.value) / 2, y: medY.value / 2, text: br },
    )
  }

  return {
    theme: { mode: dark ? 'dark' : 'light' },
    chart: {
      type: 'bubble',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: seriesColors.value,
    dataLabels: { enabled: false },
    plotOptions: {
      bubble: {
        minBubbleRadius: bubbleRadius.value.min,
        maxBubbleRadius: bubbleRadius.value.max,
      },
    },
    markers: {
      strokeColor: '#fff',
      strokeWidth: 0.5,
    },
    xaxis: {
      min: 0,
      max: xMax.value,
      tickAmount: 5,
      title: {
        text: cfg.xLabel,
        style: { fontSize: '12px', color: textColor, fontFamily, cssClass: 'tracking-wider' },
      },
      labels: {
        formatter: fmtX,
        style: { fontSize: '12px', colors: textColor, fontFamily, cssClass: 'tracking-wider' },
      },
    },
    yaxis: {
      min: 0,
      max: yMax.value,
      tickAmount: 5,
      title: {
        text: cfg.yLabel,
        style: { fontSize: '12px', color: textColor, fontFamily, cssClass: 'tracking-wider' },
      },
      labels: {
        formatter: fmtY,
        style: { fontSize: '12px', colors: textColor, fontFamily, cssClass: 'tracking-wider' },
      },
    },
    tooltip: {
      custom({ seriesIndex, dataPointIndex, w }) {
        const d = w.config.series[seriesIndex].data[dataPointIndex]
        if (isCard) {
          return `<div class="${tw`max-w-40 truncate px-1.5 py-0.5 text-xxs leading-snug break-words sm:max-w-52 sm:px-2 sm:py-1 sm:text-xs`}">
            <b>${d.meta.name}</b><br/>
            ID: ${d.meta.cardId}.${d.meta.type}<br/>
            Color: ${d.meta.color}<br/>
            Decks: ${d.meta.totalDecksIncluded}<br/>
            Winner Decks: ${d.meta.totalWinnerDecks}<br/>
            Winner Rate: ${d.meta.totalDecksIncluded > 0 ? Math.round((d.meta.totalWinnerDecks / d.meta.totalDecksIncluded) * 100) : 0}%<br/>
            Archetypes: ${d.meta.archetypeCount}
          </div>`
        }
        return `<div class="${tw`max-w-60 truncate px-1.5 py-0.5 text-xxs leading-snug break-words sm:max-w-72 sm:px-2 sm:py-1 sm:text-xs`}">
          <b>${d.meta.archetype}</b><br/>
          Use: ${d.meta.usePct}<br/>
          Win/Dk: ${d.meta.winPerDk}<br/>
          Win/Ev: ${d.meta.winPerEv}<br/>
          Top4/Dk: ${d.meta.t4PerDk}<br/>
          Score: ${d.meta.score}<br/>
          Decks: ${d.meta.decks}<br/>
          Wins: ${d.meta.wins}<br/>
          Top4: ${d.meta.top4}
        </div>`
      },
    },
    annotations: {
      position: 'back',
      xaxis:
        medX.value !== null
          ? [{ x: medX.value, strokeDashArray: 4, borderColor: annotColor, borderWidth: 1 }]
          : [],
      yaxis:
        medY.value !== null
          ? [{ y: medY.value, strokeDashArray: 4, borderColor: annotColor, borderWidth: 1 }]
          : [],
      points: qLabels.map(q => ({
        x: q.x,
        y: q.y,
        marker: { size: 0 },
        label: {
          text: q.text,
          borderWidth: 0,
          textAnchor: 'middle',
          offsetX: 0,
          offsetY: 0,
          style: {
            background: 'transparent',
            color: labelColor,
            fontSize: '11px',
            fontWeight: 'bold',
            fontFamily,
            cssClass: 'tracking-wider',
          },
        },
      })),
    },
    grid: { borderColor: gridColor },
    legend: { show: false },
  }
})

function median(arr) {
  if (!arr.length) {
    return null
  }
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}
</script>
