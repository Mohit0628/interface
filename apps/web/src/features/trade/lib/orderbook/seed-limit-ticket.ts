/** Only the active market's limit-ticket price may change on a book click.
 * Size, direction, collateral, mode and submission remain user controlled.
 */
export function seedLimitTicketPrice(input: {
  selection: { marketId: string; side: "bid" | "ask"; price: string }
  currentMarketId: string
  tradeMode: "Market" | "Limit" | "Trigger"
  tradeType: "Long" | "Short" | "Swap"
  setTriggerPrice: (price: string) => void
}): boolean {
  const { selection, currentMarketId, tradeMode, tradeType, setTriggerPrice } = input
  if (selection.marketId !== currentMarketId ||
      tradeMode !== "Limit" || tradeType === "Swap" ||
      !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(selection.price) ||
      Number(selection.price) <= 0 || !Number.isFinite(Number(selection.price))) {
    return false
  }
  setTriggerPrice(selection.price)
  return true
}
