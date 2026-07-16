export function useCardData(selectedKey) {
  const aggregationResult = ref(null)
  const loadingCards = ref(false)
  const cardMeta = ref([])
  const { start, finish } = useLoadingBar()

  const cardInfoById = computed(() => {
    const map = {}
    for (const card of cardMeta.value) {
      if (card.id) {
        map[card.id] = card
      }
    }
    return map
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
    start()
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
      finish()
    }
  }

  watch(selectedKey, async val => {
    await loadCardData(val)
  })

  return {
    aggregationResult,
    loadingCards,
    cardMeta,
    cardInfoById,
    loadCardData,
  }
}
