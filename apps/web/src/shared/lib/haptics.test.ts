import { afterEach, describe, expect, it, vi } from "vitest"

import { haptic } from "./haptics"

describe("haptic", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete document.documentElement.dataset.reducedMotion
  })

  it("uses a short success vibration when supported", () => {
    const vibrate = vi.fn()
    Object.defineProperty(navigator, "vibrate", { configurable: true, value: vibrate })

    haptic("success")

    expect(vibrate).toHaveBeenCalledWith(12)
  })

  it("does nothing when reduced motion is selected", () => {
    const vibrate = vi.fn()
    Object.defineProperty(navigator, "vibrate", { configurable: true, value: vibrate })
    document.documentElement.dataset.reducedMotion = "true"

    haptic("error")

    expect(vibrate).not.toHaveBeenCalled()
  })
})
