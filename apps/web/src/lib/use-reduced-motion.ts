export { useReducedMotion } from "./motion-preference"

/**
 * Hook that detects the system's prefers-reduced-motion preference and updates
 * reactively when the user changes their system settings. SSR-safe: returns false
 * on initial server render, then syncs to the actual preference on mount.
 *
 * Components that need CSS-level motion control should use @media (prefers-reduced-motion)
 * instead. This hook is for components that manage animation timers or canvas rendering
 * that CSS alone cannot stop.
 *
 * @returns true if the user prefers reduced motion
 *
 * @example
 * const reducedMotion = useReducedMotion()
 * useEffect(() => {
 *   if (reducedMotion) {
 *     clearInterval(animationLoop)
 *   }
 * }, [reducedMotion])
 */
