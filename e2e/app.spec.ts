import { expect, test } from "@playwright/test"

// Root landing-page smoke test.
// Verifies the Playwright webServer (apps/web dev) boots and the landing page
// renders its core static content without any real network calls.
//
// Prerequisites for local runs outside CI:
//   npx playwright install --with-deps chromium
// (may require sudo depending on your environment)

test("landing page loads with hero content", async ({ page }) => {
  await page.goto("/")

  // The <h1> in the Hero section is always present regardless of wallet state
  const heading = page.getByRole("heading", { level: 1 })
  await expect(heading).toBeVisible()
  // The hero sentence is "Trade <rotating phrase> on verified order book" —
  // the rotating middle is animated, so assert the stable frame around it.
  await expect(heading).toContainText("Trade")
  await expect(heading).toContainText("on verified order book")

  // Primary CTA buttons
  await expect(page.getByRole("button", { name: /start trading/i })).toBeVisible()
  await expect(page.getByRole("button", { name: /read the litepaper/i })).toBeVisible()
})
