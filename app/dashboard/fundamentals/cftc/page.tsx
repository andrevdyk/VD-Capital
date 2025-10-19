"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Label,
} from "recharts"
import { TrendingUp, TrendingDown, Users, Scale, AlertCircle, Award } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://nobtgazxiggvkrwxugpq.supabase.co"
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vYnRnYXp4aWdndmtyd3h1Z3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2Nzk5OTIsImV4cCI6MjA0MjI1NTk5Mn0.SWmzkATJ5uUNhCrFdXB-FeCEL3wcVk6p_eDqXpOD-qg"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const COLORS = {
  dealer: "#3b82f6",
  assetMgr: "#10b981",
  levMoney: "#f59e0b",
  other: "#8b5cf6",
  nonrept: "#ef4444",
}

export default function COTDashboard() {
  const [asset1, setAsset1] = useState<string>("BITCOIN")
  const [asset2, setAsset2] = useState<string>("ETHEREUM")
  const [availableAssets, setAvailableAssets] = useState<string[]>([])
  const [data, setData] = useState<any>({})
  const [rankingData, setRankingData] = useState<any[]>([])
  const [positionFlips, setPositionFlips] = useState<any[]>([])
  const [openInterestChanges, setOpenInterestChanges] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAvailableAssets()
    fetchRankingData()
    fetchPositionFlips()
    fetchOpenInterestChanges()
  }, [])

  useEffect(() => {
    if (availableAssets.length > 0) {
      fetchAssetData(asset1)
      fetchAssetData(asset2)
    }
  }, [asset1, asset2, availableAssets])

  const fetchPositionFlips = async () => {
    try {
      const { data: allData, error } = await supabase
        .from("cftc_data_combined")
        .select(
          "contract_market_name, report_date, dealer_positions_long_all, dealer_positions_short_all, asset_mgr_positions_long, asset_mgr_positions_short, lev_money_positions_long, lev_money_positions_short",
        )
        .in("commodity_subgroup_name", [
        "CURRENCY",
        "CURRENCY(NON-MAJOR)",
        "OTHER FINANCIAL INSTRUMENTS",
        ])
        .order("report_date", { ascending: false })

      if (error) throw error

      const assetMap: any = {}
      allData.forEach((row: any) => {
        if (!assetMap[row.contract_market_name]) {
          assetMap[row.contract_market_name] = []
        }
        assetMap[row.contract_market_name].push(row)
      })

      const flips: any[] = []
      Object.entries(assetMap).forEach(([asset, records]: [string, any]) => {
        if (records.length >= 2) {
          const latest = records[0]
          const previous = records[1]

          const latestNet =
            latest.dealer_positions_long_all +
            latest.asset_mgr_positions_long +
            latest.lev_money_positions_long -
            (latest.dealer_positions_short_all + latest.asset_mgr_positions_short + latest.lev_money_positions_short)
          const previousNet =
            previous.dealer_positions_long_all +
            previous.asset_mgr_positions_long +
            previous.lev_money_positions_long -
            (previous.dealer_positions_short_all +
              previous.asset_mgr_positions_short +
              previous.lev_money_positions_short)

          if ((latestNet > 0 && previousNet < 0) || (latestNet < 0 && previousNet > 0)) {
            flips.push({
              asset,
              from: previousNet > 0 ? "Long" : "Short",
              to: latestNet > 0 ? "Long" : "Short",
              date: latest.report_date,
            })
          }
        }
      })

      setPositionFlips(flips)
    } catch (err: any) {
      console.error("Failed to fetch position flips:", err)
    }
  }

  const fetchOpenInterestChanges = async () => {
    try {
      const { data: allData, error } = await supabase
        .from("cftc_data_combined")
        .select("contract_market_name, report_date, open_interest_all")
        .in("commodity_subgroup_name", [
        "CURRENCY",
        "CURRENCY(NON-MAJOR)",
        "OTHER FINANCIAL INSTRUMENTS",
         ])
        .order("report_date", { ascending: false })

      if (error) throw error

      const assetMap: any = {}
      allData.forEach((row: any) => {
        if (!assetMap[row.contract_market_name]) {
          assetMap[row.contract_market_name] = []
        }
        assetMap[row.contract_market_name].push(row)
      })

      const changes: any = {}
      Object.entries(assetMap).forEach(([asset, records]: [string, any]) => {
        if (records.length >= 2) {
          const latest = records[0]
          const previous = records[1]
          const change = latest.open_interest_all - previous.open_interest_all
          const percentChange =
            previous.open_interest_all > 0 ? ((change / previous.open_interest_all) * 100).toFixed(2) : 0

          changes[asset] = {
            current: latest.open_interest_all,
            previous: previous.open_interest_all,
            change,
            percentChange: Number(percentChange),
          }
        }
      })

      setOpenInterestChanges(changes)
    } catch (err: any) {
      console.error("Failed to fetch open interest changes:", err)
    }
  }

  const fetchRankingData = async () => {
    try {
      const { data: allAssets, error } = await supabase
        .from("cftc_data_combined")
        .select(
          "contract_market_name, report_date, dealer_positions_long_all, dealer_positions_short_all, asset_mgr_positions_long, asset_mgr_positions_short, lev_money_positions_long, lev_money_positions_short, open_interest_all",
        )
        .in("commodity_subgroup_name", [
        "CURRENCY",
        "CURRENCY(NON-MAJOR)",
        "OTHER FINANCIAL INSTRUMENTS",
      ])
        .order("report_date", { ascending: false })

      if (error) throw error

      const latestByAsset: any = {}
      allAssets.forEach((row: any) => {
        if (!latestByAsset[row.contract_market_name]) {
          latestByAsset[row.contract_market_name] = row
        }
      })

      const rankings = Object.entries(latestByAsset).map(([name, data]: [string, any]) => {
        const dealerNet = (data.dealer_positions_long_all || 0) - (data.dealer_positions_short_all || 0)
        const assetMgrNet = (data.asset_mgr_positions_long || 0) - (data.asset_mgr_positions_short || 0)
        const levMoneyNet = (data.lev_money_positions_long || 0) - (data.lev_money_positions_short || 0)

        const totalLong =
          (data.dealer_positions_long_all || 0) +
          (data.asset_mgr_positions_long || 0) +
          (data.lev_money_positions_long || 0)
        const totalShort =
          (data.dealer_positions_short_all || 0) +
          (data.asset_mgr_positions_short || 0) +
          (data.lev_money_positions_short || 0)
        const netPosition = totalLong - totalShort
        const netPercentage = totalLong + totalShort > 0 ? (netPosition / (totalLong + totalShort)) * 100 : 0

        return {
          asset: name,
          netPercentage: Math.round(netPercentage),
          netPosition,
          sentiment: netPercentage > 0 ? "Long" : "Short",
          absNetPercentage: Math.abs(Math.round(netPercentage)),
        }
      })

      rankings.sort((a, b) => Math.abs(b.netPercentage) - Math.abs(a.netPercentage))
      setRankingData(rankings.slice(0, 15))
    } catch (err: any) {
      console.error("Failed to fetch ranking data:", err)
    }
  }

  const fetchAvailableAssets = async () => {
    try {
      const { data: assets, error } = await supabase
        .from("unique_contract_markets")
        .select("contract_market_name")
        .in("commodity_subgroup_name", [
        "CURRENCY",
        "CURRENCY(NON-MAJOR)",
        "OTHER FINANCIAL INSTRUMENTS",
      ])
        .order("contract_market_name")

      if (error) throw error

      const uniqueAssets = assets.map((a: any) => a.contract_market_name).filter(Boolean) as string[]
      setAvailableAssets(uniqueAssets)

      if (uniqueAssets.length > 0) {
        setAsset1(uniqueAssets[0])
        setAsset2(uniqueAssets[1] || uniqueAssets[0])
      }
    } catch (err: any) {
      setError(`Failed to fetch assets: ${err.message}`)
      setLoading(false)
    }
  }

  const fetchAssetData = async (assetName: string) => {
    try {
      setLoading(true)

      const { data: latestData, error: latestError } = await supabase
        .from("cftc_data_combined")
        .select("*")
        .eq("contract_market_name", assetName)
        .order("report_date", { ascending: false })
        .limit(1)
        .single()

      if (latestError) throw latestError

      const { data: historyData, error: historyError } = await supabase
        .from("cftc_data_combined")
        .select(
          "report_date, dealer_positions_long_all, dealer_positions_short_all, asset_mgr_positions_long, asset_mgr_positions_short, lev_money_positions_long, lev_money_positions_short, open_interest_all",
        )
        .eq("contract_market_name", assetName)
        .order("report_date", { ascending: true })
        .limit(12)

      if (historyError) throw historyError

      const formattedHistory = historyData.map((d: any) => ({
        date: d.report_date,
        dealer_net: (d.dealer_positions_long_all || 0) - (d.dealer_positions_short_all || 0),
        asset_mgr_net: (d.asset_mgr_positions_long || 0) - (d.asset_mgr_positions_short || 0),
        lev_money_net: (d.lev_money_positions_long || 0) - (d.lev_money_positions_short || 0),
        open_interest: d.open_interest_all || 0,
      }))

      setData((prev: any) => ({
        ...prev,
        [assetName]: {
          latest: {
            report_date: latestData.report_date,
            open_interest_all: latestData.open_interest_all || 0,
            dealer_long: latestData.dealer_positions_long_all || 0,
            dealer_short: latestData.dealer_positions_short_all || 0,
            asset_mgr_long: latestData.asset_mgr_positions_long || 0,
            asset_mgr_short: latestData.asset_mgr_positions_short || 0,
            lev_money_long: latestData.lev_money_positions_long || 0,
            lev_money_short: latestData.lev_money_positions_short || 0,
            other_long: latestData.other_rept_positions_long || 0,
            other_short: latestData.other_rept_positions_short || 0,
            nonrept_long: latestData.nonrept_positions_long_all || 0,
            nonrept_short: latestData.nonrept_positions_short_all || 0,
          },
          history: formattedHistory,
        },
      }))

      setLoading(false)
    } catch (err: any) {
      setError(`Failed to fetch data for ${assetName}: ${err.message}`)
      setLoading(false)
    }
  }

  const getTraderTypeData = (assetData: any, traderType: string) => {
    if (!assetData) return []
    const latest = assetData.latest

    let longVal = 0,
      shortVal = 0

    switch (traderType) {
      case "dealer":
        longVal = latest.dealer_long
        shortVal = latest.dealer_short
        break
      case "assetMgr":
        longVal = latest.asset_mgr_long
        shortVal = latest.asset_mgr_short
        break
      case "levMoney":
        longVal = latest.lev_money_long
        shortVal = latest.lev_money_short
        break
    }

    return [
      { name: "Long", value: longVal, fill: "#10b981" },
      { name: "Short", value: shortVal, fill: "#ef4444" },
    ]
  }

  const getNetPercentage = (assetData: any, traderType: string) => {
    if (!assetData) return 0
    const latest = assetData.latest

    let longVal = 0,
      shortVal = 0

    switch (traderType) {
      case "dealer":
        longVal = latest.dealer_long
        shortVal = latest.dealer_short
        break
      case "assetMgr":
        longVal = latest.asset_mgr_long
        shortVal = latest.asset_mgr_short
        break
      case "levMoney":
        longVal = latest.lev_money_long
        shortVal = latest.lev_money_short
        break
    }

    const total = longVal + shortVal
    if (total === 0) return 0

    const netPosition = longVal - shortVal
    return Math.round((netPosition / total) * 100)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">{payload[0].value.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  const getNetPositions = (assetData: any) => {
    if (!assetData) return []
    const latest = assetData.latest
    return [
      {
        category: "Dealer",
        net: latest.dealer_long - latest.dealer_short,
        long: latest.dealer_long,
        short: latest.dealer_short,
      },
      {
        category: "Asset Manager",
        net: latest.asset_mgr_long - latest.asset_mgr_short,
        long: latest.asset_mgr_long,
        short: latest.asset_mgr_short,
      },
      {
        category: "Leveraged Money",
        net: latest.lev_money_long - latest.lev_money_short,
        long: latest.lev_money_long,
        short: latest.lev_money_short,
      },
      {
        category: "Other Reportable",
        net: latest.other_long - latest.other_short,
        long: latest.other_long,
        short: latest.other_short,
      },
      {
        category: "Non-Reportable",
        net: latest.nonrept_long - latest.nonrept_short,
        long: latest.nonrept_long,
        short: latest.nonrept_short,
      },
    ]
  }

  const AssetPanel = ({ asset, side }: { asset: string; side: string }) => {
    const assetData = data[asset]
    if (!assetData) return <div className="text-center py-8">Loading {asset} data...</div>

    const dealerData = getTraderTypeData(assetData, "dealer")
    const assetMgrData = getTraderTypeData(assetData, "assetMgr")
    const levMoneyData = getTraderTypeData(assetData, "levMoney")
    const netPositions = getNetPositions(assetData)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">{asset}</h3>
          <Select value={asset} onValueChange={side === "left" ? setAsset1 : setAsset2}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableAssets.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Open Interest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{assetData.latest.open_interest_all.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total contracts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Report Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{assetData.latest.report_date}</div>
              <p className="text-xs text-muted-foreground">Latest update</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="w-4 h-4" />
              Trader Positions (Long vs Short)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <h4 className="text-center font-semibold mb-3 text-sm">Dealers</h4>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={dealerData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      fillOpacity={0.5}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            const netPct = getNetPercentage(assetData, "dealer")
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="text-2xl font-bold fill-primary">
                                  {netPct}%
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  className="fill-muted-foreground text-xs"
                                >
                                  Net {netPct >= 0 ? "Long" : "Short"}
                                </tspan>
                              </text>
                            )
                          }
                          return null
                        }}
                      />
                      {dealerData.map((entry: any, i: number) => (
                        <Cell key={`cell-${i}`} fill={entry.fill} stroke={entry.fill} strokeWidth={1.5} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col items-center">
                <h4 className="text-center font-semibold mb-3 text-sm">Asset Managers</h4>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={assetMgrData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      fillOpacity={0.5}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            const netPct = getNetPercentage(assetData, "assetMgr")
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="text-2xl font-bold fill-primary">
                                  {netPct}%
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  className="fill-muted-foreground text-xs"
                                >
                                  Net {netPct >= 0 ? "Long" : "Short"}
                                </tspan>
                              </text>
                            )
                          }
                          return null
                        }}
                      />
                      {assetMgrData.map((entry: any, i: number) => (
                        <Cell key={`cell-${i}`} fill={entry.fill} stroke={entry.fill} strokeWidth={1.5} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col items-center">
                <h4 className="text-center font-semibold mb-3 text-sm">Leveraged Funds</h4>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={levMoneyData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      fillOpacity={0.5}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            const netPct = getNetPercentage(assetData, "levMoney")
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="text-2xl font-bold fill-primary">
                                  {netPct}%
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  className="fill-muted-foreground text-xs"
                                >
                                  Net {netPct >= 0 ? "Long" : "Short"}
                                </tspan>
                              </text>
                            )
                          }
                          return null
                        }}
                      />
                      {levMoneyData.map((entry: any, i: number) => (
                        <Cell key={`cell-${i}`} fill={entry.fill} stroke={entry.fill} strokeWidth={1.5} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Net Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {netPositions.map((pos) => (
                <div key={pos.category} className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                  <div className="font-medium">{pos.category}</div>
                  <div className="text-right text-green-600">{pos.long.toLocaleString()}</div>
                  <div className="text-right text-red-600">{pos.short.toLocaleString()}</div>
                  <div className="text-right">
                    <span
                      className={`flex items-center justify-end gap-1 ${pos.net >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {pos.net >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(pos.net).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Net Position Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={assetData.history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="dealer_net"
                  stackId="1"
                  stroke={COLORS.dealer}
                  fill={COLORS.dealer}
                  name="Dealer"
                />
                <Area
                  type="monotone"
                  dataKey="asset_mgr_net"
                  stackId="2"
                  stroke={COLORS.assetMgr}
                  fill={COLORS.assetMgr}
                  name="Asset Mgr"
                />
                <Area
                  type="monotone"
                  dataKey="lev_money_net"
                  stackId="3"
                  stroke={COLORS.levMoney}
                  fill={COLORS.levMoney}
                  name="Lev Money"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={assetData.history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="open_interest" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading || availableAssets.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading COT Data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-8xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Commitment of Traders</h1>
            <p className="text-muted-foreground mt-1">Compare trader positions across assets</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="comparison">View Details</TabsTrigger>
            <TabsTrigger value="single">Single View</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Top Trading Opportunities Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Top Trading Opportunities
                  </CardTitle>
                  <CardDescription>Top 15 assets ranked by net position strength</CardDescription>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto">
                  {rankingData.map((r, idx) => (
                    <div
                      key={r.asset}
                      className="flex justify-between items-center border-b py-2 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-6">#{idx + 1}</span>
                        <span className="font-medium">{r.asset}</span>
                      </div>
                      <span
                        className={`font-semibold flex items-center gap-1 ${r.sentiment === "Long" ? "text-green-600" : "text-red-600"}`}
                      >
                        {r.sentiment === "Long" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {r.netPercentage}%
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Position Flips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Recent Position Flips
                  </CardTitle>
                  <CardDescription>Assets that changed sentiment recently</CardDescription>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto">
                  {positionFlips.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No flips in the last 4 weeks</div>
                  ) : (
                    positionFlips.map((flip) => (
                      <div key={flip.asset} className="border-b py-2 text-sm">
                        <div className="font-medium">{flip.asset}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className={flip.from === "Long" ? "text-green-600" : "text-red-600"}>{flip.from}</span>
                          <span>→</span>
                          <span className={flip.to === "Long" ? "text-green-600" : "text-red-600"}>{flip.to}</span>
                          <span className="ml-auto">{flip.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Open Interest Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Open Interest Changes
                  </CardTitle>
                  <CardDescription>Week-over-week changes in open interest</CardDescription>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto">
                  {Object.entries(openInterestChanges)
                    .slice(0, 15)
                    .map(([asset, change]: [string, any]) => (
                      <div key={asset} className="border-b py-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{asset}</span>
                          <span
                            className={`font-semibold flex items-center gap-1 ${change.change >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {change.change >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {change.percentChange}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {change.current.toLocaleString()} ({change.change >= 0 ? "+" : ""}
                          {change.change.toLocaleString()})
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>

            {/* Market Sentiment Snapshot Card */}
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Market Sentiment Snapshot
                  </CardTitle>
                  <CardDescription>Aggregated market overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {rankingData.filter((r) => r.sentiment === "Long").length}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Assets Net Long</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {rankingData.filter((r) => r.sentiment === "Short").length}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Assets Net Short</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {rankingData.length > 0 ? rankingData[0].asset : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Strongest Position</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AssetPanel asset={asset1} side="left" />
              <AssetPanel asset={asset2} side="right" />
            </div>
          </TabsContent>

          <TabsContent value="single">
            <div className="max-w-3xl mx-auto">
              <AssetPanel asset={asset1} side="left" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
