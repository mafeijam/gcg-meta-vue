<template>
  <div class="mx-auto max-w-340 p-3 max-sm:pb-6 md:p-8">
    <SeriesHeader
      title="Archetype Tier"
      :visible="!!currentSeries"
      :events="currentSeries?.events ?? 0"
      :wins="totalWins"
      :decks="currentSeries?.totalDecks ?? 0"
      :archetypes="allRows.length"
    />

    <div
      class="sticky top-12 z-40 -mx-3 bg-white px-3 py-3 transition-transform duration-300 md:-mx-8 md:px-8 dark:bg-nalika-bg"
      :class="hideFilter ? '-translate-y-full' : 'translate-y-0'"
    >
      <GeneralDropdown
        v-model="selectedKey"
        class="ml-auto w-fit md:max-w-md"
        :options="seriesOptions"
      />
    </div>

    <div v-if="!tierDataLoaded" class="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
      Loading…
    </div>

    <template v-if="tierDataLoaded">
      <SigPieChart :rows="allRows" :series-decks="currentSeries?.totalDecks ?? 0" class="mb-6 md:mb-2" />
      <div class="space-y-3 md:hidden">
        <MobileTierCard
          v-for="row in tierRows"
          :key="row.archetype"
          :row="row"
          :detail-loading="detailLoading"
          @detail="openDetail"
        />
        <button
          v-if="zeroWinRows.length"
          class="w-full cursor-pointer py-2 text-center text-xs font-medium text-ruri"
          @click="toggleZeroWins"
        >
          0 Wins（{{ zeroWinRows.length }}）{{ showZeroWins ? '−' : '+' }}
        </button>
        <template v-if="showZeroWins">
          <MobileTierCard
            v-for="row in zeroWinRows"
            :key="row.archetype"
            :row="row"
            :detail-loading="detailLoading"
            @detail="openDetail"
          />
        </template>
      </div>

      <TierTable
        :rows="tierRows"
        :zero-win-rows="zeroWinRows"
        :show-zero-wins="showZeroWins"
        :detail-loading="detailLoading"
        @detail="openDetail"
        @toggle-zero-wins="toggleZeroWins"
      />

      <!-- Unassigned Decks (collapsible) -->
      <div v-if="unassignedDecks?.deckUrls?.length" class="mt-4 scroll-mt-14">
        <button
          class="font-medium text-ruri underline-offset-5 hover:underline focus:outline-none"
          @click="toggleUnassigned"
        >
          Unassigned Decks（{{ unassignedDecks.count }}）{{ showUnassigned ? '−' : '+' }}
        </button>
        <div v-if="showUnassigned" class="mt-2 space-y-1">
          <div
            class="mb-1 text-sm font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500"
          >
            Winner Decks
          </div>
          <div class="flex flex-wrap gap-x-5 gap-y-2.5">
            <DeckPopover
              v-for="(d, i) in unassignedDeckPreviews.filter(d => d.isWinner)"
              :key="d.url"
              :cards="d.cards"
              :url="d.url"
              :label="'Deck ' + (i + 1)"
              class="flex items-center gap-2"
            >
              <a
                :href="d.url"
                target="_blank"
                rel="noopener"
                class="text-xs break-all text-ruri hover:underline dark:text-sora/65"
              >
                Deck {{ i + 1 }}
              </a>
              <span
                class="rounded bg-yellow-100 px-1 text-xxs font-medium text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300/70"
              >
                W
              </span>
            </DeckPopover>
          </div>
          <div
            v-if="!unassignedDeckPreviews.filter(d => d.isWinner).length"
            class="text-xs text-gray-400 dark:text-gray-500"
          >
            No winner decks
          </div>
          <div
            class="mt-3 mb-1 text-sm font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500"
          >
            Other Decks
          </div>
          <div class="flex flex-wrap gap-x-5 gap-y-2.5">
            <DeckPopover
              v-for="(d, i) in unassignedDeckPreviews.filter(d => !d.isWinner)"
              :key="d.url"
              :cards="d.cards"
              :url="d.url"
              :label="'Deck ' + (i + 1)"
            >
              <a
                :href="d.url"
                target="_blank"
                rel="noopener"
                class="text-xs break-all text-ruri hover:underline dark:text-sora/65"
              >
                Deck {{ i + 1 }}
              </a>
            </DeckPopover>
          </div>
        </div>
      </div>
    </template>

    <ArchetypeModal
      v-if="detailArch"
      :archetype="detailArch"
      :tier="detailTier"
      @close="closeDetail"
    />
  </div>
</template>

<script setup>
import SigPieChart from '../components/SigPieChart.vue'
import DeckPopover from '../components/DeckPopover.vue'
import manifest from '$data/archetypes/index.json'
import cardMeta from '$data/card-meta.json'

const cardMetaMap = new Map(cardMeta.map(c => [c.id, c]))

function normalizeName(name) {
  return name.replace(/[（）]/g, c => (c === '（' ? '(' : ')')).replace(/\s*\(/g, '(')
}

const router = useRouter()
const route = useRoute()
const { tierData, tierDataLoaded, loadTierData } = useTierData()

const seriesOptions = computed(() =>
  tierData.value.map(s => ({
    value: s.value,
    label: s.label,
  })),
)

const validSeries = computed(() => tierData.value.map(s => s.value))
const initial = computed(() => {
  if (!tierData.value.length) {
    return ''
  }
  return validSeries.value.includes(route.query.series)
    ? route.query.series
    : tierData.value[0]?.value
})
const selectedKey = ref(initial.value ?? '')

watch(selectedKey, val => {
  router.replace({ query: { series: val } })
})

watch(tierDataLoaded, val => {
  if (val && !selectedKey.value && tierData.value.length) {
    selectedKey.value = tierData.value[0].value
  }
})

const currentSeries = computed(() => tierData.value.find(s => s.value === selectedKey.value))

const { hideFilter } = useScrollHide()

const totalWins = computed(() => currentSeries.value?.winDecks ?? 0)

const allRows = computed(() => currentSeries.value?.rows ?? [])

const tierRows = computed(() => allRows.value.filter(r => r.wins > 0))

const zeroWinRows = computed(() => allRows.value.filter(r => r.wins === 0))

const showZeroWins = ref(false)

function toggleZeroWins() {
  showZeroWins.value = !showZeroWins.value
}

const showUnassigned = ref(false)

function toggleUnassigned() {
  showUnassigned.value = !showUnassigned.value
}

const unassignedDecks = computed(() => currentSeries.value?.unassignedDecks ?? null)

const unassignedDeckPreviews = computed(() => {
  const ud = unassignedDecks.value
  if (!ud?.deckUrls?.length) {
    return []
  }
  return ud.deckUrls.map((url, i) => {
    const cards = (ud.deckCardIds?.[i] ?? '')
      .split('|')
      .filter(Boolean)
      .map(part => {
        const [cardId, qty] = part.split(':')
        const info = cardMetaMap.get(cardId)
        return {
          cardId,
          qty: Number(qty),
          name: info?.name ?? cardId,
          type: info?.type ?? 'UNIT',
          color: info?.color ?? '',
          level: 0,
          inclusionRate: 0,
        }
      })
    return { url, idx: i, isWinner: ud.deckWinnerFlags?.[i] ?? false, cards }
  })
})

const detailArch = ref(null)
const detailTier = ref(null)

function closeDetail() {
  detailArch.value = null
  detailTier.value = null
}

const detailLoading = ref(false)
let loadingTimeout = null

async function openDetail(row) {
  const entry = manifest.find(s => s.value === selectedKey.value)
  if (!entry) {
    return
  }
  const idx = entry.archetypes.findIndex(
    a => normalizeName(a.combo) === normalizeName(row.archetype),
  )
  if (idx === -1) {
    return
  }
  const path = `/data-processed/archetypes/${selectedKey.value}/${idx}.json`
  clearTimeout(loadingTimeout)
  loadingTimeout = setTimeout(() => {
    detailLoading.value = true
  }, 200)
  try {
    const mod = await archModules[path]?.()
    detailArch.value = mod?.default ?? null
    detailTier.value = row.tier ?? null
  } catch {
    // import failed — reset silently
  } finally {
    clearTimeout(loadingTimeout)
    detailLoading.value = false
  }
}

onUnmounted(() => clearTimeout(loadingTimeout))

onMounted(() => loadTierData())
</script>
