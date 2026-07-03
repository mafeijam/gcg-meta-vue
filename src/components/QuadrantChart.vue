<template>
  <div class="w-full">
    <VueApexCharts
      type="bubble"
      height="400"
      width="100%"
      :options="chartOptions"
      :series="chartSeries"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { isDark } from '@/composables/useDarkMode'

const props = defineProps({
  items: { type: Array, default: () => [] },
})

const TIER_ORDER = ['T1', 'T1.5', 'T2', 'T2.5', 'T3', '--']
const TIER_COLORS = ['#fca5a5', '#fdba74', '#fbbf24', '#86efac', '#93c5fd', '#d1d5db']

const parsed = computed(() =>
  props.items
    .filter(item => item.decks >= 3 && item.wins > 0)
    .map(item => ({
      ...item,
      useRate: parseFloat(item.usePct),
      winRate: parseFloat(item.winPerDk),
    }))
    .filter(item => !isNaN(item.useRate) && !isNaN(item.winRate)),
)

const medX = computed(() => median(parsed.value.map(d => d.useRate)))
const medY = computed(() => median(parsed.value.map(d => d.winRate)))

const xMax = computed(() => {
  const mx = Math.max(...parsed.value.map(d => d.useRate), 0)
  return mx === 0 ? 1 : Math.ceil(mx * 1.15)
})

const yMax = computed(() => {
  const mx = Math.max(...parsed.value.map(d => d.winRate), 0)
  return mx === 0 ? 1 : Math.ceil(mx * 1.15)
})

const chartSeries = computed(() => {
  const groups = {}
  for (const item of parsed.value) {
    ;(groups[item.tier] ??= []).push({
      x: item.useRate,
      y: item.winRate,
      z: item.decks,
      meta: {
        archetype: item.archetype,
        usePct: item.usePct,
        winPerDk: item.winPerDk,
        decks: item.decks,
      },
    })
  }
  return TIER_ORDER.filter(t => groups[t]).map(t => ({ name: t, data: groups[t] }))
})

const chartOptions = computed(() => {
  const dark = isDark.value
  const textColor = dark ? '#9ca3af' : '#999'
  const gridColor = dark ? '#374151' : '#e5e7eb'
  const annotColor = dark ? '#6b7280' : '#999'
  const labelColor = dark ? '#6b7280' : '#bbb'

  const qLabels = []
  if (medX.value !== null && medY.value !== null) {
    qLabels.push(
      {
        x: (medX.value + xMax.value) / 2,
        y: (medY.value + yMax.value) / 2,
        text: 'Meta',
      },
      {
        x: medX.value / 2,
        y: (medY.value + yMax.value) / 2,
        text: 'Sleeper',
      },
      {
        x: medX.value / 2,
        y: medY.value / 2,
        text: 'Niche',
      },
      {
        x: (medX.value + xMax.value) / 2,
        y: medY.value / 2,
        text: 'Trap',
      },
    )
  }

  return {
    theme: { mode: dark ? 'dark' : 'light' },
    chart: {
      type: 'bubble',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: TIER_COLORS,
    dataLabels: { enabled: false },
    plotOptions: {
      bubble: {
        minBubbleRadius: 5,
        maxBubbleRadius: 16,
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
      title: { text: 'Usage Rate (%)', style: { fontSize: '10px', color: textColor } },
      labels: {
        formatter: v => Math.round(v) + '%',
        style: { fontSize: '10px', colors: textColor },
      },
    },
    yaxis: {
      min: 0,
      max: yMax.value,
      tickAmount: 5,
      title: {
        text: 'Win Rate / Deck (%)',
        style: { fontSize: '10px', color: textColor },
      },
      labels: {
        formatter: v => Math.round(v) + '%',
        style: { fontSize: '10px', colors: textColor },
      },
    },
    tooltip: {
      custom({ seriesIndex, dataPointIndex, w }) {
        const d = w.config.series[seriesIndex].data[dataPointIndex]
        return `<div style="padding:4px 8px;font-size:12px;line-height:1.4">
          <b>${d.meta.archetype}</b><br/>
          Use: ${d.meta.usePct}<br/>
          Win: ${d.meta.winPerDk}<br/>
          Decks: ${d.meta.decks}
        </div>`
      },
    },
    annotations: {
      position: 'back',
      xaxis: medX.value !== null
        ? [{ x: medX.value, strokeDashArray: 4, borderColor: annotColor, borderWidth: 1 }]
        : [],
      yaxis: medY.value !== null
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
