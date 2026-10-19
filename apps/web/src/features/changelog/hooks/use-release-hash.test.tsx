import { afterEach, describe, expect, it, vi } from "vitest"
import { render } from "@testing-library/react"
import { useReleaseHash } from "./use-release-hash"

function TestRelease({ ready = true }: { ready?: boolean }) {
  useReleaseHash(ready)
  return <section id="v0-4-0" tabIndex={-1} />
}

afterEach(() => {
  window.history.replaceState(null, "", "/")
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("useReleaseHash", () => {
  it("scrolls to and focuses a direct release hash", () => {
    window.history.replaceState(null, "", "/changelog#v0-4-0")
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    // jsdom does not implement matchMedia, so stub it rather than spy on it.
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: false }),
    )

    const { container } = render(<TestRelease />)
    const release = container.querySelector("#v0-4-0")

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    })
    expect(release).toHaveFocus()
  })

  it("uses instant scrolling when reduced motion is preferred", () => {
    window.history.replaceState(null, "", "/changelog#v0-4-0")
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    // jsdom does not implement matchMedia, so stub it rather than spy on it.
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true }),
    )

    render(<TestRelease />)

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    })
  })

  it.each(["#not-a-version", "#v9-9-9"])(
    "ignores unknown or malformed hash %s",
    (hash) => {
      window.history.replaceState(null, "", `/changelog${hash}`)
      const scrollIntoView = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoView
      const consoleError = vi.spyOn(console, "error")

      render(<TestRelease />)

      expect(scrollIntoView).not.toHaveBeenCalled()
      expect(consoleError).not.toHaveBeenCalled()
    }
  )
})
