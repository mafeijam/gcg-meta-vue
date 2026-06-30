import { useScroll, useTimeoutFn } from '@vueuse/core'

// Hides the filter bar on scroll-down past `threshold` px, shows it after
// the user pauses scrolling upward for `showDelay` ms. The delay resets on
// every scroll-up event so the bar only reappears during a stationary pause.
export function useScrollHide(threshold = 120, showDelay = 500) {
  const hideFilter = ref(false)

  // start() resets the timer on each call; stop() cancels it entirely.
  // Repeated start() calls while scrolling up push the show-delay further out.
  const { start, stop } = useTimeoutFn(() => {
    hideFilter.value = false
  }, showDelay)

  let prevY = 0

  useScroll(document, {
    onScroll: () => {
      const currentY = window.scrollY

      if (currentY <= threshold) {
        // Near top — always show
        stop()
        hideFilter.value = false
      } else if (currentY > prevY) {
        // Scrolling down — hide immediately
        stop()
        hideFilter.value = true
      } else if (currentY < prevY) {
        // Scrolling up — start/reset the show-delay timer
        start()
      }

      prevY = currentY
    },
  })

  return { hideFilter }
}
