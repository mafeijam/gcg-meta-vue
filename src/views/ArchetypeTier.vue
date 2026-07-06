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
import manifest from '$data/archetypes/index.json'

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
  loadingTimeout = setTimeout(() => { detailLoading.value = true }, 200)
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
