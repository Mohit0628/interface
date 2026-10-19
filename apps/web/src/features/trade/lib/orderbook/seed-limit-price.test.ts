import { describe, expect, it } from "vitest"
import { resolveBookLevelPrice } from "./seed-limit-price"
import type { MarketDisplayMetadata } from "./display-prefs"

const metadata: MarketDisplayMetadata = {
  marketId: "BTC-USD", baseSymbol: "BTC", quoteSymbol: "USD",
  priceScale: 2, sizeScale: 4, tickSize: 1n,
}
const levels = [
  { price: 10007n, size: 10n },
  { price: 10005n, size: 20n },
  { price: 10010n, size: 30n },
]
const selection = {
  metadata, activeMarketId: "BTC-USD", side: "bid" as const,
  rowPrice: 10005n, groupingTick: 5n, levels,
  feedActionable: true, selectedRevision: 42n, currentRevision: 42n,
}

describe("exact limit-price seeding (OB-055)", () => {
  it("selects a real tick rather than the grouped label", () => {
    expect(resolveBookLevelPrice(selection)).toBe("100.07")
    expect(resolveBookLevelPrice({ ...selection, side: "ask", rowPrice: 10010n })).toBe("100.10")
  })
  it("never seeds the wrong market or stale revision", () => {
    expect(resolveBookLevelPrice({ ...selection, activeMarketId: "ETH-USD" })).toBeNull()
    expect(resolveBookLevelPrice({ ...selection, selectedRevision: 41n })).toBeNull()
    expect(resolveBookLevelPrice({ ...selection, feedActionable: false })).toBeNull()
  })
  it("rejects missing, zero-size and invalid tick levels", () => {
    expect(resolveBookLevelPrice({ ...selection, rowPrice: 9900n })).toBeNull()
    expect(resolveBookLevelPrice({ ...selection, levels: [{ price: 10007n, size: 0n }] })).toBeNull()
    expect(resolveBookLevelPrice({ ...selection, groupingTick: 0n })).toBeNull()
    expect(resolveBookLevelPrice({ ...selection, metadata: { ...metadata, tickSize: 10n } })).toBeNull()
  })
  it("never mutates canonical levels or changes the selected side", () => {
    const frozen = Object.freeze(levels.map((level) => Object.freeze({ ...level })))
    expect(resolveBookLevelPrice({ ...selection, levels: frozen })).toBe("100.07")
    expect(frozen).toEqual(levels)
  })
})
