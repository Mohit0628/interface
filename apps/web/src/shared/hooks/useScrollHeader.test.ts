import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useScrollHeader } from "./useScrollHeader"

type ChangeListener = () => void

function stubMediaQuery(initialMatches: boolean) {
  let matches = initialMatches
  let listener: ChangeListener | undefined

  const query = {
    get matches() {
      return matches
    },
    addEventListener: vi.fn((_event: string, next: ChangeListener) => {
      listener = next
    }),
    removeEventListener: vi.fn(),
  }

  vi.stubGlobal("matchMedia", () => query)

  return {
    query,
    setMobile(value: boolean) {
      matches = value
      listener?.()
    },
  }
}

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value,
  })
}

function scrollTo(value: number) {
  setScrollY(value)
  act(() => {
    window.dispatchEvent(new Event("scroll"))
    vi.advanceTimersByTime(20)
  })
}

describe("useScrollHeader", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setScrollY(0)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("stays idle at the top of the page", () => {
    stubMediaQuery(true)
    const { result } = renderHook(() => useScrollHeader())

    expect(result.current).toEqual({ scrolled: false, hidden: false })
  })

  it("hides on scroll down and reveals on scroll up on mobile", () => {
    stubMediaQuery(true)
    const { result } = renderHook(() => useScrollHeader())

    scrollTo(120)
    expect(result.current.scrolled).toBe(true)
    expect(result.current.hidden).toBe(true)

    scrollTo(60)
    expect(result.current.hidden).toBe(false)
  })

  it("never hides the header on desktop", () => {
    stubMediaQuery(false)
    const { result } = renderHook(() => useScrollHeader())

    scrollTo(240)
    expect(result.current.scrolled).toBe(true)
    expect(result.current.hidden).toBe(false)
  })

  it("reveals the header when crossing back to desktop", () => {
    const media = stubMediaQuery(true)
    const { result } = renderHook(() => useScrollHeader())

    scrollTo(160)
    expect(result.current.hidden).toBe(true)

    act(() => media.setMobile(false))
    expect(media.query.removeEventListener).not.toHaveBeenCalled()
    expect(result.current.hidden).toBe(false)
  })

  it("reveals the header at the top even after a downward scroll", () => {
    stubMediaQuery(true)
    const { result } = renderHook(() => useScrollHeader())

    scrollTo(160)
    expect(result.current.hidden).toBe(true)

    scrollTo(0)
    expect(result.current.scrolled).toBe(false)
    expect(result.current.hidden).toBe(false)
  })

  it("does not flip direction on sub-threshold jitter", () => {
    stubMediaQuery(true)
    const { result } = renderHook(() => useScrollHeader())

    scrollTo(160)
    expect(result.current.hidden).toBe(true)

    scrollTo(157)
    expect(result.current.hidden).toBe(true)
  })

  it("removes listeners and cancels an in-flight frame on unmount", () => {
    const media = stubMediaQuery(true)
    const removeSpy = vi.spyOn(window, "removeEventListener")
    const { unmount } = renderHook(() => useScrollHeader())

    setScrollY(100)
    act(() => window.dispatchEvent(new Event("scroll")))
    unmount()

    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function))
    expect(media.query.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    )
  })
})
