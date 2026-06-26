export function tierBarClass(tier) {
  const map = {
    T1: tw`bg-red-300 dark:bg-red-700`,
    'T1.5': tw`bg-orange-300 dark:bg-orange-700`,
    T2: tw`bg-amber-400 dark:bg-amber-700`,
    'T2.5': tw`bg-green-300 dark:bg-green-700`,
    T3: tw`bg-blue-300 dark:bg-blue-900`,
    '--': tw`bg-gray-300 dark:bg-gray-700`,
  }
  return map[tier] || tw`bg-gray-300 dark:bg-gray-700`
}

export function tierPillClass(tier) {
  const map = {
    T1: tw`bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400`,
    'T1.5': tw`bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400`,
    T2: tw`bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400`,
    'T2.5': tw`bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400`,
    T3: tw`bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400`,
    '--': tw`bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400`,
  }
  return map[tier] || tw`bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400`
}
