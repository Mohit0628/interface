import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render } from "@testing-library/react"

import { useViewportReveal } from "./use-viewport-reveal"

type Options = Parameters<typeof useViewportReveal>[0]

function Harness({ options }: { options?: Options }) {
  const ref = useViewportReveal(options)
  return <div ref={ref} data-testid="reveal-target" />
}

function renderReveal(options?: Options) {
  return render(<Harness options={options} />)
}

let observerCallback: IntersectionObserverCallback
let observerInstance: IntersectionObserver
let observerOptions: IntersectionObserverInit | undefined

function installObserver() {
  const observe = vi.fn()
  const unobserve = vi.fn()
  const disconnect = vi.fn()

  class MockIntersectionObserver {
    constructor(
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ) {
      observerCallback = callback
      observerOptions = options
      observerInstance = this as unknown as IntersectionObserver
    }
    observe = observe
    unobserve = unobserve
    disconnect = disconnect
  }

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
  return { observe, unobserve, disconnect }
}

function entry(isIntersecting: boolean): IntersectionObserverEntry {
  return {
    isIntersecting,
    target: document.createElement("div"),
  } as unknown as IntersectionObserverEntry
}

describe("useViewportReveal", () => {
  beforeEach(() => {
    installObserver()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("observes the mounted element", () => {
    const { observe } = installObserver()
    renderReveal()

    expect(observe).toHaveBeenCalledWith(screenTarget())
  })

  it("calls onReveal callback when element enters viewport", () => {
    const onReveal = vi.fn()
    renderReveal({ onReveal })

    act(() => observerCallback([entry(true)], observerInstance))

    expect(onReveal).toHaveBeenCalledOnce()
  })

  it("respects once option - only triggers once", () => {
    const onReveal = vi.fn()
    renderReveal({ once: true, onReveal })

    act(() => {
      observerCallback([entry(true)], observerInstance)
      observerCallback([entry(true)], observerInstance)
    })

    expect(onReveal).toHaveBeenCalledOnce()
  })

  it("triggers on each intersection when once is false", () => {
    const onReveal = vi.fn()
    renderReveal({ once: false, onReveal })

    act(() => {
      observerCallback([entry(true)], observerInstance)
      observerCallback([entry(true)], observerInstance)
    })

    expect(onReveal).toHaveBeenCalledTimes(2)
  })

  it("does not trigger when element is not intersecting", () => {
    const onReveal = vi.fn()
    renderReveal({ onReveal })

    act(() => observerCallback([entry(false)], observerInstance))

    expect(onReveal).not.toHaveBeenCalled()
  })

  it("passes the configured threshold to IntersectionObserver", () => {
    renderReveal({ threshold: 0.5 })

    expect(observerOptions).toEqual(expect.objectContaining({ threshold: 0.5 }))
  })

  it("does not observe when disabled", () => {
    const { observe } = installObserver()
    renderReveal({ enabled: false })

    expect(observe).not.toHaveBeenCalled()
  })

  it("disconnects observer on unmount", () => {
    const { disconnect } = installObserver()
    const { unmount } = renderReveal()

    unmount()

    expect(disconnect).toHaveBeenCalled()
  })
})

function screenTarget(): Element {
  return document.querySelector('[data-testid="reveal-target"]') as Element
}
