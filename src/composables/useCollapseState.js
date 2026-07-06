const showOther = ref(false)
const showDeckUrls = ref(false)
const showRemoved = ref(false)

export function useCollapseState() {
  return { showOther, showDeckUrls, showRemoved }
}
