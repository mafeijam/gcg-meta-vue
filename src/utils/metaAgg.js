import archModules from './archModules'

export async function aggregateCards(seriesKey) {
  const entries = Object.entries(archModules)
    .filter(([path]) => path === `/data-processed/archetypes/${seriesKey}/_cards.json`)

  if (entries.length === 0) {
    return { cards: [], topPlayed: [], topWinner: [], topSigCards: [], sigCards: [] }
  }

  const [, loader] = entries[0]
  const mod = await loader()
  return mod.default
}
