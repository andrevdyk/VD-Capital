"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { OverviewTab } from "./components/overview-tab"
import { AssetDetail } from "./components/asset-detail"

const SUPABASE_URL = "https://nobtgazxiggvkrwxugpq.supabase.co"
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vYnRnYXp4aWdndmtyd3h1Z3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2Nzk5OTIsImV4cCI6MjA0MjI1NTk5Mn0.SWmzkATJ5uUNhCrFdXB-FeCEL3wcVk6p_eDqXpOD-qg"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default function COTDashboard() {
  const [selectedDetailAsset, setSelectedDetailAsset] = useState<string | null>(null)
  const [availableAssets, setAvailableAssets] = useState<string[]>([])
  const [assetDataCache, setAssetDataCache] = useState<any>({})
  const [allAssetsData, setAllAssetsData] = useState<any[]>([])
  const [commoditiesData, setCommoditiesData] = useState<any[]>([])
  const [historicalVolatilityData, setHistoricalVolatilityData] = useState<any[]>([])
  const [latestReportDate, setLatestReportDate] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAvailableAssets()
    fetchAllAssetsData()
    fetchCommoditiesData()
    fetchHistoricalVolatilityData()
  }, [])

  // Load asset detail data on demand
  useEffect(() => {
    if (selectedDetailAsset && !assetDataCache[selectedDetailAsset]) {
      fetchAssetData(selectedDetailAsset)
    }
  }, [selectedDetailAsset])

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
    } catch (err: any) {
      setError(`Failed to fetch assets: ${err.message}`)
      setLoading(false)
    }
  }

  const fetchAssetData = async (assetName: string) => {
    try {
      setDetailLoading(true)

      const { data: latestData, error: latestError } = await supabase
        .from("cftc_data_combined")
        .select("*")
        .eq("contract_market_name", assetName)
        .order("report_date", { ascending: false })
        .limit(1)
        .single()

      if (latestError) throw latestError

      // Fetch the 52 most recent weeks — fetch descending so LIMIT takes newest, then reverse to chronological
      const { data: historyDataDesc, error: historyError } = await supabase
        .from("cftc_data_combined")
        .select(
          "report_date, dealer_positions_long_all, dealer_positions_short_all, asset_mgr_positions_long, asset_mgr_positions_short, lev_money_positions_long, lev_money_positions_short, open_interest_all",
        )
        .eq("contract_market_name", assetName)
        .order("report_date", { ascending: false })
        .limit(52)
      // Reverse to chronological order (oldest → newest) for delta calculations
      const historyData = historyDataDesc ? [...historyDataDesc].reverse() : []

      if (historyError) throw historyError


      const formattedHistory = historyData.map((d: any) => ({
        date: d.report_date,
        dealer_net: (d.dealer_positions_long_all || 0) - (d.dealer_positions_short_all || 0),
        asset_mgr_net: (d.asset_mgr_positions_long || 0) - (d.asset_mgr_positions_short || 0),
        lev_money_net: (d.lev_money_positions_long || 0) - (d.lev_money_positions_short || 0),
        open_interest: d.open_interest_all || 0,
      }))

      setAssetDataCache((prev: any) => ({
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

      setDetailLoading(false)
    } catch (err: any) {
      console.error(`Failed to fetch data for ${assetName}:`, err)
      setDetailLoading(false)
    }
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

      // Capture the most recent report date
      if (allData.length > 0) {
        setLatestReportDate(allData[0].report_date)
      }

      const assetMap: any = {}
      allData.forEach((row: any) => {
        if (!assetMap[row.contract_market_name]) assetMap[row.contract_market_name] = []
        assetMap[row.contract_market_name].push(row)
      })

      const assetsWithChanges = Object.entries(assetMap)
        .map(([asset, records]: [string, any]) => {
          if (records.length < 2) return null
          const latest = records[0]
          const previous = records[1]

          const dealerNetLatest = (latest.dealer_positions_long_all || 0) - (latest.dealer_positions_short_all || 0)
          const dealerNetPrevious = (previous.dealer_positions_long_all || 0) - (previous.dealer_positions_short_all || 0)
          const dealerChange = dealerNetPrevious !== 0 ? ((dealerNetLatest - dealerNetPrevious) / Math.abs(dealerNetPrevious)) * 100 : 0

          const assetMgrNetLatest = (latest.asset_mgr_positions_long || 0) - (latest.asset_mgr_positions_short || 0)
          const assetMgrNetPrevious = (previous.asset_mgr_positions_long || 0) - (previous.asset_mgr_positions_short || 0)
          const assetMgrChange = assetMgrNetPrevious !== 0 ? ((assetMgrNetLatest - assetMgrNetPrevious) / Math.abs(assetMgrNetPrevious)) * 100 : 0

          const levMoneyNetLatest = (latest.lev_money_positions_long || 0) - (latest.lev_money_positions_short || 0)
          const levMoneyNetPrevious = (previous.lev_money_positions_long || 0) - (previous.lev_money_positions_short || 0)
          const levMoneyChange = levMoneyNetPrevious !== 0 ? ((levMoneyNetLatest - levMoneyNetPrevious) / Math.abs(levMoneyNetPrevious)) * 100 : 0
          const levMoneyTotal = (latest.lev_money_positions_long || 0) + (latest.lev_money_positions_short || 0)

          return { asset, dealerNet: dealerNetLatest, dealerChange, assetMgrNet: assetMgrNetLatest, assetMgrChange, levMoneyNet: levMoneyNetLatest, levMoneyChange, levMoneyTotal }
        })
        .filter(Boolean)

      setAllAssetsData(assetsWithChanges)
      setLoading(false)
    } catch (err: any) {
      console.error("Failed to fetch all assets data:", err)
      setLoading(false)
    }
  }

  const fetchCommoditiesData = async () => {
    try {
      const COMMODITY_SUBGROUPS = [
        "ENERGY AND PRODUCTS",
        "METALS AND PRECIOUS METALS",
        "GRAINS AND OILSEEDS",
        "LIVESTOCK AND PRODUCTS",
        "OTHER AGRICULTURAL PRODUCTS",
        "SOFTS",
        "AGRICULTURE",
        "METALS",
        "ENERGY",
      ]

      const { data: allData, error } = await supabase
        .from("cftc_data_combined")
        .select(
          "contract_market_name, report_date, dealer_positions_long_all, dealer_positions_short_all, asset_mgr_positions_long, asset_mgr_positions_short, lev_money_positions_long, lev_money_positions_short",
        )
        .in("commodity_subgroup_name", COMMODITY_SUBGROUPS)
        .order("report_date", { ascending: false })

      if (error) throw error
      if (!allData || allData.length === 0) return

      const assetMap: any = {}
      allData.forEach((row: any) => {
        if (!assetMap[row.contract_market_name]) assetMap[row.contract_market_name] = []
        assetMap[row.contract_market_name].push(row)
      })

      const result = Object.entries(assetMap)
        .map(([asset, records]: [string, any]) => {
          if (records.length < 2) return null
          const latest = records[0]
          const previous = records[1]

          const dealerNetLatest = (latest.dealer_positions_long_all || 0) - (latest.dealer_positions_short_all || 0)
          const dealerNetPrevious = (previous.dealer_positions_long_all || 0) - (previous.dealer_positions_short_all || 0)
          const dealerChange = dealerNetPrevious !== 0 ? ((dealerNetLatest - dealerNetPrevious) / Math.abs(dealerNetPrevious)) * 100 : 0

          const assetMgrNetLatest = (latest.asset_mgr_positions_long || 0) - (latest.asset_mgr_positions_short || 0)
          const assetMgrNetPrevious = (previous.asset_mgr_positions_long || 0) - (previous.asset_mgr_positions_short || 0)
          const assetMgrChange = assetMgrNetPrevious !== 0 ? ((assetMgrNetLatest - assetMgrNetPrevious) / Math.abs(assetMgrNetPrevious)) * 100 : 0

          const levMoneyNetLatest = (latest.lev_money_positions_long || 0) - (latest.lev_money_positions_short || 0)
          const levMoneyNetPrevious = (previous.lev_money_positions_long || 0) - (previous.lev_money_positions_short || 0)
          const levMoneyChange = levMoneyNetPrevious !== 0 ? ((levMoneyNetLatest - levMoneyNetPrevious) / Math.abs(levMoneyNetPrevious)) * 100 : 0
          const levMoneyTotal = (latest.lev_money_positions_long || 0) + (latest.lev_money_positions_short || 0)

          return { asset, dealerNet: dealerNetLatest, dealerChange, assetMgrNet: assetMgrNetLatest, assetMgrChange, levMoneyNet: levMoneyNetLatest, levMoneyChange, levMoneyTotal }
        })
        .filter(Boolean)

      setCommoditiesData(result)
    } catch (err: any) {
      console.error("Failed to fetch commodities data:", err)
    }
  }

  const fetchHistoricalVolatilityData = async () => {
    try {
      // Fetch descending so LIMIT takes the most recent records, then sort per-asset ascending
      const { data: allData, error } = await supabase
        .from("cftc_data_combined")
        .select(
          "contract_market_name, report_date, open_interest_all, dealer_positions_long_all, dealer_positions_short_all, asset_mgr_positions_long, asset_mgr_positions_short, lev_money_positions_long, lev_money_positions_short",
        )
        .in("commodity_subgroup_name", ["CURRENCY", "CURRENCY(NON-MAJOR)", "OTHER FINANCIAL INSTRUMENTS"])
        .order("report_date", { ascending: false })
        .limit(5000)

      if (error) throw error

      const assetMap: any = {}
      allData.forEach((row: any) => {
        if (!assetMap[row.contract_market_name]) assetMap[row.contract_market_name] = []
        assetMap[row.contract_market_name].push(row)
      })

      // Sort each asset's records chronologically (oldest → newest) before computing deltas
      Object.keys(assetMap).forEach((asset) => {
        assetMap[asset].sort(
          (a: any, b: any) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime()
        )
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
            (current.dealer_positions_long_all || 0) + (current.asset_mgr_positions_long || 0) + (current.lev_money_positions_long || 0) -
            ((current.dealer_positions_short_all || 0) + (current.asset_mgr_positions_short || 0) + (current.lev_money_positions_short || 0))

          const previousNetPos =
            (previous.dealer_positions_long_all || 0) + (previous.asset_mgr_positions_long || 0) + (previous.lev_money_positions_long || 0) -
            ((previous.dealer_positions_short_all || 0) + (previous.asset_mgr_positions_short || 0) + (previous.lev_money_positions_short || 0))

          const positionChangePct = previousNetPos !== 0 ? ((currentNetPos - previousNetPos) / Math.abs(previousNetPos)) * 100 : 0

          const levMoneyNet = (current.lev_money_positions_long || 0) - (current.lev_money_positions_short || 0)
          volatilityData.push({ asset, date: current.report_date, openInterest: currentOI, netPosition: currentNetPos, levMoneyNet, oiChangePct, positionChangePct })
        }
      })

      setHistoricalVolatilityData(volatilityData)
    } catch (err: any) {
      console.error("Failed to fetch historical volatility data:", err)
    }
  }

  const handleSelectAsset = (asset: string) => {
    setSelectedDetailAsset(asset)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleBack = () => {
    setSelectedDetailAsset(null)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-muted-foreground">Loading COT Data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-8xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Commitment of Traders</h1>
              {latestReportDate && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground font-mono">
                  Latest: {latestReportDate}
                </span>
              )}
            </div>
            {selectedDetailAsset ? (
              <nav className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <button onClick={handleBack} className="hover:text-foreground transition-colors">
                  Overview
                </button>
                <span>/</span>
                <span className="text-foreground font-medium">{selectedDetailAsset}</span>
              </nav>
            ) : (
              <p className="text-muted-foreground mt-1 text-sm">
                CFTC positioning data — click any asset to drill into details
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        {selectedDetailAsset ? (
          <AssetDetail
            asset={selectedDetailAsset}
            assetData={assetDataCache[selectedDetailAsset]}
            allAssetsData={allAssetsData}
            historicalData={historicalVolatilityData}
            availableAssets={availableAssets}
            loading={detailLoading}
            onBack={handleBack}
            onChangeAsset={(asset) => {
              setSelectedDetailAsset(asset)
              if (!assetDataCache[asset]) fetchAssetData(asset)
            }}
          />
        ) : (
          <OverviewTab
            allAssetsData={allAssetsData}
            historicalData={historicalVolatilityData}
            commoditiesData={commoditiesData}
            onSelectAsset={handleSelectAsset}
          />
        )}
      </div>
    </div>
  )
}
