<template>
  <div
    v-if="chartSlices.length"
    class="flex flex-col items-center justify-center gap-3 md:flex-row md:gap-4"
  >
    <svg :viewBox="`0 0 ${SIZE} ${SIZE}`" class="h-80 w-80 shrink-0 md:h-[28rem] md:w-[28rem]">
      <defs>
        <clipPath v-for="(s, i) in chartSlices" :id="`${uid}-clip-${i}`" :key="`clip-${i}`">
          <path :d="s.path" />
        </clipPath>
      </defs>
      <g
        v-for="(s, i) in chartSlices"
        :key="i"
        class="cursor-pointer"
        :opacity="hovered === null || hovered === i ? 1 : 0.55"
        @mouseenter="hovered = i"
        @mouseleave="hovered = null"
      >
        <path :d="s.path" :fill="s.color" />
        <image
          v-if="s.showImage"
          :href="s.imgUrl"
          :x="s.imgX"
          :y="s.imgY"
          :width="SIZE"
          :height="SIZE"
          :clip-path="`url(#${uid}-clip-${i})`"
          preserveAspectRatio="xMidYMid slice"
        />
        <path :d="s.path" fill="none" stroke="#000" stroke-width="2" />
      </g>
      <g v-for="(dot, i) in colorDots" :key="`dot-${i}`">
        <circle :cx="dot.x" :cy="dot.y" :r="4" :fill="dot.hex" stroke="#000" stroke-width="1" />
      </g>
    </svg>
    <div class="w-full max-w-80 min-w-0 space-y-1 md:max-w-xs">
      <div
        v-for="(s, i) in chartSlices"
        :key="i"
        class="flex cursor-pointer items-center gap-2 rounded px-1.5 py-0.5 text-xs transition-colors"
        :class="hovered === i ? 'bg-gray-100 dark:bg-gray-800' : ''"
        @mouseenter="hovered = i"
        @mouseleave="hovered = null"
      >
        <span class="flex shrink-0 gap-0.5">
          <span
            v-for="(c, ci) in s.label === 'Other' ? ['Other'] : s.label.split('+')"
            :key="ci"
            class="inline-block h-2.5 w-2.5 rounded-full"
            :style="{ background: COLOR_HEX[c] || '#9ca3af' }"
          />
        </span>
        <span class="truncate text-gray-700 dark:text-gray-300">{{ s.label }}</span>
        <span
          class="ml-auto shrink-0 text-right font-mono text-gray-500 tabular-nums dark:text-gray-400"
        >
          {{ s.decks }} ({{ s.pct }}%)
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { COLOR_HEX } from '../utils/colors.js'

const props = defineProps({
  rows: { type: Array, required: true },
})

const CX = 120
const CY = 120
const OUTER_R = 100
const SIZE = 240
const uid = `pie-${Math.random().toString(36).slice(2, 8)}`
const hovered = ref(null)

function polarToCartesian(r, angle) {
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) }
}

function slicePath(startAngle, endAngle) {
  const start = polarToCartesian(OUTER_R, startAngle)
  const end = polarToCartesian(OUTER_R, endAngle)
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
  return [
    `M ${CX} ${CY}`,
    `L ${start.x} ${start.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

const totalDecks = computed(() => props.rows.reduce((s, r) => s + r.decks, 0))

const grouped = computed(() => {
  const groups = {}
  for (const row of props.rows) {
    const key = row.colors
    if (!groups[key]) {
      groups[key] = { colors: key, decks: 0, topRow: row }
    }
    const g = groups[key]
    g.decks += row.decks
    if (row.decks > (g.topRow?.decks ?? 0)) {
      g.topRow = row
    }
  }
  const sorted = Object.values(groups).sort((a, b) => b.decks - a.decks)
  const top = sorted.slice(0, 5)
  const restDecks = sorted.slice(5).reduce((s, g) => s + g.decks, 0)
  if (restDecks > 0) {
    top.push({ colors: 'Other', decks: restDecks, topRow: null })
  }
  return top
})

const chartSlices = computed(() => {
  const total = totalDecks.value
  if (!total) {
    return []
  }
  const MIN_SWEEP = 0.05
  let currentAngle = -Math.PI / 2
  return grouped.value.map(g => {
    const sweep = (g.decks / total) * 2 * Math.PI
    const endAngle = currentAngle + sweep
    const path = slicePath(currentAngle, endAngle)
    const isOther = g.colors === 'Other'
    const firstColor = isOther ? null : g.colors.split('+')[0]
    const color = firstColor ? COLOR_HEX[firstColor] || '#9ca3af' : '#9ca3af'
    const pct = ((g.decks / total) * 100).toFixed(1)
    let imgUrl = null
    let imgX = null
    let imgY = null
    const sigCardId = isOther ? 'EXRP-002' : (g.topRow?.sigCardIds?.[0] ?? null)
    if (sigCardId) {
      const midAngle = (currentAngle + endAngle) / 2
      const halfSweep = sweep / 2
      const centroidDistance =
        halfSweep > 0 ? ((2 / 3) * OUTER_R * Math.sin(halfSweep)) / halfSweep : 0
      const centroidX = CX + centroidDistance * Math.cos(midAngle)
      const centroidY = CY + centroidDistance * Math.sin(midAngle)
      imgX = centroidX - SIZE / 2
      imgY = centroidY - SIZE / 2
      imgUrl = `https://jw-assets.imgix.net/gcg-img/${sigCardId}.webp?w=800&fit=crop&ar=3:2&crop=focalpoint&fp-x=0.5&fp-y=0.05`
    }
    const slice = {
      path,
      color,
      imgUrl,
      imgX,
      imgY,
      label: g.colors,
      decks: g.decks,
      pct,
      startAngle: currentAngle,
      endAngle,
      showImage: !!imgUrl && sweep > MIN_SWEEP,
    }
    currentAngle = endAngle
    return slice
  })
})

const colorDots = computed(() => {
  const dots = []
  const SPACING = 0.12
  const RADIUS = OUTER_R - 8
  const LEFT_GAP = 0.1

  for (const s of chartSlices.value) {
    if (s.label === 'Other') {
      continue
    }
    const colors = s.label.split('+')
    const count = colors.length
    const firstAngle = s.startAngle + LEFT_GAP
    for (let i = 0; i < count; i++) {
      const angle = firstAngle + i * SPACING
      const pos = polarToCartesian(RADIUS, angle)
      const colorName = colors[i]
      dots.push({
        x: pos.x,
        y: pos.y,
        hex: COLOR_HEX[colorName] || '#9ca3af',
      })
    }
  }
  return dots
})
</script>
