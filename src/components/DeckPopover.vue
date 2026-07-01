<template>
  <div
    class="relative"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @contextmenu.prevent
    @click="onClick"
  >
    <slot />

    <!-- Desktop hover popover -->
    <div
      v-if="open && cards.length"
      class="absolute z-1000 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-800"
      :class="[
        anchor === 'top' ? 'bottom-full mb-1' : 'top-full mt-1',
        hPos === 'right' ? 'right-0' : 'left-0',
      ]"
      :style="{ minWidth: popoverWidth + 'px' }"
    >
      <div class="flex flex-col gap-2">
        <div
          v-for="(row, ri) in cardRows"
          :key="ri"
          class="grid gap-2"
          :style="{ gridTemplateColumns: `repeat(${maxCols}, 100px)` }"
        >
          <div
            v-for="card in row"
            :key="card.cardId"
            class="relative overflow-hidden rounded-lg aspect-[3/4]"
            :class="{ 'outline-2 outline-akabeni': isCoreUnit(card) }"
          >
            <img
              :src="`https://jw-assets.imgix.net/gcg-img/${card.cardId}.webp?w=100`"
              :alt="card.name"
              class="w-full object-cover"
              loading="lazy"
            />
            <span
              class="absolute top-0 right-0 rounded-bl-lg bg-black/60 px-1.5 text-2xl leading-tight font-bold text-white select-none"
            >
              {{ card.qty }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile fullscreen overlay -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="mobileOpen"
          class="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50"
          @click="closeMobile"
        >
          <div
            class="mx-2 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-2 shadow-2xl select-none dark:bg-gray-800"
          >
            <div class="mb-2 flex gap-2">
              <button
                class="flex-1 rounded-lg bg-gray-100 py-1.5 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                @click="closeMobile"
              >
                Close
              </button>
              <button
                class="flex-1 rounded-lg bg-ruri py-1.5 text-sm font-medium text-white"
                @click="openUrl"
              >
                Open
              </button>
            </div>
            <div class="grid grid-cols-3 gap-1.5">
              <div
                v-for="card in sortedCards"
                :key="card.cardId"
                class="relative overflow-hidden rounded-lg aspect-[3/4]"
                :class="{ 'outline-2 outline-akabeni': isCoreUnit(card) }"
              >
                <img
                  :src="`https://jw-assets.imgix.net/gcg-img/${card.cardId}.webp?w=200`"
                  :alt="card.name"
                  class="w-full object-cover"
                  loading="lazy"
                />
                <span
                  class="absolute top-0 right-0 rounded-bl-lg bg-black/60 px-1.5 text-2xl leading-tight font-bold text-white select-none"
                >
                  {{ card.qty }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
const props = defineProps({
  cards: { type: Array, required: true },
  url: { type: String, default: '' },
})

const open = ref(false)
const mobileOpen = ref(false)
const anchor = ref('bottom')
const hPos = ref('left')
const popoverWidth = ref(0)

let showTimer = null

const TYPE_ORDER = { UNIT: 0, PILOT: 1, COMMAND: 2, BASE: 3 }

const sortedCards = computed(() =>
  [...props.cards].sort((a, b) => {
    const ta = TYPE_ORDER[a.type] ?? 99
    const tb = TYPE_ORDER[b.type] ?? 99
    if (ta !== tb) {
      return ta - tb
    }
    if (a.color !== b.color) {
      return (a.color ?? '').localeCompare(b.color ?? '')
    }
    return (a.level ?? 0) - (b.level ?? 0)
  }),
)

function isCoreUnit(card) {
  return card.type === 'UNIT' && (card.inclusionRate ?? 0) >= 0.75
}

const MAX_COLS = 8
const CARD_W = 100
const GAP = 8
const PAD = 20
const BORDER = 2
const ROW_H = 133

// Max grid columns, recalculated on hover to fit viewport
const cols = ref(MAX_COLS)

const cardRows = computed(() => {
  const sc = sortedCards.value
  const n = sc.length
  if (n <= MAX_COLS) {
    return [sc]
  }
  const perRow = Math.min(cols.value, Math.ceil(n / 3))
  const rows = []
  let remaining = n
  for (let i = 0; i < 3; i++) {
    const size = Math.min(perRow, remaining)
    if (size <= 0) {
      break
    }
    rows.push(sc.slice(n - remaining, n - remaining + size))
    remaining -= size
  }
  return rows
})

const maxCols = computed(() => cardRows.value.reduce((m, r) => Math.max(m, r.length), 0))

function closeMobile() {
  mobileOpen.value = false
}

function openUrl() {
  if (props.url) {
    window.open(props.url, '_blank', 'noopener')
  }
  mobileOpen.value = false
}

function onClick(event) {
  if (window.innerWidth >= 768 || !event.target.closest('a')) {
    return
  }
  event.preventDefault()
  mobileOpen.value = true
}

// Max columns that fit viewport with 16px margin each side
function calcFitCols() {
  const maxAvail = window.innerWidth - 32
  return Math.max(
    2,
    Math.min(MAX_COLS, Math.floor((maxAvail - PAD - BORDER + GAP) / (CARD_W + GAP))),
  )
}

function onEnter(event) {
  if (window.innerWidth < 768) {
    return
  }
  const el = event.currentTarget
  clearTimeout(showTimer)
  showTimer = setTimeout(() => {
    const viewportCols = calcFitCols()
    cols.value = viewportCols
    const rect = el.getBoundingClientRect()
    const n = props.cards.length
    const perRow = n <= viewportCols ? n : Math.min(viewportCols, Math.ceil(n / 3))
    const rows = n <= viewportCols ? 1 : 3
    const estimatedWidth = perRow * CARD_W + (perRow - 1) * GAP + PAD + BORDER
    const estimatedHeight = rows * ROW_H + PAD + BORDER
    popoverWidth.value = estimatedWidth

    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    if (estimatedHeight <= spaceBelow) {
      anchor.value = 'bottom'
    } else if (estimatedHeight <= spaceAbove) {
      anchor.value = 'top'
    } else {
      anchor.value = spaceBelow >= spaceAbove ? 'bottom' : 'top'
    }

    const canLeft = rect.left + estimatedWidth <= window.innerWidth
    const canRight = rect.right >= estimatedWidth
    if (!canLeft && canRight) {
      hPos.value = 'right'
    } else if (!canRight && canLeft) {
      hPos.value = 'left'
    } else if (!canLeft && !canRight) {
      hPos.value = rect.left + rect.right < window.innerWidth ? 'left' : 'right'
    }

    open.value = true
  }, 300)
}

function onLeave() {
  clearTimeout(showTimer)
  open.value = false
}

onUnmounted(() => clearTimeout(showTimer))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.relative a {
  -webkit-touch-callout: none;
  touch-action: none;
}
</style>
