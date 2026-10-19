/**
 * e2e/route-health.spec.ts  (issue #861)
 *
 * Route health browser smoke test:
 * Verifies every route at desktop and mobile viewports starts cleanly from
 * default testnet configuration without console errors, SSR hydration mismatches,
 * same-origin 4xx/5xx responses, or critical accessibility violations.
 */

import { expect, test } from "@playwright/test"
import { existsSync } from "node:fs"
import path from "node:path"
import { stubTradeExternalNetwork } from "./helpers/trade-network"

function resolveAxePath() {
  const candidates = [
    path.join(process.cwd(), "node_modules/axe-core/axe.min.js"),
    path.join(process.cwd(), "apps/web/node_modules/axe-core/axe.min.js"),
    path.join(process.cwd(), "packages/ui/node_modules/axe-core/axe.min.js"),
  ]
  const found = candidates.find((candidate) => existsSync(candidate))
  if (!found) {
    throw new Error(`axe-core not found. Tried:\n${candidates.join("\n")}`)
  }
  return found
}

async function runAxeCritical(page: import("@playwright/test").Page) {
  await page.addScriptTag({ path: resolveAxePath() })
  return page.evaluate(async () => {
    const axe = (
      window as Window & {
        axe?: {
          run: (
            context: Document,
            options: Record<string, unknown>,
          ) => Promise<{ violations: Array<{ impact?: string | null; id: string; help: string }> }>
        }
      }
    ).axe
    if (!axe) return [{ id: "axe-missing", help: "axe-core failed to load", impact: "critical" }]
    const results = await axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
      },
    })
    return results.violations.filter((v) => v.impact === "critical")
  })
}

async function setupExternalStubs(page: import("@playwright/test").Page) {
  await stubTradeExternalNetwork(page)

  // Stub external networks to prevent flaky network dependencies
  await page.route("**/soroban-testnet.stellar.org/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, result: {} }),
    }),
  )
  await page.route("**/horizon-testnet.stellar.org/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    }),
  )
  await page.route("**/arbitrum-api.gmxinfra.io/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    }),
  )
  await page.route("**/hermes.pyth.network/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    }),
  )
}

const ROUTES = [
  "/",
  "/trade",
  "/pools",
  "/earn",
  "/referrals",
  "/faucet",
  "/gallery",
  "/changelog",
  "/design-system",
]

const VIEWPORTS = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 } },
]

for (const { name: viewportName, viewport } of VIEWPORTS) {
  test.describe(`route health smoke test [${viewportName}]`, () => {
    test.use({ viewport })

    for (const route of ROUTES) {
      test(`healthy route: ${route}`, async ({ page }) => {
        const pageErrors: string[] = []
        const consoleErrors: string[] = []
        const hydrationErrors: string[] = []
        const sameOriginFailures: string[] = []

        await setupExternalStubs(page)

        page.on("pageerror", (err) => {
          pageErrors.push(err.message)
        })

        page.on("console", (msg) => {
          const text = msg.text()
          if (msg.type() === "error") {
            const isExternalNetworkFailure =
              text.includes("Failed to load resource") ||
              text.includes("net::ERR_") ||
              text.includes("FetchError") ||
              text.includes("stellar.org") ||
              text.includes("binance.com") ||
              text.includes("pyth.network") ||
              text.includes("gmxinfra.io")

            if (!isExternalNetworkFailure) {
              consoleErrors.push(text)
            }
          }

          if (
            text.includes("Switched to client rendering") ||
            text.includes("Hydration failed") ||
            text.includes("hydration failure") ||
            text.includes("Text content did not match")
          ) {
            hydrationErrors.push(text)
          }
        })

        page.on("response", (resp) => {
          try {
            const url = new URL(resp.url())
            const pageUrl = new URL(page.url())
            if (url.origin === pageUrl.origin && resp.status() >= 400) {
              sameOriginFailures.push(`${resp.status()} ${resp.url()}`)
            }
          } catch {
            // URL parse errors ignored
          }
        })

        const response = await page.goto(route, { waitUntil: "domcontentloaded" })
        expect(response?.status(), `HTTP 200 on ${route}`).toBe(200)

        await page.waitForLoadState("load")

        expect(pageErrors, `Page errors on ${route}`).toEqual([])
        expect(consoleErrors, `Console errors on ${route}`).toEqual([])
        expect(hydrationErrors, `Hydration errors on ${route}`).toEqual([])
        expect(sameOriginFailures, `Same-origin HTTP errors on ${route}`).toEqual([])

        const criticalAxeViolations = await runAxeCritical(page)
        expect(
          criticalAxeViolations,
          `Critical accessibility violations on ${route}: ${JSON.stringify(criticalAxeViolations)}`,
        ).toEqual([])
      })
    }
  })
}

test.describe("unknown route handling", () => {
  test("renders 404 for unknown route", async ({ page }) => {
    await setupExternalStubs(page)
    const response = await page.goto("/non-existent-smoke-test-route", {
      waitUntil: "domcontentloaded",
    })

    if (response?.status() === 404) {
      expect(response.status()).toBe(404)
    } else {
      // TanStack Router rendered not-found component
      await expect(page.getByText("404")).toBeVisible()
      await expect(page.getByText(/page could not be found/i)).toBeVisible()
    }
  })
})
