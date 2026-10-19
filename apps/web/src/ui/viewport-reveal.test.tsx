import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"

import { ViewportReveal } from "./viewport-reveal"
import { supportsViewTimeline } from "@/lib/supports-view-timeline"
import { useReducedMotion } from "@/lib/use-reduced-motion"

vi.mock("@/lib/supports-view-timeline", () => ({
  supportsViewTimeline: vi.fn(() => false),
}))

vi.mock("@/lib/use-reduced-motion", () => ({
  useReducedMotion: vi.fn(() => false),
}))

let observerCallback: IntersectionObserverCallback
let observerInstance: IntersectionObserver

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
}

function revealTarget() {
  return screen.getByText("Test content").parentElement as HTMLElement
}

describe("ViewportReveal", () => {
  beforeEach(() => {
    installObserver()
    vi.mocked(useReducedMotion).mockReturnValue(false)
    vi.mocked(supportsViewTimeline).mockReturnValue(false)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("renders children", () => {
    render(
      <ViewportReveal>
        <div>Test content</div>
      </ViewportReveal>
    )

    expect(screen.getByText("Test content")).toBeInTheDocument()
  })

  it("uses the observer fallback and reveals after intersection", () => {
    render(
      <ViewportReveal>
        <div>Test content</div>
      </ViewportReveal>
    )

    const wrapper = revealTarget()
    expect(wrapper).toHaveAttribute("data-reveal-mode", "fallback")
    expect(wrapper).toHaveAttribute("data-revealed", "false")

    act(() =>
      observerCallback(
        [
          {
            isIntersecting: true,
            target: wrapper,
          } as unknown as IntersectionObserverEntry,
        ],
        observerInstance
      )
    )

    expect(wrapper).toHaveAttribute("data-revealed", "true")
  })

  it("uses the CSS view timeline when supported", () => {
    vi.mocked(supportsViewTimeline).mockReturnValue(true)
    const observe = vi.fn()
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe = observe
        unobserve = vi.fn()
        disconnect = vi.fn()
      }
    )

    render(
      <ViewportReveal>
        <div>Test content</div>
      </ViewportReveal>
    )

    expect(revealTarget()).toHaveAttribute("data-reveal-mode", "css")
    expect(observe).not.toHaveBeenCalled()
  })

  it("shows content immediately when reduced motion is enabled", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true)

    render(
      <ViewportReveal>
        <div>Test content</div>
      </ViewportReveal>
    )

    const wrapper = revealTarget()
    expect(wrapper).toHaveAttribute("data-reveal-mode", "reduced")
    expect(wrapper).toHaveAttribute("data-revealed", "true")
  })

  it("applies a custom reveal class once visible", () => {
    render(
      <ViewportReveal revealClass="custom-revealed">
        <div>Test content</div>
      </ViewportReveal>
    )

    const wrapper = revealTarget()
    expect(wrapper).not.toHaveClass("custom-revealed")

    act(() =>
      observerCallback(
        [
          {
            isIntersecting: true,
            target: wrapper,
          } as unknown as IntersectionObserverEntry,
        ],
        observerInstance
      )
    )

    expect(wrapper).toHaveClass("custom-revealed")
  })

  it("applies a custom className to the wrapper", () => {
    render(
      <ViewportReveal className="custom-class">
        <div>Test content</div>
      </ViewportReveal>
    )

    expect(revealTarget()).toHaveClass("custom-class")
  })
})
