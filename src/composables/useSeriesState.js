import tierData from '$data/tiers.json'

export function useSeriesState() {
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
  const totalSeriesDecks = computed(() => currentSeries.value?.totalDecks ?? 0)
  const totalSeriesWinnerDecks = computed(() => currentSeries.value?.winDecks ?? 0)

  const percentOf = (value, total) => (total ? Math.round((value / total) * 100) : 0)
  const percentOf1 = (value, total) => (total ? ((value / total) * 100).toFixed(1) : 0)

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
  const eventMinDate = computed(() => currentSeries.value?.eventMinDate ?? null)

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
  const totalArchetypes = computed(() => allRows.value.length)

  const quadrantData = computed(() =>
    allRows.value.map(r => ({
      archetype: r.archetype,
      usePct: r.usePct,
      winPerDk: r.winPerDk,
      winPerEv: r.winPerEv,
      t4PerDk: r.t4PerDk,
      score: r.score,
      decks: r.decks,
      wins: r.wins,
      top4: r.top4,
      tier: r.tier,
    })),
  )

  return {
    seriesOptions,
    selectedKey,
    currentSeries,
    totalSeriesDecks,
    totalSeriesWinnerDecks,
    percentOf,
    percentOf1,
    previousSeries,
    eventCutoffDate,
    eventMinDate,
    seriesTimeline,
    hideFilter,
    allRows,
    totalArchetypes,
    quadrantData,
  }
}
