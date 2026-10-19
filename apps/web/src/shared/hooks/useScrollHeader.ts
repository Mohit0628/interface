import { useEffect, useState } from "react"

const SCROLLED_THRESHOLD = 8
const DIRECTION_THRESHOLD = 6
const MOBILE_HEADER_HEIGHT = 64

type MediaQueryListLike = {
  matches: boolean
  addEventListener?: (
    type: "change",
    listener: (event: MediaQueryListEvent) => void
  ) => void
  removeEventListener?: (
    type: "change",
    listener: (event: MediaQueryListEvent) => void
  ) => void
}

function getMobileQuery(): MediaQueryListLike {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return { matches: false }
  }

  return window.matchMedia("(max-width: 639px)")
}

/**
 * Scroll position for the sticky/fixed header (#884).
 *
 * - `scrolled`: the page has moved far enough for the hairline/shadow.
 * - `hidden`: the mobile header has left the top while scrolling down.
 *
 * Scroll work is coalesced into one animation frame, and the header is always
 * revealed at the top of the page and on desktop. Hiding uses `transform`, so
 * no document layout is recalculated.
 */
export function useScrollHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const mobile = getMobileQuery()
    let lastY = Math.max(0, window.scrollY || 0)
    let frame: number | null = null

    const update = () => {
      frame = null

      const y = Math.max(0, window.scrollY || 0)
      const delta = y - lastY
      const atTop = y <= MOBILE_HEADER_HEIGHT

      setScrolled(y > SCROLLED_THRESHOLD)

      if (!mobile.matches || atTop) {
        setHidden(false)
      } else if (Math.abs(delta) >= DIRECTION_THRESHOLD) {
        setHidden(delta > 0)
      }

      lastY = y
    }

    const scheduleUpdate = () => {
      if (frame === null) frame = requestAnimationFrame(update)
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    mobile.addEventListener?.("change", update)
    update()

    return () => {
      window.removeEventListener("scroll", scheduleUpdate)
      mobile.removeEventListener?.("change", update)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  return { scrolled, hidden }
}
