import { describe, expect, it, vi } from "vitest"
import { seedLimitTicketPrice } from "./seed-limit-ticket"

const selection = { marketId: "BTC", side: "bid" as const, price: "100.07" }
describe("seedLimitTicketPrice (#707)", () => {
  it("updates only the limit price for the active market", () => {
    const setTriggerPrice = vi.fn()
    expect(seedLimitTicketPrice({ selection, currentMarketId: "BTC",
      tradeMode: "Limit", tradeType: "Long", setTriggerPrice })).toBe(true)
    expect(setTriggerPrice).toHaveBeenCalledExactlyOnceWith("100.07")
  })
  it.each([
    { currentMarketId: "ETH", tradeMode: "Limit" as const, tradeType: "Long" as const },
    { currentMarketId: "BTC", tradeMode: "Market" as const, tradeType: "Long" as const },
    { currentMarketId: "BTC", tradeMode: "Limit" as const, tradeType: "Swap" as const },
  ])("rejects incompatible market or ticket mode %#", ({ currentMarketId, tradeMode, tradeType }) => {
    const setTriggerPrice = vi.fn()
    expect(seedLimitTicketPrice({ selection, currentMarketId, tradeMode,
      tradeType, setTriggerPrice })).toBe(false)
    expect(setTriggerPrice).not.toHaveBeenCalled()
  })
  it("rejects invalid numeric input", () => {
    const setTriggerPrice = vi.fn()
    expect(seedLimitTicketPrice({ selection: { ...selection, price: "0" },
      currentMarketId: "BTC", tradeMode: "Limit", tradeType: "Long", setTriggerPrice })).toBe(false)
  })
})
