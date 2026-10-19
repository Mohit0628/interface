import { describe, expect, it } from "vitest"
import { addRoute, createRouter, findRoute } from "rou3"
import {
  formatCacheControl,
  getCacheControlHeader,
  getNitroRouteRules,
} from "./cache-headers"
import type { NitroRouteRule } from "./cache-headers"

describe("cache-headers (OB-125)", () => {
  it("generates immutable asset headers with 1 year max-age", () => {
    const header = getCacheControlHeader("immutable-asset")
    expect(header).toContain("public")
    expect(header).toContain("max-age=31536000")
    expect(header).toContain("immutable")
  })

  it("generates revalidating document headers with max-age=0", () => {
    const header = getCacheControlHeader("revalidating-document")
    expect(header).toContain("public")
    expect(header).toContain("max-age=0")
    expect(header).toContain("must-revalidate")
  })

  it("generates private non-cached headers for sensitive financial data", () => {
    const header = getCacheControlHeader("private-financial")
    expect(header).toContain("private")
    expect(header).toContain("no-store")
    expect(header).toContain("no-cache")
    expect(header).toContain("must-revalidate")
  })

  it("generates short-TTL market feed headers compliant with OB-005", () => {
    const header = getCacheControlHeader("public-market-feed")
    expect(header).toContain("public")
    expect(header).toContain("max-age=1")
    expect(header).toContain("stale-while-revalidate=4")
  })

  it("custom directive formatting respects noStore and scope", () => {
    const formatted = formatCacheControl({
      scope: "private",
      noStore: true,
    })
    expect(formatted).toBe("private, no-store, no-cache, must-revalidate")
  })

  it("generates complete nitro route rules mapping", () => {
    const rules = getNitroRouteRules()
    expect(rules["/assets/**"].headers?.["cache-control"]).toContain("immutable")
    expect(rules["/api/account/**"].headers?.["cache-control"]).toContain("no-store")
    expect(rules["/api/orders/**"].headers?.["cache-control"]).toContain("private")
    expect(rules["/api/markets/**"].headers?.["cache-control"]).toContain("stale-while-revalidate=4")
    expect(rules["/**"].headers?.["cache-control"]).toContain("must-revalidate")
  })

  it("routes hashed .woff2 and .png requests to the immutable asset rule", () => {
    const router = createRouter<NitroRouteRule>()
    for (const [pattern, rule] of Object.entries(getNitroRouteRules())) {
      // rou3 (the router h3 2.x compiles route rules with) throws for patterns
      // it cannot represent, such as the old `/**/*.woff2` extension globs:
      // a route may contain only one wildcard token.
      addRoute(router, "GET", pattern, rule)
    }

    const woff2 = findRoute(router, "GET", "/assets/geist-latin-400-3f2a1b9c.woff2")
    expect(woff2?.data.headers?.["cache-control"]).toContain("max-age=31536000")
    expect(woff2?.data.headers?.["cache-control"]).toContain("immutable")

    const png = findRoute(router, "GET", "/assets/token-icon-77aa10e2.png")
    expect(png?.data.headers?.["cache-control"]).toContain("immutable")
  })

  it("keeps non-hashed public files revalidating instead of immutable", () => {
    const router = createRouter<NitroRouteRule>()
    for (const [pattern, rule] of Object.entries(getNitroRouteRules())) {
      addRoute(router, "GET", pattern, rule)
    }

    // /favicon.ico and friends keep stable URLs, so a year-long immutable
    // cache would pin stale bytes; they must fall through to the document rule.
    const favicon = findRoute(router, "GET", "/favicon.ico")
    expect(favicon?.data.headers?.["cache-control"]).toContain("must-revalidate")
    expect(favicon?.data.headers?.["cache-control"]).not.toContain("immutable")
  })
})
