import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

import { useReducedMotion } from "@/lib/use-reduced-motion"

const FALLBACK_DURATION_MS = 400

type CountUpProps = {
  value: number | null
  format: (value: number) => string
  className?: string
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect

function readDurationMs(): number {
  if (typeof window === "undefined") return FALLBACK_DURATION_MS

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--duration-slowest")
    .trim()
  const parsed = Number.parseFloat(raw)

  if (!Number.isFinite(parsed)) return FALLBACK_DURATION_MS
  return raw.endsWith("ms") ? parsed : parsed * 1000
}

/** Same shape as --ease-out: fast start, gentle settle. */
export function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3)
}

/**
 * Eases a landing statistic from 0 to its final value the first time it enters
 * the viewport (#886). The value is rendered as a regular number with tabular
 * figures so the layout never reflows; screen readers get the final formatted
 * value once, never one announcement per frame.
 */
export function CountUp({ value, format, className }: CountUpProps) {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)
  const [display, setDisplay] = useState<number | null>(value)
  const [inView, setInView] = useState(false)

  useIsomorphicLayoutEffect(() => {
    if (value === null || reducedMotion || hasAnimated.current) {
      setDisplay(value)
      return
    }

    // The server/first paint keeps the real value for no-JS readers; the
    // browser resets to zero before paint so the count starts from 0.
    setDisplay(0)
  }, [reducedMotion, value])

  useEffect(() => {
    if (value === null || reducedMotion || hasAnimated.current) return

    const element = ref.current
    if (!element) return

    if (typeof IntersectionObserver === "undefined") {
      hasAnimated.current = true
      setDisplay(value)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        hasAnimated.current = true
        setInView(true)
        observer.disconnect()
      },
      { threshold: 0.35 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [reducedMotion, value])

  useEffect(() => {
    if (!inView || value === null || reducedMotion) return

    const duration = readDurationMs()
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setDisplay(value * easeOutCubic(progress))

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setDisplay(value)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, reducedMotion, value])

  const finalText = value === null ? "Unavailable" : format(value)
  const visibleText = value === null ? "-" : format(display ?? 0)

  return (
    <span ref={ref} className={cn("so4-count-up tabular-nums", className)}>
      <span aria-hidden="true">{visibleText}</span>
      <span className="sr-only">{finalText}</span>
    </span>
  )
}
