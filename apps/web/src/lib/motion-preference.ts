import { useEffect, useState } from "react"

const STORAGE_KEY = "so4-reduced-motion"
const CHANGE_EVENT = "so4:reduced-motion-change"

function readPreference(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "true"
}

function applyPreference(enabled: boolean): void {
  document.documentElement.dataset.reducedMotion = String(enabled)
}

/** Persist and broadcast the app-level motion preference. */
export function setMotionReduction(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled))
  applyPreference(enabled)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Combines the system preference with the explicit app preference. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => {
      const enabled = media.matches || readPreference()
      applyPreference(readPreference())
      setReduced(enabled)
    }
    sync()
    media.addEventListener("change", sync)
    window.addEventListener(CHANGE_EVENT, sync)
    return () => {
      media.removeEventListener("change", sync)
      window.removeEventListener(CHANGE_EVENT, sync)
    }
  }, [])

  return reduced
}

export function useMotionReductionSetting(): readonly [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabled] = useState(readPreference)

  useEffect(() => {
    const sync = () => setEnabled(readPreference())
    sync()
    window.addEventListener(CHANGE_EVENT, sync)
    return () => window.removeEventListener(CHANGE_EVENT, sync)
  }, [])

  return [enabled, setMotionReduction] as const
}
