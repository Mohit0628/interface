import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

// DS-047: visual regression coverage for the component gallery and main
// routes, across both themes and desktop/mobile widths.
//
// Stabilization strategy:
// - Theme is set via an init script (before any page script runs), matching
//   the app's own THEME_SCRIPT approach in __root.tsx — avoids a flash of
//   the wrong theme landing in the screenshot.
// - Third-party/network data sources (Binance REST/WS, the oracle proxy)
//   are stubbed with empty-but-valid responses, the same pattern used by
//   e2e/trade.spec.ts and e2e/pools.spec.ts — the app already falls back
//   gracefully to empty/static data when these are unavailable.
// - `animations: "disabled"` on every toHaveScreenshot() call freezes CSS
//   transitions/animations at their end state, so timing never causes a
//   flaky diff.
// - `waitForLoadState("networkidle")` before each screenshot gives any
//   remaining async rendering (e.g. faucet's background balance fetch,
//   which faucet.spec.ts notes loads after first paint) time to settle.
//
// Updating baselines: see the "Visual regression" section in DESIGN.md —
// short version, run
//   bun run test:e2e -- design-system-visual --update-snapshots
// and review the resulting diff under
// e2e/design-system-visual.spec.ts-snapshots/ in your PR.

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 }, // iPhone 13-ish
} as const

const THEMES = ["light", "dark"] as const
const DIRECTIONS = ["ltr", "rtl"] as const

// `ready` is what proves the route has painted real content. The trade
// workspace has no <h1> (its heading lives in the navbar), so it waits on the
// ticket's tablist instead of a heading.
const ROUTES = [
  { name: "gallery", path: "/gallery", ready: "h1" },
  { name: "landing", path: "/", ready: "h1" },
  { name: "trade", path: "/trade", ready: '[data-slot="app-shell-content"]' },
  { name: "pools", path: "/pools", ready: "h1" },
  { name: "earn", path: "/earn", ready: "h1" },
  { name: "referrals", path: "/referrals", ready: "h1" },
  { name: "faucet", path: "/faucet", ready: "h1" },
] as const

async function stubExternalNetwork(page: Page) {
  await page.route("**/api.binance.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  )
  // Same "close immediately" approach as trade.spec.ts — the app already
  // falls back to REST polling when no live-bar message ever arrives.
  await page.routeWebSocket("wss://stream.binance.com:9443/**", (ws) => {
    ws.close()
  })
}

for (const theme of THEMES) {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`${theme} theme, ${viewportName}`, () => {
      // reducedMotion: "reduce" is the semantically correct setting for the
      // timer-driven animations `animations: "disabled"` can't freeze (the
      // landing hero's word rotation, the community marquee). The fake clock
      // this spec used to install for that is gone: it froze time for the
      // whole page, so every data-backed route stayed on its loading spinner.
      test.use({ viewport, reducedMotion: "reduce" })

      test.beforeEach(async ({ page }) => {
        await stubExternalNetwork(page)
        await page.addInitScript((t) => {
          window.localStorage.setItem("so4-theme", t)
        }, theme)
      })

      for (const route of ROUTES) {
        test(`${route.name}`, async ({ page }) => {
          await page.goto(route.path)
          await page.waitForLoadState("networkidle")
          // Data-backed routes render a spinner until their query resolves, so
          // wait for the route's own content before capturing.
          await expect(page.locator(route.ready).first()).toBeVisible()

          await expect(page).toHaveScreenshot(`${route.name}-${theme}-${viewportName}.png`, {
            fullPage: true,
            animations: "disabled",
          })
        })
      }
    })
  }
}

// RTL gallery fixtures — the gallery has a direction toggle, so take
// screenshots in both directions to verify RTL layout correctness.
for (const theme of THEMES) {
  for (const direction of DIRECTIONS) {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      test.describe(`${theme} theme, ${direction}, ${viewportName}`, () => {
        test.use({ viewport, reducedMotion: "reduce" })

        test.beforeEach(async ({ page }) => {
          await stubExternalNetwork(page)
          await page.addInitScript(({ t, d }: { t: string; d: string }) => {
            window.localStorage.setItem("so4-theme", t)
            window.localStorage.setItem("so4-direction", d)
          }, { t: theme, d: direction })
        })

        test(`gallery`, async ({ page }) => {
          await page.goto("/gallery")
          await page.waitForLoadState("networkidle")

          await expect(page).toHaveScreenshot(`gallery-${theme}-${direction}-${viewportName}.png`, {
            fullPage: true,
            animations: "disabled",
          })
        })
      })
    }
  }
}
