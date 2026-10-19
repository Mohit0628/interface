import { useOrderBook } from "../../hooks/useOrderBook"
import { useSourceFreshness } from "../../hooks/useSourceFreshness"
import { useChartPreferencesStore } from "../../store/chart-preferences-store"
import { SourceHealthBadge } from "./SourceHealthBadge"
import { RecentTradesTape } from "./RecentTradesTape"
import { DepthChart } from "./DepthChart"
import { DepthPanel } from "./DepthPanel"
import type { BookLevel } from "../../lib/orderbook/book-reducer"
import type { MarketDisplayMetadata } from "../../lib/orderbook/display-prefs"
import type { SourceHealth } from "../../hooks/useSourceHealth"


export type VerifiedDepth = {
  metadata: MarketDisplayMetadata
  bids: ReadonlyArray<BookLevel>
  asks: ReadonlyArray<BookLevel>
  revision: bigint
  rows: number
  health: SourceHealth
  actionable: boolean
}

type Props = {
  symbol: string | undefined
  /** Only authoritative venue depth may populate this; oracle/chart data cannot. */
  verifiedDepth?: VerifiedDepth
  activeMarketId?: string
  onSeedLimitPrice?: (selection: { marketId: string; side: "bid" | "ask"; price: string }) => void
}

export function OrderBookPanel({ symbol, verifiedDepth, activeMarketId, onSeedLimitPrice }: Props) {
  const orderbookView = useChartPreferencesStore((s) => s.orderbookView)
  const setOrderbookView = useChartPreferencesStore((s) => s.setOrderbookView)
  const { bids, asks, status, isLoading } = useOrderBook(symbol)
  const source = useSourceFreshness(symbol)

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* ── Panel Header Tabs ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOrderbookView("book")}
            className={`rounded px-2 py-1 font-mono text-xs font-semibold transition-colors ${
              orderbookView === "book"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-selected={orderbookView === "book"}
            role="tab"
          >
            Order Book
          </button>
          <button
            type="button"
            onClick={() => setOrderbookView("trades")}
            className={`rounded px-2 py-1 font-mono text-xs font-semibold transition-colors ${
              orderbookView === "trades"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-selected={orderbookView === "trades"}
            role="tab"
          >
            Trades
          </button>
          <button
            type="button"
            onClick={() => setOrderbookView("chart")}
            className={`rounded px-2 py-1 font-mono text-xs font-semibold transition-colors ${
              orderbookView === "chart"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-selected={orderbookView === "chart"}
            role="tab"
          >
            Depth Chart
          </button>
        </div>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          Reference Data
          {source ? <SourceHealthBadge health={source.health} /> : null}
        </span>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1">
        {orderbookView === "book" ? (
          verifiedDepth && verifiedDepth.actionable && verifiedDepth.health.isExecutable &&
          activeMarketId === verifiedDepth.metadata.marketId ? (
            <DepthPanel metadata={verifiedDepth.metadata} bids={verifiedDepth.bids}
              asks={verifiedDepth.asks} rows={verifiedDepth.rows} health={verifiedDepth.health}
              bookRevision={verifiedDepth.revision} feedActionable={verifiedDepth.actionable}
              activeMarketId={activeMarketId} onSeedLimitPrice={onSeedLimitPrice} />
          ) : (
            <div className="flex flex-1 items-center justify-center p-4 text-center text-xs text-muted-foreground h-full">
              Executable order-book depth is unavailable until a verified matching source is connected.
            </div>
          )
        ) : orderbookView === "trades" ? (
          <RecentTradesTape symbol={symbol} />
        ) : (
          <DepthChart symbol={symbol} bids={bids} asks={asks} isLoading={isLoading} status={status} />
        )}
      </div>
    </div>
  )
}
