import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"

import { CountUp, easeOutCubic } from "./count-up"
import { shortFormat } from "./utils/formatters"
import { useReducedMotion } from "@/lib/use-reduced-motion"

vi.mock("@/lib/use-reduced-motion", () => ({
  useReducedMotion: vi.fn(() => false),
}))

let observerCallback: IntersectionObserverCallback | undefined
let observerInstance: IntersectionObserver | undefined

function installObserver() {
  class MockIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      observerCallback = callback
      observerInstance = this as unknown as IntersectionObserver
    }
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
  return { observe: vi.fn() }
}

function enterViewport() {
  const node = document.querySelector(".so4-count-up") as Element
  act(() =>
    observerCallback!(
      [
        {
          isIntersecting: true,
          target: node,
        } as unknown as IntersectionObserverEntry,
      ],
      observerInstance!
    )
  )
}

describe("CountUp", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    installObserver()
    vi.mocked(useReducedMotion).mockReturnValue(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("renders the unavailable placeholder without an animation", () => {
    render(<CountUp value={null} format={shortFormat} />)

    expect(screen.getByText("-")).toBeInTheDocument()
    expect(screen.getByText("Unavailable")).toBeInTheDocument()
    expect(observerCallback).toBeUndefined()
  })

  it("shows the final value immediately under reduced motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true)
    const observe = vi.fn()
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          observerCallback = callback
        }
        observe = observe
        unobserve = vi.fn()
        disconnect = vi.fn()
      }
    )

    render(<CountUp value={1_234} format={shortFormat} />)

    expect(screen.getAllByText("1.2K")).toHaveLength(2)
    expect(observe).not.toHaveBeenCalled()
  })

  it("counts up on first view and ends on the exact value", () => {
    render(<CountUp value={1_234} format={shortFormat} />)

    expect(screen.getByText("0")).toBeInTheDocument()

    enterViewport()
    act(() => vi.advanceTimersByTime(500))

    expect(screen.getAllByText("1.2K")).toHaveLength(2)
  })

  it("exposes the final value once to screen readers", () => {
    render(<CountUp value={5_200_000} format={shortFormat} />)

    const accessible = screen.getByText("5.2M")
    expect(accessible).toHaveClass("sr-only")
    expect(
      document.querySelector('[aria-hidden="true"]')?.textContent
    ).toBe("0")
  })

  it("keeps a tabular figure class on the display", () => {
    render(<CountUp value={42} format={shortFormat} />)

    expect(document.querySelector(".so4-count-up")).toHaveClass(
      "so4-count-up",
      "tabular-nums"
    )
  })
})

describe("easeOutCubic", () => {
  it("starts at 0, settles at 1, and decelerates", () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
  })
})
