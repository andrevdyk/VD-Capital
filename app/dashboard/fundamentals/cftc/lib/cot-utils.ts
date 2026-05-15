// ── Symbol mapping ────────────────────────────────────────────────────────────
// Maps CFTC contract_market_name → Twelve Data symbol
// `inverted` = true means COT "long" = bullish USD (e.g. short JPY = long USD/JPY)

export interface SymbolInfo {
  symbol: string   // Twelve Data symbol
  label: string    // Display label
  inverted: boolean // If true, COT long = bearish on this FX pair
}

export const CFTC_TO_SYMBOL: Record<string, SymbolInfo> = {
  // Major FX
  "EURO FX":                        { symbol: "EUR/USD",  label: "EUR/USD",  inverted: false },
  "BRITISH POUND":                  { symbol: "GBP/USD",  label: "GBP/USD",  inverted: false },
  "JAPANESE YEN":                   { symbol: "USD/JPY",  label: "USD/JPY",  inverted: true  },
  "SWISS FRANC":                    { symbol: "USD/CHF",  label: "USD/CHF",  inverted: true  },
  "CANADIAN DOLLAR":                { symbol: "USD/CAD",  label: "USD/CAD",  inverted: true  },
  "AUSTRALIAN DOLLAR":              { symbol: "AUD/USD",  label: "AUD/USD",  inverted: false },
  "NZ DOLLAR":                      { symbol: "NZD/USD",  label: "NZD/USD",  inverted: false },

  // EM FX
  "MEXICAN PESO":                   { symbol: "USD/MXN",  label: "USD/MXN",  inverted: true  },
  "BRAZILIAN REAL":                 { symbol: "USD/BRL",  label: "USD/BRL",  inverted: true  },
  "SO AFRICAN RAND":                { symbol: "USD/ZAR",  label: "USD/ZAR",  inverted: true  },
  "RUSSIAN RUBLE":                  { symbol: "USD/RUB",  label: "USD/RUB",  inverted: true  },

  // Cross rates
  "EURO FX/BRITISH POUND XRATE":    { symbol: "EUR/GBP",  label: "EUR/GBP",  inverted: false },
  "EURO FX/JAPANESE YEN XRATE":     { symbol: "EUR/JPY",  label: "EUR/JPY",  inverted: false },
  "EURO FX/SWISS FRANC XRATE":      { symbol: "EUR/CHF",  label: "EUR/CHF",  inverted: false },
  "EURO FX/SWEDISH KRONA XRATE":    { symbol: "EUR/SEK",  label: "EUR/SEK",  inverted: false },
  "EURO FX/NORWEGIAN KRONE XRATE":  { symbol: "EUR/NOK",  label: "EUR/NOK",  inverted: false },
  "BRITISH POUND/JAPANESE YEN XRATE": { symbol: "GBP/JPY", label: "GBP/JPY", inverted: false },

  // Financial
  "USD INDEX":                      { symbol: "DXY",      label: "USD Index", inverted: false },
  "VIX FUTURES":                    { symbol: "VIX",      label: "VIX",       inverted: false },

  // Crypto
  "BITCOIN":                        { symbol: "BTC/USD",  label: "BTC/USD",  inverted: false },
  "ETHEREUM":                       { symbol: "ETH/USD",  label: "ETH/USD",  inverted: false },
}

// ── Cross-rate helpers ────────────────────────────────────────────────────────

/**
 * Returns the "own" currency for a COT asset.
 * e.g.  AUD/USD (inverted=false) → AUD
 *       USD/CHF (inverted=true)  → CHF
 */
export function getBaseCurrency(info: SymbolInfo): string {
  const [base, quote] = info.symbol.split("/")
  return info.inverted ? quote : base
}

// FX hierarchy used to determine which currency goes on the left in a cross
const CCY_PRIORITY = ["GBP", "EUR", "AUD", "NZD", "USD", "CAD", "CHF", "JPY",
                      "MXN", "BRL", "ZAR", "RUB", "BTC", "ETH"]

/**
 * Returns the most natural cross-rate symbol for two assets, e.g.
 *   CHF + AUD  →  "AUD/CHF"
 *   CHF + GBP  →  "GBP/CHF"
 * Returns null if currencies are the same or unknown.
 */
export function getCrossRateSymbol(assetInfo: SymbolInfo, pairInfo: SymbolInfo): string | null {
  const aCcy = getBaseCurrency(assetInfo)
  const pCcy = getBaseCurrency(pairInfo)
  if (aCcy === pCcy) return null
  const aIdx = CCY_PRIORITY.indexOf(aCcy)
  const pIdx = CCY_PRIORITY.indexOf(pCcy)
  if (aIdx === -1 || pIdx === -1) return null
  return pIdx < aIdx ? `${pCcy}/${aCcy}` : `${aCcy}/${pCcy}`
}

export function getSymbolInfo(cftcName: string): SymbolInfo | null {
  // Exact match first
  if (CFTC_TO_SYMBOL[cftcName]) return CFTC_TO_SYMBOL[cftcName]
  // Case-insensitive fallback
  const key = Object.keys(CFTC_TO_SYMBOL).find(
    (k) => k.toLowerCase() === cftcName.toLowerCase()
  )
  return key ? CFTC_TO_SYMBOL[key] : null
}

// ── COT Index ─────────────────────────────────────────────────────────────────
// Classic formula: (current - period_min) / (period_max - period_min) * 100
// Uses lev money net positions over the full available history window.

export function computeCOTIndex(historicalData: any[], asset: string): number | null {
  const series = historicalData
    .filter((d) => d.asset === asset && typeof d.levMoneyNet === "number")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (series.length < 4) return null

  const values = series.map((d) => d.levMoneyNet as number)
  const current = values[values.length - 1]
  const min = Math.min(...values)
  const max = Math.max(...values)

  if (max === min) return 50
  return Math.round(((current - min) / (max - min)) * 100)
}

export interface COTIndexInfo {
  label: string
  shortLabel: string
  textColor: string
  barColor: string
  bgColor: string
}

export function cotIndexInfo(index: number): COTIndexInfo {
  if (index >= 80) return { label: "Extreme Long",  shortLabel: "Ext Long",  textColor: "text-[#03b198]", barColor: "#03b198", bgColor: "bg-[#03b198]/10" }
  if (index >= 60) return { label: "Bullish",        shortLabel: "Bullish",   textColor: "text-[#03b198]", barColor: "#03b198", bgColor: "bg-[#03b198]/10" }
  if (index >= 40) return { label: "Neutral",        shortLabel: "Neutral",   textColor: "text-muted-foreground", barColor: "#8b5cf6", bgColor: "bg-muted" }
  if (index >= 20) return { label: "Bearish",        shortLabel: "Bearish",   textColor: "text-[#ff2f67]", barColor: "#ff2f67", bgColor: "bg-[#ff2f67]/10" }
  return               { label: "Extreme Short", shortLabel: "Ext Short", textColor: "text-[#ff2f67]", barColor: "#ff2f67", bgColor: "bg-[#ff2f67]/10" }
}

// ── Price helpers ─────────────────────────────────────────────────────────────

/** Given daily price candles + COT weekly history, produce merged series aligned on COT dates */
export function mergePriceAndCOT(
  cotHistory: Array<{ date: string; lev_money_net: number }>,
  priceCandles: Array<{ time: string; close: number }>
): Array<{ date: string; price: number; levMoneyNet: number }> {
  if (!priceCandles.length || !cotHistory.length) return []

  return cotHistory
    .map((cot) => {
      const cotMs = new Date(cot.date).getTime()
      // Find closest price candle (within ±4 days)
      let best: { time: string; close: number } | null = null
      let bestDiff = Infinity
      for (const c of priceCandles) {
        const diff = Math.abs(new Date(c.time).getTime() - cotMs)
        if (diff < bestDiff) { bestDiff = diff; best = c }
      }
      if (!best || bestDiff > 4 * 86400 * 1000) return null
      return { date: cot.date, price: best.close, levMoneyNet: cot.lev_money_net }
    })
    .filter(Boolean) as Array<{ date: string; price: number; levMoneyNet: number }>
}

/** Compute % change between first and last close */
export function priceChange(candles: Array<{ close: number }>): number {
  if (candles.length < 2) return 0
  const first = candles[0].close
  const last = candles[candles.length - 1].close
  return ((last - first) / first) * 100
}
