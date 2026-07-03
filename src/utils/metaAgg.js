import archModules from './archModules'

export async function aggregateCards(seriesKey) {
  const entries = Object.entries(archModules)
    .filter(([path]) => path.startsWith(`/data-processed/archetypes/${seriesKey}/`))
    .sort(([a], [b]) => a.localeCompare(b))

  const cardMap = {}
  const sigCardCounts = {}

  for (const [, loader] of entries) {
    const mod = await loader()
    const archetype = mod.default
    if (!archetype?.cards) {
      continue
    }
    for (const card of archetype.cards) {
      const c = cardMap[card.cardId]
      if (c) {
        c.totalDecksIncluded += card.decksIncluded
        c.totalWinnerDecks += card.winnerDeckCount
        c.archetypeCount += 1
      } else {
        cardMap[card.cardId] = {
          cardId: card.cardId,
          name: card.name,
          color: card.color,
          type: card.type,
          rarity: card.rarity,
          totalDecksIncluded: card.decksIncluded,
          totalWinnerDecks: card.winnerDeckCount,
          archetypeCount: 1,
        }
      }
    }
    for (const sigId of archetype.sigCardIds ?? []) {
      sigCardCounts[sigId] = (sigCardCounts[sigId] || 0) + 1
    }
  }

  const cards = Object.values(cardMap)

  const topSigCards = Object.entries(sigCardCounts)
    .map(([cardId, count]) => {
      const info = cardMap[cardId] || {}
      return {
        cardId,
        name: info.name || '?',
        color: info.color || 'inherit',
        archetypeCount: count,
      }
    })
    .sort((a, b) => b.archetypeCount - a.archetypeCount)
    .slice(0, 10)

  return {
    cards,
    topPlayed: [...cards].sort((a, b) => b.totalDecksIncluded - a.totalDecksIncluded).slice(0, 10),
    topWinner: [...cards].sort((a, b) => b.totalWinnerDecks - a.totalWinnerDecks).slice(0, 10),
    topSigCards,
  }
}
