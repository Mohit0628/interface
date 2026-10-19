import { useEffect, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"
import { supportsViewTimeline } from "@/lib/supports-view-timeline"
import { useViewportReveal } from "@/lib/use-viewport-reveal"
import { useReducedMotion } from "@/lib/use-reduced-motion"

type ViewportRevealProps = {
  children: ReactNode
  className?: string
  /** Extra class applied once the content is visible. */
  revealClass?: string
}

type RevealMode = "pending" | "css" | "fallback" | "reduced"

/**
 * Reveals children as they enter the viewport.
 *
 * Uses CSS scroll-driven animations (`animation-timeline: view()`) where
 * supported, so the reveal runs off the main thread. Browsers without view
 * timelines keep the IntersectionObserver fallback. Reduced motion renders the
 * content immediately, and the children stay in document flow and in the
 * accessibility tree either way.
 */
export function ViewportReveal({
  children,
  className,
  revealClass = "opacity-100",
}: ViewportRevealProps) {
  const reducedMotion = useReducedMotion()
  const [mode, setMode] = useState<RevealMode>("pending")
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    if (reducedMotion) {
      setMode("reduced")
      return
    }

    setMode(supportsViewTimeline() ? "css" : "fallback")
  }, [reducedMotion])

  const ref = useViewportReveal({
    once: true,
    threshold: 0.1,
    enabled: mode === "fallback",
    onReveal: () => setIsRevealed(true),
  })

  const revealed = mode === "reduced" || isRevealed

  return (
    <div
      ref={ref}
      className={cn("so4-view-reveal", revealed && revealClass, className)}
      data-reveal-mode={mode === "pending" ? undefined : mode}
      data-revealed={revealed ? "true" : "false"}
    >
      {children}
    </div>
  )
}
