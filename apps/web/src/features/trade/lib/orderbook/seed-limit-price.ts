import { formatScaled, isValidMetadata } from "./display-prefs"
import type { MarketDisplayMetadata } from "./display-prefs"
import type { BookLevel } from "./book-reducer"
import type { Side } from "./depth"

/**
 * Resolve a displayed depth bucket to the best canonical price inside it.
 * Bucket boundaries are display labels and must never be submitted as prices.
 * Every safety check is repeated at selection time, not just at render time.
 */
export function resolveBookLevelPrice(input: {
  metadata: MarketDisplayMetadata | null
  activeMarketId: string
  side: Side
  rowPrice: bigint
  groupingTick: bigint
  levels: ReadonlyArray<BookLevel>
  feedActionable: boolean
  selectedRevision: bigint | null
  currentRevision: bigint | null
}): string | null {
  const { metadata, activeMarketId, side, rowPrice, groupingTick, levels,
    feedActionable, selectedRevision, currentRevision } = input
  if (!isValidMetadata(metadata) || metadata.marketId !== activeMarketId ||
      !feedActionable || selectedRevision === null || currentRevision === null ||
      selectedRevision !== currentRevision || groupingTick < metadata.tickSize ||
      groupingTick % metadata.tickSize !== 0n || rowPrice <= 0n) {
    return null
  }

  const bucket = (price: bigint) => {
    const remainder = price % groupingTick
    const floor = price - remainder
    return remainder === 0n || side === "bid" ? floor : floor + groupingTick
  }

  const matches = levels
    .filter((level) => level.price > 0n && level.size > 0n &&
      level.price % metadata.tickSize === 0n && bucket(level.price) === rowPrice)
    .map((level) => level.price)
  if (matches.length === 0) return null

  const exact = matches.reduce((best, price) =>
    side === "bid"
      ? (price > best ? price : best)
      : (price < best ? price : best),
  )
  // Input draft values must not contain thousands separators.
  return formatScaled(exact, metadata.priceScale).replaceAll(",", "")
}
