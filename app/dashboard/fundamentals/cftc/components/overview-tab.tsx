"use client"

import { useState, useMemo, Fragment } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Activity, Zap, Scale, ArrowUpDown, Star, RefreshCw } from "lucide-react"
import { computeCOTIndex, cotIndexInfo } from "../lib/cot-utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  ScatterChart,
  Scatter,
  Cell,
  ReferenceLine,
} from "recharts"

interface OverviewTabProps {
  allAssetsData: any[]
  historicalData: any[]
  commoditiesData?: any[]
  onSelectAsset?: (asset: string) => void
}

const BULL = "#03b198"
const BEAR = "#ff2f67"
const AMBER = "#f59e0b"
const PURPLE = "#8b5cf6"

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-2 shadow-lg text-xs space-y-0.5">
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function OverviewTab({ allAssetsData, historicalData, commoditiesData = [], onSelectAsset }: OverviewTabProps) {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [sortField, setSortField] = useState<string>("absLevChange")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [activeMarket, setActiveMarket] = useState<"currencies" | "commodities">("currencies")

  // ── Watchlist (persisted in localStorage) ────────────────────
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try { return JSON.parse(localStorage.getItem("cot-watchlist") ?? "[]") } catch { return [] }
  })

  const toggleWatchlist = (e: React.MouseEvent, assetName: string) => {
    e.stopPropagation()
    setWatchlist((prev) => {
      const next = prev.includes(assetName) ? prev.filter((a) => a !== assetName) : [...prev, assetName]
      localStorage.setItem("cot-watchlist", JSON.stringify(next))
      return next
    })
  }

  const getSentiment = (levMoneyNet: number, levMoneyTotal: number) => {
    if (levMoneyTotal === 0) return { label: "Neutral", color: "text-muted-foreground", dot: PURPLE }
    const pct = (levMoneyNet / levMoneyTotal) * 100
    if (pct > 30) return { label: "Very Bullish", color: "text-[#03b198] font-semibold", dot: BULL }
    if (pct > 10) return { label: "Bullish", color: "text-[#03b198]", dot: BULL }
    if (pct < -30) return { label: "Very Bearish", color: "text-[#ff2f67] font-semibold", dot: BEAR }
    if (pct < -10) return { label: "Bearish", color: "text-[#ff2f67]", dot: BEAR }
    return { label: "Neutral", color: "text-muted-foreground", dot: PURPLE }
  }

  const formatChange = (change: number) => {
    if (change === 0) return <span className="text-muted-foreground text-xs">—</span>
    const color = change > 0 ? "text-[#03b198]" : "text-[#ff2f67]"
    const icon = change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
    return (
      <span className={`${color} flex items-center gap-0.5 text-xs`}>
        {icon}
        {change > 0 ? "+" : ""}
        {change.toFixed(1)}%
      </span>
    )
  }

  const enrich = (data: any[]) =>
    data.map((a) => ({
      ...a,
      levNetPct: a.levMoneyTotal > 0 ? (a.levMoneyNet / a.levMoneyTotal) * 100 : 0,
      divergence: Math.abs((a.dealerNet ?? 0) - (a.levMoneyNet ?? 0)),
      absLevChange: Math.abs(a.levMoneyChange ?? 0),
    }))

  const enrichedCurrencies = useMemo(() => enrich(allAssetsData), [allAssetsData])
  const enrichedCommodities = useMemo(() => enrich(commoditiesData), [commoditiesData])

  const activeData = activeMarket === "currencies" ? enrichedCurrencies : enrichedCommodities

  const sortedData = useMemo(() => {
    return [...activeData].sort((a, b) => {
      const va = a[sortField] ?? 0
      const vb = b[sortField] ?? 0
      return sortDir === "desc" ? vb - va : va - vb
    })
  }, [activeData, sortField, sortDir])

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    else { setSortField(field); setSortDir("desc") }
  }

  const SortHeader = ({ field, label, className = "" }: { field: string; label: string; className?: string }) => (
    <TableHead
      className={`text-xs cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortField === field ? (
          sortDir === "desc" ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </span>
    </TableHead>
  )

  // Signal cards — always from currencies for now
  const allEnriched = enrichedCurrencies.length > 0 ? enrichedCurrencies : enrichedCommodities
  const mostBullish = allEnriched.reduce((p, c) => (c.levNetPct > (p?.levNetPct ?? -Infinity) ? c : p), null as any)
  const mostBearish = allEnriched.reduce((p, c) => (c.levNetPct < (p?.levNetPct ?? Infinity) ? c : p), null as any)
  const biggestMove = allEnriched.reduce((p, c) => (c.absLevChange > (p?.absLevChange ?? 0) ? c : p), null as any)
  const maxDivergence = allEnriched.reduce((p, c) => (c.divergence > (p?.divergence ?? 0) ? c : p), null as any)

  // Volatility for charts
  const volatilityMap: Record<string, number> = {}
  historicalData.forEach((d) => {
    const score = Math.abs(d.oiChangePct || 0) + Math.abs(d.positionChangePct || 0)
    if (!volatilityMap[d.asset] || score > volatilityMap[d.asset]) {
      volatilityMap[d.asset] = score
    }
  })
  const volatilityData = Object.entries(volatilityMap)
    .map(([asset, volatilityScore]) => ({ asset: asset.split(" ").slice(0, 2).join(" "), fullAsset: asset, volatilityScore }))
    .sort((a, b) => b.volatilityScore - a.volatilityScore)
    .slice(0, 6)

  const filteredHistorical = selectedAsset ? historicalData.filter((d) => d.asset === selectedAsset) : historicalData
  const trendData = [...filteredHistorical]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12)
    .reverse()

  const scatterData = Object.entries(volatilityMap).map(([asset, _]) => {
    const latest = historicalData.filter((d) => d.asset === asset).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    return latest ? { asset: asset.split(" ")[0], oiChangePct: latest.oiChangePct, positionChangePct: latest.positionChangePct } : null
  }).filter(Boolean)

  // ── Position Flip Tracker ─────────────────────────────────────
  // Detect when Lev Fund net crossed zero in the last 4 reports per asset
  const positionFlips = useMemo(() => {
    const assetMap = new Map<string, any[]>()
    historicalData.forEach((d) => {
      if (!assetMap.has(d.asset)) assetMap.set(d.asset, [])
      assetMap.get(d.asset)!.push(d)
    })
    const flips: { asset: string; date: string; direction: "to-long" | "to-short"; prevNet: number; currNet: number }[] = []
    assetMap.forEach((records, asset) => {
      const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const recent = sorted.slice(-5) // last 5 to catch flips in last 4 windows
      for (let i = 1; i < recent.length; i++) {
        const prev = recent[i - 1].levMoneyNet as number
        const curr = recent[i].levMoneyNet as number
        if (prev < 0 && curr >= 0) flips.push({ asset, date: recent[i].date, direction: "to-long",  prevNet: prev, currNet: curr })
        if (prev >= 0 && curr < 0) flips.push({ asset, date: recent[i].date, direction: "to-short", prevNet: prev, currNet: curr })
      }
    })
    return flips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
  }, [historicalData])

  // ── Watchlist-pinned sort ─────────────────────────────────────
  const sortedDataPinned = useMemo(() => {
    const pinned   = sortedData.filter((a) => watchlist.includes(a.asset))
    const unpinned = sortedData.filter((a) => !watchlist.includes(a.asset))
    return [...pinned, ...unpinned]
  }, [sortedData, watchlist])

  // Net bias top 8 (sorted by absolute net)
  const biasBars = [...enrichedCurrencies]
    .sort((a, b) => Math.abs(b.levMoneyNet) - Math.abs(a.levMoneyNet))
    .slice(0, 8)
    .map((a) => ({ asset: a.asset.split(" ")[0], levNet: a.levMoneyNet }))

  return (
    <div className="space-y-4 mt-4">
      {/* ── Signal Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Most Bullish",
            asset: mostBullish,
            value: `+${mostBullish?.levNetPct?.toFixed(1) ?? "0"}%`,
            sub: "Lev Fund Net Long",
            color: "#03b198",
            border: "border-l-[#03b198]",
            icon: <TrendingUp className="w-4 h-4 text-[#03b198]" />,
          },
          {
            label: "Most Bearish",
            asset: mostBearish,
            value: `${mostBearish?.levNetPct?.toFixed(1) ?? "0"}%`,
            sub: "Lev Fund Net Short",
            color: "#ff2f67",
            border: "border-l-[#ff2f67]",
            icon: <TrendingDown className="w-4 h-4 text-[#ff2f67]" />,
          },
          {
            label: "Biggest Move WoW",
            asset: biggestMove,
            value: `${biggestMove?.levMoneyChange > 0 ? "+" : ""}${biggestMove?.levMoneyChange?.toFixed(1) ?? "0"}%`,
            sub: "Lev Fund Wk Change",
            color: "#f59e0b",
            border: "border-l-[#f59e0b]",
            icon: <Zap className="w-4 h-4 text-[#f59e0b]" />,
          },
          {
            label: "Max Divergence",
            asset: maxDivergence,
            value: maxDivergence?.divergence?.toLocaleString() ?? "0",
            sub: "Dealer vs Lev Fund",
            color: "#8b5cf6",
            border: "border-l-[#8b5cf6]",
            icon: <Scale className="w-4 h-4 text-[#8b5cf6]" />,
          },
        ].map((card) => (
          <Card
            key={card.label}
            className={`border-l-2 ${card.border} cursor-pointer hover:bg-muted/30 transition-colors`}
            onClick={() => card.asset && onSelectAsset?.(card.asset.asset)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{card.label}</span>
                {card.icon}
              </div>
              <div className="font-semibold text-sm truncate mb-0.5">{card.asset?.asset ?? "—"}</div>
              <div className="text-xl font-bold leading-tight" style={{ color: card.color }}>{card.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{card.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Position Flip Tracker ────────────────────────────────── */}
      {positionFlips.length > 0 && (
        <Card className="border-[#8b5cf6]/20">
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#8b5cf6]" />
              <CardTitle className="text-sm">Position Flip Tracker</CardTitle>
              <span className="text-[10px] text-muted-foreground">
                Leveraged Fund net position crossed zero in the last 4 weekly reports
              </span>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex flex-wrap gap-2">
              {positionFlips.map((flip, i) => (
                <button
                  key={`${flip.asset}-${flip.date}-${i}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-left"
                  onClick={() => onSelectAsset?.(flip.asset)}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${flip.direction === "to-long" ? "bg-[#03b198]" : "bg-[#ff2f67]"}`} />
                  <div>
                    <div className="text-xs font-semibold leading-tight">{flip.asset}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{flip.date}</div>
                  </div>
                  <div className={`text-xs font-mono ml-1 ${flip.direction === "to-long" ? "text-[#03b198]" : "text-[#ff2f67]"}`}>
                    {flip.direction === "to-long" ? "↑ Flipped Long" : "↓ Flipped Short"}
                  </div>
                  <div className="text-[10px] text-muted-foreground ml-0.5">
                    {flip.prevNet > 0 ? "+" : ""}{flip.prevNet.toLocaleString()} → {flip.currNet > 0 ? "+" : ""}{flip.currNet.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_460px] gap-4">

        {/* Market Table */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">Market Overview</CardTitle>
                {/* Currencies / Commodities tabs */}
                <div className="flex rounded-md border border-border overflow-hidden text-xs">
                  <button
                    className={`px-3 py-1 transition-colors ${activeMarket === "currencies" ? "bg-muted font-medium" : "hover:bg-muted/50"}`}
                    onClick={() => setActiveMarket("currencies")}
                  >
                    Currencies
                  </button>
                  <button
                    className={`px-3 py-1 border-l border-border transition-colors ${activeMarket === "commodities" ? "bg-muted font-medium" : "hover:bg-muted/50"} ${commoditiesData.length === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                    onClick={() => commoditiesData.length > 0 && setActiveMarket("commodities")}
                    disabled={commoditiesData.length === 0}
                  >
                    Commodities
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">
                Click a row to filter charts ·{" "}
                {selectedAsset ? (
                  <button className="underline" onClick={() => setSelectedAsset(null)}>Clear</button>
                ) : "none selected"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 310px)", minHeight: "300px" }}>
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow className="border-b">
                    <SortHeader field="asset" label="Asset" className="w-[165px] pl-4" />
                    <SortHeader field="dealerNet" label="Dealers" className="text-right" />
                    <SortHeader field="dealerChange" label="Chg" />
                    <SortHeader field="assetMgrNet" label="Asset Mgrs" className="text-right" />
                    <SortHeader field="assetMgrChange" label="Chg" />
                    <SortHeader field="levMoneyNet" label="Lev Funds" className="text-right" />
                    <SortHeader field="absLevChange" label="Chg ↓" />
                    <TableHead className="text-xs text-center">Sentiment</TableHead>
                    <TableHead className="text-xs text-center w-[130px]">COT Index</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDataPinned.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-xs text-muted-foreground py-12">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedDataPinned.map((asset, idx) => {
                      const sentiment = getSentiment(asset.levMoneyNet, asset.levMoneyTotal)
                      const isSelected = selectedAsset === asset.asset
                      const isPinned  = watchlist.includes(asset.asset)
                      const cotIdx = computeCOTIndex(historicalData, asset.asset)
                      const cotInfo = cotIdx !== null ? cotIndexInfo(cotIdx) : null
                      // divider after last pinned item
                      const showDivider = isPinned && !watchlist.includes(sortedDataPinned[idx + 1]?.asset)
                      return (
                        <Fragment key={asset.asset}>
                        <TableRow
                          className={`cursor-pointer transition-colors text-xs ${
                            isSelected ? "bg-muted" : isPinned ? "bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10" : "hover:bg-muted/40"
                          }`}
                          onClick={() => setSelectedAsset(asset.asset === selectedAsset ? null : asset.asset)}
                        >
                          <TableCell className="font-medium py-2 pl-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => toggleWatchlist(e, asset.asset)}
                                className={`shrink-0 transition-colors ${isPinned ? "text-[#f59e0b]" : "text-muted-foreground/30 hover:text-[#f59e0b]/70"}`}
                                title={isPinned ? "Remove from watchlist" : "Add to watchlist"}
                              >
                                <Star className={`w-3 h-3 ${isPinned ? "fill-[#f59e0b]" : ""}`} />
                              </button>
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: sentiment.dot }}
                              />
                              <button
                                className="truncate max-w-[120px] text-left hover:underline hover:text-primary transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onSelectAsset?.(asset.asset)
                                }}
                              >
                                {asset.asset}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-2">{(asset.dealerNet ?? 0).toLocaleString()}</TableCell>
                          <TableCell className="py-2">{formatChange(asset.dealerChange ?? 0)}</TableCell>
                          <TableCell className="text-right py-2">{(asset.assetMgrNet ?? 0).toLocaleString()}</TableCell>
                          <TableCell className="py-2">{formatChange(asset.assetMgrChange ?? 0)}</TableCell>
                          <TableCell className="text-right py-2">{(asset.levMoneyNet ?? 0).toLocaleString()}</TableCell>
                          <TableCell className="py-2">{formatChange(asset.levMoneyChange ?? 0)}</TableCell>
                          <TableCell className={`text-center py-2 ${sentiment.color}`}>{sentiment.label}</TableCell>
                          <TableCell className="py-2 px-3">
                            {cotInfo && cotIdx !== null ? (
                              <div className="flex items-center gap-1.5">
                                <span className={`font-mono text-xs w-6 text-right ${cotInfo.textColor}`}>{cotIdx}</span>
                                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden min-w-[48px]">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${cotIdx}%`, backgroundColor: cotInfo.barColor }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                        {showDivider && (
                          <TableRow>
                            <TableCell colSpan={9} className="py-0 px-0">
                              <div className="h-px bg-[#f59e0b]/20 mx-4" />
                            </TableCell>
                          </TableRow>
                        )}
                        </Fragment>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Charts panel */}
        <div className="space-y-4">
          {/* Volatility / Trends / Clusters */}
          <Card>
            <Tabs defaultValue="volatility">
              <CardHeader className="pb-0 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4" />
                    Analysis
                    {selectedAsset && (
                      <span className="text-xs text-muted-foreground font-normal">— {selectedAsset}</span>
                    )}
                  </CardTitle>
                  <TabsList className="h-7">
                    <TabsTrigger value="volatility" className="text-xs h-6 px-2">Volatility</TabsTrigger>
                    <TabsTrigger value="trends" className="text-xs h-6 px-2">Trends</TabsTrigger>
                    <TabsTrigger value="clusters" className="text-xs h-6 px-2">Clusters</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>

              <CardContent className="pt-3">
                <TabsContent value="volatility" className="mt-0">
                  <p className="text-[10px] text-muted-foreground mb-3">
                    Breakout likelihood — sum of absolute % changes in OI & positions
                  </p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={volatilityData} layout="vertical" margin={{ left: 0, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="asset" type="category" tick={{ fontSize: 10 }} width={82} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="volatilityScore" radius={[0, 3, 3, 0]} name="Vol Score">
                        {volatilityData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={AMBER}
                            fillOpacity={1 - i * 0.12}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="trends" className="mt-0">
                  <p className="text-[10px] text-muted-foreground mb-3">
                    Open Interest & Net Position trends — last 12 reports
                  </p>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={trendData} margin={{ right: 10 }}>
                      <defs>
                        <linearGradient id="gOI2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff932f" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="#ff932f" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gPos2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8500eb" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="#8500eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                      <YAxis yAxisId="l" tick={{ fontSize: 9 }} />
                      <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 9 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area yAxisId="l" type="monotone" dataKey="openInterest" stroke="#ff932f" fill="url(#gOI2)" name="Open Interest" />
                      <Area yAxisId="r" type="monotone" dataKey="netPosition" stroke="#8500eb" fill="url(#gPos2)" name="Net Position" />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="clusters" className="mt-0">
                  <p className="text-[10px] text-muted-foreground mb-3">
                    OI Change % vs Position Change % — outer quadrants = high activity
                  </p>
                  <ResponsiveContainer width="100%" height={240}>
                    <ScatterChart margin={{ right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="oiChangePct" name="OI Change %" tick={{ fontSize: 9 }} />
                      <YAxis dataKey="positionChangePct" name="Pos Change %" tick={{ fontSize: 9 }} />
                      <ReferenceLine x={0} stroke="#555" strokeDasharray="4 4" />
                      <ReferenceLine y={0} stroke="#555" strokeDasharray="4 4" />
                      <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter data={scatterData} fill={AMBER} fillOpacity={0.8} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* Net Positioning Bias */}
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm">Lev Fund Net Positioning Bias</CardTitle>
              <p className="text-[10px] text-muted-foreground">Top 8 by absolute net position</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={biasBars} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <XAxis type="number" tick={{ fontSize: 9 }} />
                  <YAxis dataKey="asset" type="category" tick={{ fontSize: 9 }} width={64} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine x={0} stroke="#555" />
                  <Bar dataKey="levNet" radius={[0, 3, 3, 0]} name="Net Pos">
                    {biasBars.map((entry, i) => (
                      <Cell key={i} fill={entry.levNet >= 0 ? BULL : BEAR} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
