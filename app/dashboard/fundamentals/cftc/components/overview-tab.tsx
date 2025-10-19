"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts"

interface OverviewTabProps {
  allAssetsData: any[]
  historicalData: any[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
        <p className="text-xs font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function OverviewTab({ allAssetsData, historicalData }: OverviewTabProps) {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)

  const getSentiment = (levMoneyNet: number, levMoneyTotal: number) => {
    if (levMoneyTotal === 0) return { label: "Neutral", color: "text-primary" }

    const netPct = (levMoneyNet / levMoneyTotal) * 100

    if (netPct > 30) return { label: "Very Bullish", color: "text-[#03b198] font-bold" }
    if (netPct > 10) return { label: "Bullish", color: "text-[#03b198]" }
    if (netPct < -30) return { label: "Very Bearish", color: "text-[#ff2f67] font-bold" }
    if (netPct < -10) return { label: "Bearish", color: "text-[#ff2f67]" }

    return { label: "Neutral", color: "text-primary" }
  }

  const formatChange = (change: number) => {
    if (change === 0) return <span className="text-primary text-left">0%</span>
    const color = change > 0 ? "text-[#03b198]" : "text-[#ff2f67]"
    const icon = change > 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />
    return (
      <span className={`${color} flex items-center gap-1`}>
        {icon}
        {change > 0 ? "+" : ""}
        {change.toFixed(1)}%
      </span>
    )
  }

  const filteredHistoricalData = selectedAsset
    ? historicalData.filter((d) => d.asset === selectedAsset)
    : historicalData

  const volatilityData = filteredHistoricalData.reduce((acc: any[], curr: any) => {
    const existing = acc.find((d) => d.asset === curr.asset)
    if (!existing) {
      acc.push({
        asset: curr.asset,
        oiChangePct: curr.oiChangePct || 0,
        positionChangePct: curr.positionChangePct || 0,
        volatilityScore: Math.abs(curr.oiChangePct || 0) + Math.abs(curr.positionChangePct || 0),
      })
    }
    return acc
  }, [])

  const sortedHistoricalData = [...filteredHistoricalData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const last3MonthsData = sortedHistoricalData.slice(0, 12).reverse()

  const lineChartData = last3MonthsData.map((d) => ({
    date: d.date,
    asset: d.asset,
    openInterest: d.openInterest,
    netPosition: d.netPosition,
  }))

  return (
    <div className="flex gap-4">
      <Card className="w-[45vw] h-[40vh]">
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-y-scroll h-[32vh]">
            <Table>
              <TableHeader className="top-0 z-5 sticky bg-background">
                <TableRow className="text-xs">
                  <TableHead className="text-xs text-left border-r">Asset</TableHead>
                  <TableHead className="text-xs text-right">Dealers</TableHead>
                  <TableHead className="text-xs text-left">Change</TableHead>
                  <TableHead className="text-xs text-right">Asset Mgrs</TableHead>
                  <TableHead className="text-xs text-left">Change</TableHead>
                  <TableHead className="text-xs text-right">Lev Funds</TableHead>
                  <TableHead className="text-xs text-left">Change</TableHead>
                  <TableHead className="text-xs text-center">Sentiment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allAssetsData.map((asset) => {
                  const sentiment = getSentiment(asset.levMoneyNet, asset.levMoneyTotal)
                  return (
                    <TableRow
                      key={asset.asset}
                      className={`text-xs cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedAsset === asset.asset ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedAsset(asset.asset === selectedAsset ? null : asset.asset)}
                    >
                      <TableCell className="font-medium text-xs text-left border-r">{asset.asset}</TableCell>
                      <TableCell className="text-right text-xs">{asset.dealerNet.toLocaleString()}</TableCell>
                      <TableCell className="text-left text-xs">{formatChange(asset.dealerChange)}</TableCell>
                      <TableCell className="text-right text-xs">{asset.assetMgrNet.toLocaleString()}</TableCell>
                      <TableCell className="text-left text-xs">{formatChange(asset.assetMgrChange)}</TableCell>
                      <TableCell className="text-right text-xs">{asset.levMoneyNet.toLocaleString()}</TableCell>
                      <TableCell className="text-left text-xs">{formatChange(asset.levMoneyChange)}</TableCell>
                      <TableCell className={`text-xs text-center ${sentiment.color}`}>{sentiment.label}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="w-[45vw] h-[40vh]">
        <Tabs defaultValue="volatility" className="w-full">
            <CardHeader className="flex flex-row items-center justify-between h-10 mt-4">
            <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Volatility Analysis
                {selectedAsset && (
                <span className="text-sm font-normal text-muted-foreground">
                    - {selectedAsset}
                </span>
                )}
            </CardTitle>

            {/* Tabs List aligned right */}
            <TabsList className="flex space-x-1 p-1">
                <TabsTrigger className="text-xs" value="volatility">
                Volatility
                </TabsTrigger>
                <TabsTrigger className="text-xs" value="trends">
                Trends
                </TabsTrigger>
                <TabsTrigger className="text-xs" value="clusters">
                Clusters
                </TabsTrigger>
            </TabsList>
            </CardHeader>

            <CardContent>
            {/* Volatility Tab */}
            <TabsContent value="volatility" className="h-[28vh]">
                <div className="">
                <div className="mb-6">
                    <h4 className="text-xs font-semibold">
                    Volatility Score (Breakout Likelihood)
                    </h4>
                    <p className="text-xs text-muted-foreground">
                    Calculated by summing absolute % changes in Open Interest and Net
                    Positions. Higher scores indicate greater market activity and
                    potential for price breakouts or reversals.
                    </p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={volatilityData.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="0 3" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis
                        dataKey="asset"
                        type="category"
                        tick={{ fontSize: 10 }}
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="volatilityScore" fill="#f59e0b" />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="h-[28vh]">
                <div className="">
                <div className="mb-6">
                    <h4 className="text-xs font-semibold">
                    Open Interest & Position Trends (Last 3 Months)
                    </h4>
                    <p className="text-xs text-muted-foreground">
                    Shows the evolution of Open Interest (total contracts outstanding)
                    and Net Positions (long minus short) over time. Spikes indicate
                    position build-ups; drops suggest unwinding. Divergence between
                    the two can signal volatility.
                    </p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={lineChartData}>
                    <defs>
                        <linearGradient id="colorOI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff932f" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ff932f" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorPosition" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8500eb" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8500eb" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0 0" vertical={false} horizontal={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 9 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="openInterest"
                        stroke="#ff932f"
                        fillOpacity={1}
                        fill="url(#colorOI)"
                        name="Open Interest"
                    />
                    <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="netPosition"
                        stroke="#8500eb"
                        fillOpacity={1}
                        fill="url(#colorPosition)"
                        name="Net Positions"
                    />
                    </AreaChart>
                </ResponsiveContainer>
                </div>
            </TabsContent>

            {/* Clusters Tab */}
            <TabsContent value="clusters" className="h-[28vh]">
                <div className="">
                <div className="mb-6">
                    <h4 className="text-xs font-semibold">
                    Volatility Clusters (OI vs Position Change)
                    </h4>
                    <p className="text-xs text-muted-foreground">
                    Scatter plot comparing % change in Open Interest vs % change in
                    Net Positions. Assets in the outer quadrants show high volatility.
                    Clusters indicate correlated market movements and potential
                    systemic risk.
                    </p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <ScatterChart>
                    <XAxis
                        dataKey="oiChangePct"
                        name="OI Change %"
                        tick={{ fontSize: 9 }}
                    />
                    <YAxis
                        dataKey="positionChangePct"
                        name="Position Change %"
                        tick={{ fontSize: 9 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter name="Assets" data={volatilityData} fill="#f59e0b" />
                    </ScatterChart>
                </ResponsiveContainer>
                </div>
            </TabsContent>
            </CardContent>
        </Tabs>
        </Card>


    </div>
  )
}
