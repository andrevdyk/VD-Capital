"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, TrendingUp, TrendingDown, Scale, Zap, BarChart2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  Label,
  ReferenceLine,
} from "recharts"
import {
  computeCOTIndex,
  cotIndexInfo,
  getSymbolInfo,
  getCrossRateSymbol,
  priceChange,
} from "../lib/cot-utils"

interface AssetDetailProps {
  asset: string
  assetData: any
  allAssetsData: any[]
  historicalData: any[]
  availableAssets: string[]
  loading: boolean
  onBack: () => void
  onChangeAsset: (asset: string) => void
}

const BULL = "#03b198"
const BEAR = "#ff2f67"
const CHART_COLORS = { dealer: "#03b198", assetMgr: "#ff2f67", levMoney: "#f59e0b" }

const getPieData = (longVal: number, shortVal: number) => [
  { name: "Long",  value: longVal,  fill: BULL },
  { name: "Short", value: shortVal, fill: BEAR },
]

const getNetPct = (l: number, s: number) => {
  const t = l + s
  return t === 0 ? 0 : Math.round(((l - s) / t) * 100)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-2 shadow-lg text-xs space-y-0.5">
        {label && <p className="text-muted-foreground mb-1">{label}</p>}
        {payload.map((e: any, i: number) => (
          <p key={i} style={{ color: e.color ?? e.stroke }}>
            {e.name}:{" "}
            {typeof e.value === "number"
              ? e.value > 1000 || e.value < -1000
                ? e.value.toLocaleString()
                : e.value.toFixed(5)
              : e.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// ── Candlestick chart shapes ──────────────────────────────────────────────────

/** Invisible spacer that lifts the stack to the candle low */
const LowSpacerShape = () => <g />

/** Thin 1 px wick (lower or upper) centered on bar */
const WickShape = (props: any) => {
  const { x, y, width, height, payload } = props
  if (!height || height <= 0) return <g />
  const color = payload?.isUp ? BULL : BEAR
  const cx = Math.round(x + width / 2)
  return <rect x={cx - 0.5} y={y} width={1} height={height} fill={color} />
}

/** Full-width candle body */
const BodyShape = (props: any) => {
  const { x, y, width, height, payload } = props
  const h = Math.max(height ?? 0, 1)
  if (!h) return <g />
  const color = payload?.isUp ? BULL : BEAR
  return (
    <rect
      x={x + 1}
      y={y}
      width={Math.max((width ?? 4) - 2, 1)}
      height={h}
      fill={color}
      fillOpacity={0.85}
    />
  )
}

/** OHLC tooltip for candlestick chart */
const CandleTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  const fmt = (v: number) =>
    v > 1000 ? v.toFixed(2) : v > 100 ? v.toFixed(3) : v > 10 ? v.toFixed(4) : v.toFixed(5)
  return (
    <div className="bg-background border border-border rounded-lg p-2 shadow-lg text-xs space-y-0.5 min-w-[120px]">
      <p className="text-muted-foreground font-mono mb-1">{d.date}</p>
      <p className="text-foreground">
        O: <span className="font-mono">{fmt(d.open)}</span>
      </p>
      <p className="text-[#03b198]">
        H: <span className="font-mono">{fmt(d.high)}</span>
      </p>
      <p className="text-[#ff2f67]">
        L: <span className="font-mono">{fmt(d.low)}</span>
      </p>
      <p className={d.isUp ? "text-[#03b198]" : "text-[#ff2f67]"}>
        C: <span className="font-mono">{fmt(d.close)}</span>
      </p>
    </div>
  )
}

// ── Tiny sparkline — its own component so it has its own hook scope ──────────
function PriceSparkline({ candles, isPositive }: { candles: any[]; isPositive: boolean }) {
  const data = candles.slice(-52).map((c: any) => ({ price: c.close }))
  // unique gradient id per direction to avoid SVG id collision
  const gradId = `sg_${isPositive ? "up" : "dn"}`
  return (
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={isPositive ? BULL : BEAR} stopOpacity={0.4} />
            <stop offset="95%" stopColor={isPositive ? BULL : BEAR} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="price"
          stroke={isPositive ? BULL : BEAR}
          strokeWidth={1.5}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export function AssetDetail({
  asset,
  assetData,
  allAssetsData,
  historicalData,
  availableAssets,
  loading,
  onBack,
  onChangeAsset,
}: AssetDetailProps) {

  // ── ALL HOOKS FIRST — no early returns above this block ───────

  // Price / UI state
  const [priceCandles,   setPriceCandles]   = useState<any[]>([])
  const [pairCandles,    setPairCandles]    = useState<Record<string, any[]>>({})
  const [priceLoading,   setPriceLoading]   = useState(false)
  const [priceError,     setPriceError]     = useState<string | null>(null)
  const [priceTimeframe, setPriceTimeframe] = useState<"3M" | "6M" | "1Y">("1Y")

  // Pull out latest/history safely — assetData may be null while loading
  const latest  = assetData?.latest  ?? null
  const history: any[] = assetData?.history ?? []

  // Symbol / COT index — safe even if asset changes mid-render
  const symbolInfo = useMemo(() => getSymbolInfo(asset), [asset])
  const cotIdx     = useMemo(() => computeCOTIndex(historicalData, asset), [historicalData, asset])
  const cotInfo    = useMemo(() => cotIdx !== null ? cotIndexInfo(cotIdx) : null, [cotIdx])

  // Cross-rate symbol for main chart (selected asset vs #1 pair candidate)
  // e.g. Swiss Franc (USD/CHF) + AUD (#1 pair) → "AUD/CHF"
  const mainChartInfo = useMemo(() => {
    if (!symbolInfo) return null
    const pair0 = allAssetsData
      .filter((a) => a.asset !== asset)
      .filter((a) => {
        const sNet = (latest?.lev_money_long ?? 0) - (latest?.lev_money_short ?? 0)
        return sNet > 0 ? a.levMoneyNet < 0 : sNet < 0 ? a.levMoneyNet > 0 : false
      })
      .sort((a, b) => a.levMoneyNet * ((latest?.lev_money_long ?? 0) - (latest?.lev_money_short ?? 0)) - b.levMoneyNet * ((latest?.lev_money_long ?? 0) - (latest?.lev_money_short ?? 0)))[0]

    if (!pair0) return symbolInfo
    const pairInfo = getSymbolInfo(pair0.asset)
    if (!pairInfo) return symbolInfo
    const cross = getCrossRateSymbol(symbolInfo, pairInfo)
    if (!cross) return symbolInfo
    return { symbol: cross, label: cross, inverted: false } as typeof symbolInfo
  }, [symbolInfo, allAssetsData, asset, latest?.lev_money_long, latest?.lev_money_short])

  // Derived position values (safe when latest is null)
  const selectedLevNet   = latest ? latest.lev_money_long - latest.lev_money_short : 0
  const selectedLevTotal = latest ? latest.lev_money_long + latest.lev_money_short : 0
  const selLevPct = selectedLevTotal > 0
    ? ((selectedLevNet / selectedLevTotal) * 100).toFixed(1)
    : "0"

  // Top 3 pairs
  const topPairs = useMemo(() => {
    if (!latest) return []
    return allAssetsData
      .filter((a) => a.asset !== asset)
      .filter((a) =>
        selectedLevNet > 0 ? a.levMoneyNet < 0
          : selectedLevNet < 0 ? a.levMoneyNet > 0
          : false
      )
      .map((a) => ({
        ...a,
        spread:    Math.abs(selectedLevNet) + Math.abs(a.levMoneyNet),
        pairScore: a.levMoneyNet * selectedLevNet,
      }))
      .sort((a, b) => a.pairScore - b.pairScore)
      .slice(0, 3)
  }, [allAssetsData, asset, selectedLevNet, latest])

  // Cross-rate symbol for each pair candidate (e.g. AUD → "AUD/CHF" when viewing Swiss Franc)
  const pairCrossSymbols = useMemo(() => {
    if (!symbolInfo) return {} as Record<string, string>
    const result: Record<string, string> = {}
    topPairs.forEach((pair) => {
      const pairInfo = getSymbolInfo(pair.asset)
      if (!pairInfo) return
      const cross = getCrossRateSymbol(symbolInfo, pairInfo)
      if (cross) result[pair.asset] = cross
    })
    return result
  }, [symbolInfo, topPairs])

  // Candlestick data for price chart — one row per daily candle
  const candleData = useMemo(() => {
    const days = priceTimeframe === "3M" ? 90 : priceTimeframe === "6M" ? 180 : 365
    const cutoff = Date.now() - days * 86400 * 1000
    return priceCandles
      .filter((c) => new Date(c.time).getTime() >= cutoff)
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .map((c) => {
        const o = c.open, h = c.high, l = c.low, cl = c.close
        const isUp    = cl >= o
        const bodyTop = Math.max(o, cl)
        const bodyBot = Math.min(o, cl)
        return {
          date:       c.time.slice(0, 10),
          open: o, high: h, low: l, close: cl,
          isUp,
          lowSpacer:  l,
          lowerWick:  Math.max(bodyBot - l, 0),
          body:       Math.max(bodyTop - bodyBot, 0.00001),
          upperWick:  Math.max(h - bodyTop, 0),
        }
      })
  }, [priceCandles, priceTimeframe])

  // Y-axis domain for candlestick chart
  const [candleYMin, candleYMax] = useMemo(() => {
    if (!candleData.length) return [0, 1] as [number, number]
    const lows  = candleData.map((d) => d.low)
    const highs = candleData.map((d) => d.high)
    const lo = Math.min(...lows), hi = Math.max(...highs)
    const pad = (hi - lo) * 0.08
    return [lo - pad, hi + pad] as [number, number]
  }, [candleData])

  // COT area chart data — history filtered by timeframe
  const cotChartData = useMemo(() => {
    const days = priceTimeframe === "3M" ? 90 : priceTimeframe === "6M" ? 180 : 365
    const cutoff = Date.now() - days * 86400 * 1000
    return history.filter((d: any) => new Date(d.date).getTime() >= cutoff)
  }, [history, priceTimeframe])

  // History table rows
  const historyRows = useMemo(() => {
    return history
      .map((row: any, i: number) => {
        const prev = i > 0 ? history[i - 1] : null
        return {
          date:         row.date,
          dealerNet:    row.dealer_net,
          dealerChg:    prev ? row.dealer_net    - prev.dealer_net    : null,
          assetMgrNet:  row.asset_mgr_net,
          assetMgrChg:  prev ? row.asset_mgr_net - prev.asset_mgr_net : null,
          levMoneyNet:  row.lev_money_net,
          levMoneyChg:  prev ? row.lev_money_net - prev.lev_money_net : null,
          openInterest: row.open_interest,
          oiChg:        prev ? row.open_interest - prev.open_interest : null,
        }
      })
      .reverse()
  }, [history])

  // 4 / 8 / 13-week momentum (Lev Fund net change vs N weeks ago)
  const momentumStats = useMemo(() => {
    if (history.length < 2) return null
    const sorted = [...history].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const currentLev = sorted[sorted.length - 1]?.lev_money_net ?? 0
    const get = (weeksAgo: number) => {
      const idx = sorted.length - 1 - weeksAgo
      return idx >= 0 ? (sorted[idx].lev_money_net as number) : null
    }
    return {
      "4W":  get(4)  !== null ? currentLev - get(4)!  : null,
      "8W":  get(8)  !== null ? currentLev - get(8)!  : null,
      "13W": get(13) !== null ? currentLev - get(13)! : null,
    }
  }, [history])

  // Fetch price data for main chart (cross rate with best pair, or own price as fallback)
  useEffect(() => {
    if (!mainChartInfo) return
    setPriceLoading(true)
    setPriceError(null)
    setPriceCandles([])
    fetch(`/api/forex?symbol=${encodeURIComponent(mainChartInfo.symbol)}&interval=1day`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error)
        setPriceCandles(json.candles ?? [])
      })
      .catch((e) => setPriceError(e.message))
      .finally(() => setPriceLoading(false))
  }, [asset, mainChartInfo?.symbol])

  // Fetch cross-rate price data for each pair candidate, reset when asset changes
  useEffect(() => {
    if (topPairs.length === 0 || !symbolInfo) return
    setPairCandles({})  // clear stale candles from previous asset
    topPairs.forEach((pair) => {
      const pairInfo = getSymbolInfo(pair.asset)
      if (!pairInfo) return
      const fetchSymbol = getCrossRateSymbol(symbolInfo, pairInfo) ?? pairInfo.symbol
      fetch(`/api/forex?symbol=${encodeURIComponent(fetchSymbol)}&interval=1day`)
        .then((r) => r.json())
        .then((json) => {
          if (json.candles?.length) {
            setPairCandles((prev) => ({ ...prev, [pair.asset]: json.candles }))
          }
        })
        .catch(() => {})
    })
  }, [asset, symbolInfo?.symbol])  // re-run when asset changes

  // ── EARLY RETURN — now safe because all hooks have already been called ──────
  if (loading || !assetData || !latest) {
    return (
      <div className="space-y-4 mt-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading {asset}…</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Helpers used only in render ───────────────────────────────
  const dealerPct   = getNetPct(latest.dealer_long,    latest.dealer_short)
  const assetMgrPct = getNetPct(latest.asset_mgr_long, latest.asset_mgr_short)
  const levMoneyPct = getNetPct(latest.lev_money_long, latest.lev_money_short)

  const fmtChg = (v: number | null) => {
    if (v === null) return <span className="text-muted-foreground">—</span>
    if (v === 0)    return <span className="text-muted-foreground">0</span>
    return (
      <span className={v > 0 ? "text-[#03b198]" : "text-[#ff2f67]"}>
        {v > 0 ? "+" : ""}{v.toLocaleString()}
      </span>
    )
  }

  const fmtNet = (v: number) => (
    <span className={v >= 0 ? "text-[#03b198]" : "text-[#ff2f67]"}>
      {v >= 0 ? "+" : ""}{v.toLocaleString()}
    </span>
  )

  const exportCSV = () => {
    const headers = ["Date", "Dealer Net", "Dealer WoW", "Asset Mgr Net", "Asset Mgr WoW", "Lev Fund Net", "Lev Fund WoW", "Open Interest", "OI WoW"]
    const rows = historyRows.map((r) => [
      r.date, r.dealerNet, r.dealerChg ?? "", r.assetMgrNet, r.assetMgrChg ?? "",
      r.levMoneyNet, r.levMoneyChg ?? "", r.openInterest, r.oiChg ?? "",
    ])
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `${asset.replace(/ /g, "_")}_COT_history.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="space-y-5 mt-2">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Button>
          <div className="border-l border-border pl-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold leading-tight">{asset}</h2>
              {symbolInfo && (
                <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
                  {symbolInfo.label}
                </span>
              )}
              {cotInfo && cotIdx !== null && (
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${cotInfo.bgColor} ${cotInfo.textColor}`}>
                  <span className="font-mono">{cotIdx}</span>
                  <span>{cotInfo.label}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Report date:{" "}
              <span className="font-medium text-foreground">{latest.report_date}</span>
              &nbsp;·&nbsp;Open interest:{" "}
              <span className="font-medium text-foreground">{latest.open_interest_all.toLocaleString()}</span>
            </p>
          </div>
        </div>
        <Select value={asset} onValueChange={onChangeAsset}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableAssets.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── COT Index gauge ─────────────────────────────────────── */}
      {cotInfo && cotIdx !== null && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <BarChart2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">COT Index</span>
                <span className="text-[10px] text-muted-foreground hidden sm:block">
                  Lev Fund percentile over available history
                </span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <span className="text-[10px] text-[#ff2f67] font-mono shrink-0">Ext Short</span>
                <div className="relative flex-1 h-3 rounded-full overflow-hidden bg-gradient-to-r from-[#ff2f67]/20 via-muted to-[#03b198]/20">
                  {/* Zone ticks */}
                  {[20, 40, 60, 80].map((tick) => (
                    <div
                      key={tick}
                      className="absolute inset-y-0 w-px bg-border/60"
                      style={{ left: `${tick}%` }}
                    />
                  ))}
                  {/* Filled bar */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full opacity-30 transition-all"
                    style={{ width: `${cotIdx}%`, backgroundColor: cotInfo.barColor }}
                  />
                  {/* Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-background shadow-md transition-all"
                    style={{ left: `${cotIdx}%`, backgroundColor: cotInfo.barColor }}
                  />
                </div>
                <span className="text-[10px] text-[#03b198] font-mono shrink-0">Ext Long</span>
                <div className={`text-xl font-bold font-mono w-10 text-right ${cotInfo.textColor}`}>
                  {cotIdx}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 4/8/13-week Momentum Strip ──────────────────────────── */}
      {momentumStats && (
        <div className="grid grid-cols-3 gap-3">
          {(["4W", "8W", "13W"] as const).map((period) => {
            const val = momentumStats[period]
            const isPos = val !== null && val >= 0
            return (
              <Card key={period}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                      {period} Momentum
                    </div>
                    <div className="text-[10px] text-muted-foreground">Lev Fund net change</div>
                  </div>
                  {val !== null ? (
                    <div className={`flex items-center gap-1.5 text-right ${isPos ? "text-[#03b198]" : "text-[#ff2f67]"}`}>
                      {isPos ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-lg font-bold font-mono leading-tight">
                        {isPos ? "+" : ""}{val.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Price Candlestick Chart ──────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
              {mainChartInfo ? (
                <>
                  <span className="font-semibold">{mainChartInfo.label}</span>
                  <span className="text-muted-foreground font-normal text-xs">· Daily price</span>
                  {mainChartInfo.symbol !== symbolInfo?.symbol && (
                    <span className="text-[10px] text-[#8b5cf6] border border-[#8b5cf6]/30 rounded px-1.5 py-0.5">
                      cross-rate vs best pair
                    </span>
                  )}
                  {mainChartInfo.symbol === symbolInfo?.symbol && symbolInfo?.inverted && (
                    <span className="text-[10px] text-[#f59e0b] border border-[#f59e0b]/40 rounded px-1">
                      ⚠ Inverted pair — COT long = bearish on price
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground font-normal text-xs">
                  No price symbol mapping for &quot;{asset}&quot;
                </span>
              )}
            </CardTitle>
            {mainChartInfo && (
              <div className="flex rounded-md border border-border overflow-hidden text-xs shrink-0">
                {(["3M", "6M", "1Y"] as const).map((tf, i) => (
                  <button
                    key={tf}
                    className={`px-3 py-1 transition-colors ${priceTimeframe === tf ? "bg-muted font-medium" : "hover:bg-muted/50"} ${i > 0 ? "border-l border-border" : ""}`}
                    onClick={() => setPriceTimeframe(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-4">
          {!mainChartInfo ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              No Twelve Data symbol mapping for this asset
            </div>
          ) : priceLoading ? (
            <div className="h-48 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Fetching {mainChartInfo.label} price data…
            </div>
          ) : priceError ? (
            <div className="h-48 flex items-center justify-center text-xs text-[#ff2f67]">
              Price fetch failed: {priceError}
            </div>
          ) : candleData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              No price data available for this window
            </div>
          ) : (
            <>
              {/* Candlestick price chart */}
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={candleData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barCategoryGap="20%">
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9 }}
                    minTickGap={40}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[candleYMin, candleYMax]}
                    tick={{ fontSize: 9 }}
                    tickFormatter={(v) =>
                      v > 1000 ? v.toFixed(2) : v > 100 ? v.toFixed(3) : v > 10 ? v.toFixed(4) : v.toFixed(5)
                    }
                    width={62}
                  />
                  <Tooltip content={<CandleTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  {/* Transparent spacer lifts stack to the candle low */}
                  <Bar dataKey="lowSpacer" stackId="c" shape={<LowSpacerShape />} isAnimationActive={false} legendType="none" />
                  {/* Lower wick */}
                  <Bar dataKey="lowerWick" stackId="c" shape={<WickShape />} isAnimationActive={false} legendType="none" />
                  {/* Candle body */}
                  <Bar dataKey="body" stackId="c" shape={<BodyShape />} isAnimationActive={false} legendType="none" />
                  {/* Upper wick */}
                  <Bar dataKey="upperWick" stackId="c" shape={<WickShape />} isAnimationActive={false} legendType="none" />
                </BarChart>
              </ResponsiveContainer>

              {/* COT Lev Fund net positioning area chart */}
              <div>
                <p className="text-[10px] text-muted-foreground mb-1 ml-1">
                  <span className="font-semibold text-[#f59e0b]">{asset}</span>
                  {" "}· Leveraged Fund Net Positioning
                </p>
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={cotChartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cotGradUp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} minTickGap={40} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 9 }}
                      tickFormatter={(v) => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                      width={42}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="#555" strokeDasharray="4 4" />
                    <Area
                      type="monotone"
                      dataKey="lev_money_net"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      fill="url(#cotGradUp)"
                      dot={false}
                      name="Lev Fund Net"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Pies + Top 3 Pairs ───────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_540px] gap-4">
        {/* Trader Position Pie Charts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Scale className="w-4 h-4" />
              Trader Positions — Long vs Short
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[
                { title: "Dealers",         long: latest.dealer_long,    short: latest.dealer_short,    pct: dealerPct    },
                { title: "Asset Managers",  long: latest.asset_mgr_long, short: latest.asset_mgr_short, pct: assetMgrPct  },
                { title: "Leveraged Funds", long: latest.lev_money_long, short: latest.lev_money_short, pct: levMoneyPct  },
              ].map(({ title, long, short, pct }) => (
                <div key={title} className="flex flex-col items-center">
                  <h4 className="text-xs font-semibold mb-1 text-center">{title}</h4>
                  <ResponsiveContainer width={154} height={154}>
                    <PieChart>
                      <Tooltip content={<CustomTooltip />} />
                      <Pie
                        data={getPieData(long, short)}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={60}
                        fillOpacity={0.8}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-primary" fontSize={15} fontWeight="bold">
                                    {pct}%
                                  </tspan>
                                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 14} className="fill-muted-foreground" fontSize={10}>
                                    Net {pct >= 0 ? "Long" : "Short"}
                                  </tspan>
                                </text>
                              )
                            }
                            return null
                          }}
                        />
                        {getPieData(long, short).map((entry, i) => (
                          <Cell key={i} fill={entry.fill} stroke={entry.fill} strokeWidth={1.5} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-0.5">
                    <span className="text-[10px] text-[#03b198]">{long.toLocaleString()} L</span>
                    <span className="text-[10px] text-muted-foreground mx-1">/</span>
                    <span className="text-[10px] text-[#ff2f67]">{short.toLocaleString()} S</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Pair Candidates */}
        <Card className="border-[#f59e0b]/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-[#f59e0b]" />
              Top 3 Pair Candidates
            </CardTitle>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Assets with the most opposite Lev Fund positioning.{" "}
              <span className={selectedLevNet >= 0 ? "text-[#03b198]" : "text-[#ff2f67]"}>
                {asset}: {selectedLevNet > 0 ? "+" : ""}
                {selectedLevNet.toLocaleString()} ({selLevPct}%{" "}
                {selectedLevNet >= 0 ? "long" : "short"})
              </span>
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPairs.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No clear opposite-direction pairs found
              </div>
            ) : (
              topPairs.map((pair, i) => {
                const pairLevPct     = pair.levMoneyTotal > 0
                  ? ((pair.levMoneyNet / pair.levMoneyTotal) * 100).toFixed(1)
                  : "0"
                const crossSymbol    = pairCrossSymbols[pair.asset]
                const displayLabel   = crossSymbol ?? getSymbolInfo(pair.asset)?.label ?? pair.asset
                const pairCandleData = pairCandles[pair.asset] ?? []
                const pctChg         = pairCandleData.length > 1 ? priceChange(pairCandleData.slice(-52)) : null
                const isUp           = pctChg !== null && pctChg >= 0

                return (
                  <div key={pair.asset} className="p-3 rounded-lg border border-border bg-muted/20">
                    {/* Title row */}
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#f59e0b]">#{i + 1}</span>
                        <div>
                          <span className="font-semibold text-sm">{pair.asset}</span>
                          <span className="ml-1.5 text-[10px] text-muted-foreground font-mono">
                            {displayLabel}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b] font-mono font-medium shrink-0">
                        Spread {pair.spread.toLocaleString()}
                      </span>
                    </div>

                    {/* Net comparison */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                      <div>
                        <div className="text-muted-foreground truncate">{asset}</div>
                        <div className={`font-semibold text-xs ${selectedLevNet >= 0 ? "text-[#03b198]" : "text-[#ff2f67]"}`}>
                          {selectedLevNet > 0 ? "+" : ""}{selectedLevNet.toLocaleString()}
                          <span className="font-normal text-muted-foreground ml-1">({selLevPct}%)</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground truncate">{pair.asset}</div>
                        <div className={`font-semibold text-xs ${pair.levMoneyNet >= 0 ? "text-[#03b198]" : "text-[#ff2f67]"}`}>
                          {pair.levMoneyNet > 0 ? "+" : ""}{pair.levMoneyNet.toLocaleString()}
                          <span className="font-normal text-muted-foreground ml-1">({pairLevPct}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Cross-rate sparkline */}
                    {pairCandleData.length > 4 ? (
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] text-muted-foreground font-mono">
                            {displayLabel} · last 52 sessions
                          </span>
                          {pctChg !== null && (
                            <span className={`text-[10px] font-semibold ${isUp ? "text-[#03b198]" : "text-[#ff2f67]"}`}>
                              {isUp ? "▲" : "▼"} {Math.abs(pctChg).toFixed(2)}%
                            </span>
                          )}
                        </div>
                        <PriceSparkline candles={pairCandleData} isPositive={isUp} />
                      </div>
                    ) : (
                      <div className="h-10 flex items-center justify-center text-[9px] text-muted-foreground">
                        {crossSymbol ? `Loading ${displayLabel}…` : "No price data"}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Net Positions table + OI chart ──────────────────────── */}
      <div className="grid grid-cols-[1fr_420px] gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Net Positions by Trader Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs text-right">Longs</TableHead>
                  <TableHead className="text-xs text-right">Shorts</TableHead>
                  <TableHead className="text-xs text-right">Net</TableHead>
                  <TableHead className="text-xs text-right">Net %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { cat: "Dealer",           long: latest.dealer_long,    short: latest.dealer_short    },
                  { cat: "Asset Manager",    long: latest.asset_mgr_long, short: latest.asset_mgr_short },
                  { cat: "Leveraged Money",  long: latest.lev_money_long, short: latest.lev_money_short },
                  { cat: "Other Reportable", long: latest.other_long,     short: latest.other_short     },
                  { cat: "Non-Reportable",   long: latest.nonrept_long,   short: latest.nonrept_short   },
                ].map(({ cat, long, short }) => {
                  const net = long - short
                  const pct = long + short > 0 ? ((net / (long + short)) * 100).toFixed(1) : "0"
                  return (
                    <TableRow key={cat}>
                      <TableCell className="text-xs font-medium py-2">{cat}</TableCell>
                      <TableCell className="text-xs text-right py-2 text-[#03b198]">{long.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right py-2 text-[#ff2f67]">{short.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right py-2">
                        <span className={`flex items-center justify-end gap-1 ${net >= 0 ? "text-[#03b198]" : "text-[#ff2f67]"}`}>
                          {net >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(net).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className={`text-xs text-right py-2 font-medium ${Number(pct) >= 0 ? "text-[#03b198]" : "text-[#ff2f67]"}`}>
                        {Number(pct) > 0 ? "+" : ""}{pct}%
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Open Interest Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={history} margin={{ right: 8 }}>
                <defs>
                  <linearGradient id="detailOI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#8500eb" stopOpacity={0.75} />
                    <stop offset="90%" stopColor="#8500eb" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} minTickGap={30} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => Math.abs(v) >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="open_interest" stroke="#8500eb" fill="url(#detailOI)" name="Open Interest" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Net Position Trends chart ────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Net Position Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={history} margin={{ right: 8 }}>
              <defs>
                {Object.entries(CHART_COLORS).map(([key, color]) => (
                  <linearGradient key={key} id={`detail_${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={color} stopOpacity={0}   />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={30} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => Math.abs(v) >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke="#444" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="dealer_net"    stroke={CHART_COLORS.dealer}   fill="url(#detail_dealer)"   name="Dealer"    isAnimationActive={false} />
              <Area type="monotone" dataKey="asset_mgr_net" stroke={CHART_COLORS.assetMgr} fill="url(#detail_assetMgr)" name="Asset Mgr" isAnimationActive={false} />
              <Area type="monotone" dataKey="lev_money_net" stroke={CHART_COLORS.levMoney} fill="url(#detail_levMoney)" name="Lev Money" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Historical Changes Table ─────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Historical Changes</CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground">
                Week-over-week · {historyRows.length} reports · most recent first
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs gap-1 px-2"
                onClick={exportCSV}
              >
                <Download className="w-3 h-3" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="text-xs pl-4 w-[110px]">Date</TableHead>
                  <TableHead className="text-xs text-right">Dealer Net</TableHead>
                  <TableHead className="text-xs text-right">WoW</TableHead>
                  <TableHead className="text-xs text-right">Asset Mgr Net</TableHead>
                  <TableHead className="text-xs text-right">WoW</TableHead>
                  <TableHead className="text-xs text-right">Lev Fund Net</TableHead>
                  <TableHead className="text-xs text-right">WoW</TableHead>
                  <TableHead className="text-xs text-right">Open Interest</TableHead>
                  <TableHead className="text-xs text-right pr-4">WoW</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyRows.map((row, i) => (
                  <TableRow key={row.date} className={`text-xs ${i === 0 ? "bg-muted/30" : ""}`}>
                    <TableCell className="pl-4 py-2 font-medium font-mono text-xs">
                      {row.date}
                      {i === 0 && (
                        <span className="ml-1.5 text-[9px] text-muted-foreground border border-border rounded px-1">
                          latest
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-2">{fmtNet(row.dealerNet)}</TableCell>
                    <TableCell className="text-right py-2">{fmtChg(row.dealerChg)}</TableCell>
                    <TableCell className="text-right py-2">{fmtNet(row.assetMgrNet)}</TableCell>
                    <TableCell className="text-right py-2">{fmtChg(row.assetMgrChg)}</TableCell>
                    <TableCell className="text-right py-2">{fmtNet(row.levMoneyNet)}</TableCell>
                    <TableCell className="text-right py-2">{fmtChg(row.levMoneyChg)}</TableCell>
                    <TableCell className="text-right py-2 text-muted-foreground">
                      {row.openInterest.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right py-2 pr-4">{fmtChg(row.oiChg)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
