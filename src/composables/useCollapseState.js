const showOther = ref(false)
const showDeckUrls = ref(false)
const showRemoved = ref(false)
const showUnassigned = ref(false)

export function useCollapseState() {
  return { showOther, showDeckUrls, showRemoved, showUnassigned }
}
