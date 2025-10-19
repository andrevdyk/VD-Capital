"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { TrendingUp, TrendingDown, Scale, AlertCircle } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { OverviewTab } from "./components/overview-tab"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const SUPABASE_URL = "https://nobtgazxiggvkrwxugpq.supabase.co"
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vYnRnYXp4aWdndmtyd3h1Z3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2Nzk5OTIsImV4cCI6MjA0MjI1NTk5Mn0.SWmzkATJ5uUNhCrFdXB-FeCEL3wcVk6p_eDqXpOD-qg"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const COLORS = {
  dealer: "#03b198",
  assetMgr: "#ff2f67",
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
  const [allAssetsData, setAllAssetsData] = useState<any[]>([])
  const [historicalVolatilityData, setHistoricalVolatilityData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAvailableAssets()
    fetchRankingData()
    fetchPositionFlips()
    fetchOpenInterestChanges()
    fetchAllAssetsData()
    fetchHistoricalVolatilityData()
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
        .in("commodity_subgroup_name", ["CURRENCY", "CURRENCY(NON-MAJOR)", "OTHER FINANCIAL INSTRUMENTS"])
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
        .in("commodity_subgroup_name", ["CURRENCY", "CURRENCY(NON-MAJOR)", "OTHER FINANCIAL INSTRUMENTS"])
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
        .in("commodity_subgroup_name", ["CURRENCY", "CURRENCY(NON-MAJOR)", "OTHER FINANCIAL INSTRUMENTS"])
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
        .in("commodity_subgroup_name", ["CURRENCY", "CURRENCY(NON-MAJOR)", "OTHER FINANCIAL INSTRUMENTS"])
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
    if (!assetData || !assetData.history || assetData.history.length < 2) {
      // Return basic data without changes if history is not available
      const latest = assetData?.latest
      if (!latest) return []

      return [
        {
          category: "Dealer",
          net: latest.dealer_long - latest.dealer_short,
          long: latest.dealer_long,
          short: latest.dealer_short,
          longChange: 0,
          longChangePct: 0,
          shortChange: 0,
          shortChangePct: 0,
        },
        {
          category: "Asset Manager",
          net: latest.asset_mgr_long - latest.asset_mgr_short,
          long: latest.asset_mgr_long,
          short: latest.asset_mgr_short,
          longChange: 0,
          longChangePct: 0,
          shortChange: 0,
          shortChangePct: 0,
        },
        {
          category: "Leveraged Money",
          net: latest.lev_money_long - latest.lev_money_short,
          long: latest.lev_money_long,
          short: latest.lev_money_short,
          longChange: 0,
          longChangePct: 0,
          shortChange: 0,
          shortChangePct: 0,
        },
        {
          category: "Other Reportable",
          net: latest.other_long - latest.other_short,
          long: latest.other_long,
          short: latest.other_short,
          longChange: 0,
          longChangePct: 0,
          shortChange: 0,
          shortChangePct: 0,
        },
        {
          category: "Non-Reportable",
          net: latest.nonrept_long - latest.nonrept_short,
          long: latest.nonrept_long,
          short: latest.nonrept_short,
          longChange: 0,
          longChangePct: 0,
          shortChange: 0,
          shortChangePct: 0,
        },
      ]
    }

    const latest = assetData.latest
    const history = assetData.history
    const previous = history[history.length - 2] // Get second to last for comparison

    // Calculate dealer changes
    const dealerLongPrev = previous.dealer_long || latest.dealer_long
    const dealerShortPrev = previous.dealer_short || latest.dealer_short
    const dealerLongChange = latest.dealer_long - dealerLongPrev
    const dealerShortChange = latest.dealer_short - dealerShortPrev
    const dealerLongChangePct = dealerLongPrev !== 0 ? (dealerLongChange / dealerLongPrev) * 100 : 0
    const dealerShortChangePct = dealerShortPrev !== 0 ? (dealerShortChange / dealerShortPrev) * 100 : 0

    // Calculate asset manager changes
    const assetMgrLongPrev = previous.asset_mgr_long || latest.asset_mgr_long
    const assetMgrShortPrev = previous.asset_mgr_short || latest.asset_mgr_short
    const assetMgrLongChange = latest.asset_mgr_long - assetMgrLongPrev
    const assetMgrShortChange = latest.asset_mgr_short - assetMgrShortPrev
    const assetMgrLongChangePct = assetMgrLongPrev !== 0 ? (assetMgrLongChange / assetMgrLongPrev) * 100 : 0
    const assetMgrShortChangePct = assetMgrShortPrev !== 0 ? (assetMgrShortChange / assetMgrShortPrev) * 100 : 0

    // Calculate leveraged money changes
    const levMoneyLongPrev = previous.lev_money_long || latest.lev_money_long
    const levMoneyShortPrev = previous.lev_money_short || latest.lev_money_short
    const levMoneyLongChange = latest.lev_money_long - levMoneyLongPrev
    const levMoneyShortChange = latest.lev_money_short - levMoneyShortPrev
    const levMoneyLongChangePct = levMoneyLongPrev !== 0 ? (levMoneyLongChange / levMoneyLongPrev) * 100 : 0
    const levMoneyShortChangePct = levMoneyShortPrev !== 0 ? (levMoneyShortChange / levMoneyShortPrev) * 100 : 0

    // Calculate other reportable changes
    const otherLongPrev = previous.other_long || latest.other_long
    const otherShortPrev = previous.other_short || latest.other_short
    const otherLongChange = latest.other_long - otherLongPrev
    const otherShortChange = latest.other_short - otherShortPrev
    const otherLongChangePct = otherLongPrev !== 0 ? (otherLongChange / otherLongPrev) * 100 : 0
    const otherShortChangePct = otherShortPrev !== 0 ? (otherShortChange / otherShortPrev) * 100 : 0

    // Calculate non-reportable changes
    const nonreptLongPrev = previous.nonrept_long || latest.nonrept_long
    const nonreptShortPrev = previous.nonrept_short || latest.nonrept_short
    const nonreptLongChange = latest.nonrept_long - nonreptLongPrev
    const nonreptShortChange = latest.nonrept_short - nonreptShortPrev
    const nonreptLongChangePct = nonreptLongPrev !== 0 ? (nonreptLongChange / nonreptLongPrev) * 100 : 0
    const nonreptShortChangePct = nonreptShortPrev !== 0 ? (nonreptShortChange / nonreptShortPrev) * 100 : 0

    return [
      {
        category: "Dealer",
        net: latest.dealer_long - latest.dealer_short,
        long: latest.dealer_long,
        short: latest.dealer_short,
        longChange: dealerLongChange,
        longChangePct: dealerLongChangePct,
        shortChange: dealerShortChange,
        shortChangePct: dealerShortChangePct,
      },
      {
        category: "Asset Manager",
        net: latest.asset_mgr_long - latest.asset_mgr_short,
        long: latest.asset_mgr_long,
        short: latest.asset_mgr_short,
        longChange: assetMgrLongChange,
        longChangePct: assetMgrLongChangePct,
        shortChange: assetMgrShortChange,
        shortChangePct: assetMgrShortChangePct,
      },
      {
        category: "Leveraged Money",
        net: latest.lev_money_long - latest.lev_money_short,
        long: latest.lev_money_long,
        short: latest.lev_money_short,
        longChange: levMoneyLongChange,
        longChangePct: levMoneyLongChangePct,
        shortChange: levMoneyShortChange,
        shortChangePct: levMoneyShortChangePct,
      },
      {
        category: "Other Reportable",
        net: latest.other_long - latest.other_short,
        long: latest.other_long,
        short: latest.other_short,
        longChange: otherLongChange,
        longChangePct: otherLongChangePct,
        shortChange: otherShortChange,
        shortChangePct: otherShortChangePct,
      },
      {
        category: "Non-Reportable",
        net: latest.nonrept_long - latest.nonrept_short,
        long: latest.nonrept_long,
        short: latest.nonrept_short,
        longChange: nonreptLongChange,
        longChangePct: nonreptLongChangePct,
        shortChange: nonreptShortChange,
        shortChangePct: nonreptShortChangePct,
      },
    ]
  }

  const formatChange = (change: number) => {
    if (change === 0) return "0"
    const sign = change > 0 ? "+" : ""
    return `${sign}${change.toLocaleString()}`
  }

  const formatPercent = (pct: number) => {
    if (pct === 0) return "(0%)"
    const sign = pct > 0 ? "+" : ""
    return `(${sign}${pct.toFixed(1)}%)`
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs text-right">Longs</TableHead>
                  <TableHead className="text-xs text-right">Shorts</TableHead>
                  <TableHead className="text-xs text-right">Net Position</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {netPositions.map((pos) => (
                  <TableRow key={pos.category}>
                    <TableCell className="font-medium text-xs">{pos.category}</TableCell>

                    {/* Longs */}
                    <TableCell className="text-right text-xs">
                      <div>{pos.long.toLocaleString()}</div>
                      <div className="text-muted-foreground text-[10px]">
                        {formatChange(pos.longChange)} {formatPercent(pos.longChangePct)}
                      </div>
                    </TableCell>

                    {/* Shorts */}
                    <TableCell className="text-right text-xs">
                      <div>{pos.short.toLocaleString()}</div>
                      <div className="text-muted-foreground text-[10px]">
                        {formatChange(pos.shortChange)} {formatPercent(pos.shortChangePct)}
                      </div>
                    </TableCell>

                    {/* Net Position */}
                    <TableCell className="text-right text-xs">
                      <span
                        className={`flex items-center justify-end gap-1 ${
                          pos.net >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {pos.net >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(pos.net).toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Net Position Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={assetData.history}>
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
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="open_interest" stroke="#8500eb" fill="#8500eb" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fetchAllAssetsData = async () => {
    try {
      const { data: allData, error } = await supabase
        .from("cftc_data_combined")
        .select(
          "contract_market_name, report_date, dealer_positions_long_all, dealer_positions_short_all, asset_mgr_positions_long, asset_mgr_positions_short, lev_money_positions_long, lev_money_positions_short",
        )
        .in("commodity_subgroup_name", ["CURRENCY", "CURRENCY(NON-MAJOR)", "OTHER FINANCIAL INSTRUMENTS"])
        .order("report_date", { ascending: false })

      if (error) throw error

      // Group by asset
      const assetMap: any = {}
      allData.forEach((row: any) => {
        if (!assetMap[row.contract_market_name]) {
          assetMap[row.contract_market_name] = []
        }
        assetMap[row.contract_market_name].push(row)
      })

      // Calculate net positions and changes
      const assetsWithChanges = Object.entries(assetMap)
        .map(([asset, records]: [string, any]) => {
          if (records.length < 2) return null

          const latest = records[0]
          const previous = records[1]

          const dealerNetLatest = (latest.dealer_positions_long_all || 0) - (latest.dealer_positions_short_all || 0)
          const dealerNetPrevious =
            (previous.dealer_positions_long_all || 0) - (previous.dealer_positions_short_all || 0)
          const dealerChange =
            dealerNetPrevious !== 0 ? ((dealerNetLatest - dealerNetPrevious) / Math.abs(dealerNetPrevious)) * 100 : 0

          const assetMgrNetLatest = (latest.asset_mgr_positions_long || 0) - (latest.asset_mgr_positions_short || 0)
          const assetMgrNetPrevious =
            (previous.asset_mgr_positions_long || 0) - (previous.asset_mgr_positions_short || 0)
          const assetMgrChange =
            assetMgrNetPrevious !== 0
              ? ((assetMgrNetLatest - assetMgrNetPrevious) / Math.abs(assetMgrNetPrevious)) * 100
              : 0

          const levMoneyNetLatest = (latest.lev_money_positions_long || 0) - (latest.lev_money_positions_short || 0)
          const levMoneyNetPrevious =
            (previous.lev_money_positions_long || 0) - (previous.lev_money_positions_short || 0)
          const levMoneyChange =
            levMoneyNetPrevious !== 0
              ? ((levMoneyNetLatest - levMoneyNetPrevious) / Math.abs(levMoneyNetPrevious)) * 100
              : 0

          const levMoneyTotal = (latest.lev_money_positions_long || 0) + (latest.lev_money_positions_short || 0)

          return {
            asset,
            dealerNet: dealerNetLatest,
            dealerChange,
            assetMgrNet: assetMgrNetLatest,
            assetMgrChange,
            levMoneyNet: levMoneyNetLatest,
            levMoneyChange,
            levMoneyTotal,
          }
        })
        .filter(Boolean)

      setAllAssetsData(assetsWithChanges)
    } catch (err: any) {
      console.error("Failed to fetch all assets data:", err)
    }
  }

  const fetchHistoricalVolatilityData = async () => {
    try {
      const { data: allData, error } = await supabase
        .from("cftc_data_combined")
        .select(
          "contract_market_name, report_date, open_interest_all, dealer_positions_long_all, dealer_positions_short_all, asset_mgr_positions_long, asset_mgr_positions_short, lev_money_positions_long, lev_money_positions_short",
        )
        .in("commodity_subgroup_name", ["CURRENCY", "CURRENCY(NON-MAJOR)", "OTHER FINANCIAL INSTRUMENTS"])
        .order("report_date", { ascending: true })
        .limit(500)

      if (error) throw error

      // Group by asset and calculate changes
      const assetMap: any = {}
      allData.forEach((row: any) => {
        if (!assetMap[row.contract_market_name]) {
          assetMap[row.contract_market_name] = []
        }
        assetMap[row.contract_market_name].push(row)
      })

      const volatilityData: any[] = []
      Object.entries(assetMap).forEach(([asset, records]: [string, any]) => {
        for (let i = 1; i < records.length; i++) {
          const current = records[i]
          const previous = records[i - 1]

          const currentOI = current.open_interest_all || 0
          const previousOI = previous.open_interest_all || 0
          const oiChangePct = previousOI !== 0 ? ((currentOI - previousOI) / previousOI) * 100 : 0

          const currentNetPos =
            (current.dealer_positions_long_all || 0) +
            (current.asset_mgr_positions_long || 0) +
            (current.lev_money_positions_long || 0) -
            ((current.dealer_positions_short_all || 0) +
              (current.asset_mgr_positions_short || 0) +
              (current.lev_money_positions_short || 0))

          const previousNetPos =
            (previous.dealer_positions_long_all || 0) +
            (previous.asset_mgr_positions_long || 0) +
            (previous.lev_money_positions_long || 0) -
            ((previous.dealer_positions_short_all || 0) +
              (previous.asset_mgr_positions_short || 0) +
              (previous.lev_money_positions_short || 0))

          const positionChangePct =
            previousNetPos !== 0 ? ((currentNetPos - previousNetPos) / Math.abs(previousNetPos)) * 100 : 0

          volatilityData.push({
            asset,
            date: current.report_date,
            openInterest: currentOI,
            netPosition: currentNetPos,
            oiChangePct,
            positionChangePct,
          })
        }
      })

      setHistoricalVolatilityData(volatilityData)
    } catch (err: any) {
      console.error("Failed to fetch historical volatility data:", err)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading || availableAssets.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
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
            <OverviewTab allAssetsData={allAssetsData} historicalData={historicalVolatilityData} />
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
