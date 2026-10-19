import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

describe("Popover trigger-following motion (OB-016)", () => {
  it("uses the shared CSS transition and preserves the popover transform origin", () => {
    render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent data-testid="popover-content">
          Popover body
        </PopoverContent>
      </Popover>
    )

    const content = screen.getByTestId("popover-content")
    expect(content.className).toContain("origin-(--transform-origin)")
    expect(content.className).toContain("so4-popover-content")
    expect(content).toHaveTextContent("Popover body")

    // Animations migrated to shared CSS; ensure enter/exit and reduced motion
    // are still covered rather than expecting removed Tailwind class names.
    const css = readFileSync("src/styles/globals.css", "utf8")
    expect(css).toContain(".so4-popover-content {")
    expect(css).toContain("transition: opacity var(--duration-base)")
    expect(css).toContain(".so4-popover-content[data-starting-style]")
    expect(css).toContain(".so4-popover-content[data-ending-style]")
    expect(css).toContain(':root[data-reduced-motion="true"] .so4-popover-content')
  })
})
