/**
 * CSS scroll-driven animation support (#885).
 *
 * `animation-timeline: view()` is the preferred path: it runs off the main
 * thread and needs no IntersectionObserver. Browsers without support keep the
 * existing observer fallback.
 */
export function supportsViewTimeline(): boolean {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("animation-timeline: view()")
  )
}
