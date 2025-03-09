"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, Cell, Label, Pie, PieChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { BarChart3, AreaChartIcon as ChartArea, PieChartIcon, TableIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Update the interface to include new categories
interface CFTCData {
  report_date: string
  asset_mgr_positions_long: number
  asset_mgr_positions_short: number
  leveraged_funds_positions_long: number
  leveraged_funds_positions_short: number
  dealer_positions_long: number
  dealer_positions_short: number
  open_interest: number
  retail_sentiment_long: number
  retail_sentiment_short: number
  commodity_subgroup_name: string
  contract_market_name: string
}

interface CurrencyPair {
  base: string
  quote: string
  baseMarket: string
  quoteMarket: string
}

interface TimeSeriesData {
  date: string
  baseLong: number
  baseShort: number
  quoteLong: number
  quoteShort: number
}

// Mock time series data for area charts
const TIME_SERIES_DATA: Record<string, TimeSeriesData[]> = {
  "AUD/CAD": [
    { date: "Jan", baseLong: 18000, baseShort: 8000, quoteLong: 16000, quoteShort: 11000 },
    { date: "Feb", baseLong: 19000, baseShort: 7500, quoteLong: 16500, quoteShort: 10500 },
    { date: "Mar", baseLong: 18742, baseShort: 8765, quoteLong: 16453, quoteShort: 11234 },
    { date: "Apr", baseLong: 19500, baseShort: 8200, quoteLong: 17000, quoteShort: 10800 },
    { date: "May", baseLong: 20000, baseShort: 7800, quoteLong: 17500, quoteShort: 10400 },
  ],
  "EUR/USD": [
    { date: "Jan", baseLong: 30000, baseShort: 7000, quoteLong: 28000, quoteShort: 9000 },
    { date: "Feb", baseLong: 30500, baseShort: 7100, quoteLong: 29000, quoteShort: 9100 },
    { date: "Mar", baseLong: 31256, baseShort: 7234, quoteLong: 29874, quoteShort: 9123 },
    { date: "Apr", baseLong: 32000, baseShort: 7300, quoteLong: 30500, quoteShort: 9200 },
    { date: "May", baseLong: 32500, baseShort: 7400, quoteLong: 31000, quoteShort: 9300 },
  ],
  "GBP/JPY": [
    { date: "Jan", baseLong: 12000, baseShort: 6500, quoteLong: 14500, quoteShort: 5700 },
    { date: "Feb", baseLong: 12200, baseShort: 6600, quoteLong: 14600, quoteShort: 5750 },
    { date: "Mar", baseLong: 12453, baseShort: 6654, quoteLong: 14782, quoteShort: 5789 },
    { date: "Apr", baseLong: 12700, baseShort: 6700, quoteLong: 15000, quoteShort: 5800 },
    { date: "May", baseLong: 13000, baseShort: 6800, quoteLong: 15200, quoteShort: 5850 },
  ],
  "USD/CHF": [
    { date: "Jan", baseLong: 28000, baseShort: 9000, quoteLong: 10000, quoteShort: 4500 },
    { date: "Feb", baseLong: 28500, baseShort: 9100, quoteLong: 10100, quoteShort: 4550 },
    { date: "Mar", baseLong: 29874, baseShort: 9123, quoteLong: 10234, quoteShort: 4567 },
    { date: "Apr", baseLong: 30000, baseShort: 9200, quoteLong: 10300, quoteShort: 4600 },
    { date: "May", baseLong: 30500, baseShort: 9300, quoteLong: 10400, quoteShort: 4650 },
  ],
  "NZD/USD": [
    { date: "Jan", baseLong: 9500, baseShort: 3400, quoteLong: 28000, quoteShort: 9000 },
    { date: "Feb", baseLong: 9700, baseShort: 3450, quoteLong: 28500, quoteShort: 9100 },
    { date: "Mar", baseLong: 9876, baseShort: 3456, quoteLong: 29874, quoteShort: 9123 },
    { date: "Apr", baseLong: 10000, baseShort: 3500, quoteLong: 30000, quoteShort: 9200 },
    { date: "May", baseLong: 10200, baseShort: 3550, quoteLong: 30500, quoteShort: 9300 },
  ],
}

const CURRENCY_PAIRS: CurrencyPair[] = [
  { base: "AUD", quote: "CAD", baseMarket: "AUSTRALIAN DOLLAR", quoteMarket: "CANADIAN DOLLAR" },
  { base: "EUR", quote: "USD", baseMarket: "EURO FX", quoteMarket: "U.S. DOLLAR INDEX" },
  { base: "GBP", quote: "JPY", baseMarket: "BRITISH POUND", quoteMarket: "JAPANESE YEN" },
  { base: "USD", quote: "CHF", baseMarket: "U.S. DOLLAR INDEX", quoteMarket: "SWISS FRANC" },
  { base: "NZD", quote: "USD", baseMarket: "NEW ZEALAND DOLLAR", quoteMarket: "U.S. DOLLAR INDEX" },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const positionType = payload[0].name
    const volume = payload[0].value

    return (
      <div className="custom-tooltip grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-black px-2.5 py-1.5 text-xs shadow-xl">
        <p className="label font-semibold text-white">Positions</p>
        <div className="flex justify-between">
          <p className="desc text-gray-400" style={{ color: payload[0]?.color }}>
            {positionType}:
          </p>
          <p className="desc text-white">{volume.toLocaleString()}</p>
        </div>
      </div>
    )
  }

  return null
}

// Add historical net position data for the last year (monthly data)
const HISTORICAL_NET_POSITIONS: Record<
  string,
  Array<{ date: string; baseNetPosition: number; quoteNetPosition: number }>
> = {
  "AUD/CAD": [
    { date: "2023-06", baseNetPosition: -2500, quoteNetPosition: 1200 },
    { date: "2023-07", baseNetPosition: -1800, quoteNetPosition: 2300 },
    { date: "2023-08", baseNetPosition: -900, quoteNetPosition: 3100 },
    { date: "2023-09", baseNetPosition: 1200, quoteNetPosition: 4200 },
    { date: "2023-10", baseNetPosition: 3500, quoteNetPosition: 3800 },
    { date: "2023-11", baseNetPosition: 5200, quoteNetPosition: 2500 },
    { date: "2023-12", baseNetPosition: 6800, quoteNetPosition: 1200 },
    { date: "2024-01", baseNetPosition: 8200, quoteNetPosition: -800 },
    { date: "2024-02", baseNetPosition: 7500, quoteNetPosition: -1500 },
    { date: "2024-03", baseNetPosition: 9977, quoteNetPosition: -2100 },
    { date: "2024-04", baseNetPosition: 11300, quoteNetPosition: -1400 },
    { date: "2024-05", baseNetPosition: 12200, quoteNetPosition: 1900 },
  ],
  "EUR/USD": [
    { date: "2023-06", baseNetPosition: 15000, quoteNetPosition: -8500 },
    { date: "2023-07", baseNetPosition: 18200, quoteNetPosition: -9200 },
    { date: "2023-08", baseNetPosition: 21500, quoteNetPosition: -11000 },
    { date: "2023-09", baseNetPosition: 19800, quoteNetPosition: -12500 },
    { date: "2023-10", baseNetPosition: 16500, quoteNetPosition: -14200 },
    { date: "2023-11", baseNetPosition: 12200, quoteNetPosition: -15800 },
    { date: "2023-12", baseNetPosition: 8500, quoteNetPosition: -17500 },
    { date: "2024-01", baseNetPosition: 3200, quoteNetPosition: -19200 },
    { date: "2024-02", baseNetPosition: -2500, quoteNetPosition: -18500 },
    { date: "2024-03", baseNetPosition: -5800, quoteNetPosition: -16200 },
    { date: "2024-04", baseNetPosition: -3200, quoteNetPosition: -12800 },
    { date: "2024-05", baseNetPosition: 2500, quoteNetPosition: -9500 },
  ],
  "GBP/JPY": [
    { date: "2023-06", baseNetPosition: -3500, quoteNetPosition: 7200 },
    { date: "2023-07", baseNetPosition: -2800, quoteNetPosition: 8500 },
    { date: "2023-08", baseNetPosition: -1200, quoteNetPosition: 9800 },
    { date: "2023-09", baseNetPosition: 800, quoteNetPosition: 11200 },
    { date: "2023-10", baseNetPosition: 2500, quoteNetPosition: 9500 },
    { date: "2023-11", baseNetPosition: 4200, quoteNetPosition: 7800 },
    { date: "2023-12", baseNetPosition: 5800, quoteNetPosition: 5200 },
    { date: "2024-01", baseNetPosition: 7200, quoteNetPosition: 2500 },
    { date: "2024-02", baseNetPosition: 6500, quoteNetPosition: -800 },
    { date: "2024-03", baseNetPosition: 5799, quoteNetPosition: -2500 },
    { date: "2024-04", baseNetPosition: 6000, quoteNetPosition: -4200 },
    { date: "2024-05", baseNetPosition: 5200, quoteNetPosition: -5800 },
  ],
  "USD/CHF": [
    { date: "2023-06", baseNetPosition: 9500, quoteNetPosition: -4200 },
    { date: "2023-07", baseNetPosition: 11200, quoteNetPosition: -5800 },
    { date: "2023-08", baseNetPosition: 12800, quoteNetPosition: -7200 },
    { date: "2023-09", baseNetPosition: 14500, quoteNetPosition: -8500 },
    { date: "2023-10", baseNetPosition: 12200, quoteNetPosition: -9800 },
    { date: "2023-11", baseNetPosition: 9800, quoteNetPosition: -11200 },
    { date: "2023-12", baseNetPosition: 7200, quoteNetPosition: -12800 },
    { date: "2024-01", baseNetPosition: 4500, quoteNetPosition: -14500 },
    { date: "2024-02", baseNetPosition: 1800, quoteNetPosition: -12200 },
    { date: "2024-03", baseNetPosition: -1200, quoteNetPosition: -9800 },
    { date: "2024-04", baseNetPosition: -3500, quoteNetPosition: -7200 },
    { date: "2024-05", baseNetPosition: -5800, quoteNetPosition: -4500 },
  ],
  "NZD/USD": [
    { date: "2023-06", baseNetPosition: -7200, quoteNetPosition: 3500 },
    { date: "2023-07", baseNetPosition: -5800, quoteNetPosition: 5200 },
    { date: "2023-08", baseNetPosition: -4200, quoteNetPosition: 6800 },
    { date: "2023-09", baseNetPosition: -2500, quoteNetPosition: 8500 },
    { date: "2023-10", baseNetPosition: -800, quoteNetPosition: 6200 },
    { date: "2023-11", baseNetPosition: 1200, quoteNetPosition: 3800 },
    { date: "2023-12", baseNetPosition: 3500, quoteNetPosition: 1200 },
    { date: "2024-01", baseNetPosition: 5800, quoteNetPosition: -1500 },
    { date: "2024-02", baseNetPosition: 8200, quoteNetPosition: -3800 },
    { date: "2024-03", baseNetPosition: 6420, quoteNetPosition: -6200 },
    { date: "2024-04", baseNetPosition: 4800, quoteNetPosition: -8500 },
    { date: "2024-05", baseNetPosition: 3200, quoteNetPosition: -6800 },
  ],
}

export function CommitmentOfTraders() {
  const [data, setData] = React.useState<CFTCData[]>([])
  const [selectedPair, setSelectedPair] = React.useState<string>("AUD/CAD")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("Asset Managers")
  // Update the chartType state to include "bar" as an option
  const [chartType, setChartType] = React.useState<"donut" | "area" | "bar" | "table">("donut")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  // Add a new state to track the current filter selection
  const [barDataFilter, setBarDataFilter] = React.useState<"both" | "base" | "quote">("both")

  // Update the mock data to include open interest and retail sentiment
  const fetchCFTCData = async () => {
    try {
      // Simulate API fetch with mock data
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock data for demonstration
      const mockData: CFTCData[] = [
        {
          report_date: "2024-03-01",
          asset_mgr_positions_long: 18742,
          asset_mgr_positions_short: 8765,
          leveraged_funds_positions_long: 24567,
          leveraged_funds_positions_short: 12345,
          dealer_positions_long: 15621,
          dealer_positions_short: 5782,
          open_interest: 78500,
          retail_sentiment_long: 65,
          retail_sentiment_short: 35,
          commodity_subgroup_name: "CURRENCY",
          contract_market_name: "AUSTRALIAN DOLLAR",
        },
        {
          report_date: "2024-03-01",
          asset_mgr_positions_long: 16453,
          asset_mgr_positions_short: 11234,
          leveraged_funds_positions_long: 22345,
          leveraged_funds_positions_short: 14567,
          dealer_positions_long: 13456,
          dealer_positions_short: 7890,
          open_interest: 82400,
          retail_sentiment_long: 58,
          retail_sentiment_short: 42,
          commodity_subgroup_name: "CURRENCY",
          contract_market_name: "CANADIAN DOLLAR",
        },
        {
          report_date: "2024-03-01",
          asset_mgr_positions_long: 31256,
          asset_mgr_positions_short: 7234,
          leveraged_funds_positions_long: 28765,
          leveraged_funds_positions_short: 9876,
          dealer_positions_long: 27845,
          dealer_positions_short: 13210,
          open_interest: 124500,
          retail_sentiment_long: 72,
          retail_sentiment_short: 28,
          commodity_subgroup_name: "CURRENCY",
          contract_market_name: "EURO FX",
        },
        {
          report_date: "2024-03-01",
          asset_mgr_positions_long: 29874,
          asset_mgr_positions_short: 9123,
          leveraged_funds_positions_long: 26543,
          leveraged_funds_positions_short: 11234,
          dealer_positions_long: 26321,
          dealer_positions_short: 14532,
          open_interest: 118700,
          retail_sentiment_long: 45,
          retail_sentiment_short: 55,
          commodity_subgroup_name: "CURRENCY",
          contract_market_name: "U.S. DOLLAR INDEX",
        },
        {
          report_date: "2024-03-01",
          asset_mgr_positions_long: 12453,
          asset_mgr_positions_short: 6654,
          leveraged_funds_positions_long: 18965,
          leveraged_funds_positions_short: 8765,
          dealer_positions_long: 16782,
          dealer_positions_short: 10123,
          open_interest: 68400,
          retail_sentiment_long: 62,
          retail_sentiment_short: 38,
          commodity_subgroup_name: "CURRENCY",
          contract_market_name: "BRITISH POUND",
        },
        {
          report_date: "2024-03-01",
          asset_mgr_positions_long: 14782,
          asset_mgr_positions_short: 5789,
          leveraged_funds_positions_long: 20145,
          leveraged_funds_positions_short: 7654,
          dealer_positions_long: 18943,
          dealer_positions_short: 8076,
          open_interest: 72300,
          retail_sentiment_long: 38,
          retail_sentiment_short: 62,
          commodity_subgroup_name: "CURRENCY",
          contract_market_name: "JAPANESE YEN",
        },
        {
          report_date: "2024-03-01",
          asset_mgr_positions_long: 10234,
          asset_mgr_positions_short: 4567,
          leveraged_funds_positions_long: 15678,
          leveraged_funds_positions_short: 6789,
          dealer_positions_long: 12345,
          dealer_positions_short: 5432,
          open_interest: 54200,
          retail_sentiment_long: 55,
          retail_sentiment_short: 45,
          commodity_subgroup_name: "CURRENCY",
          contract_market_name: "SWISS FRANC",
        },
        {
          report_date: "2024-03-01",
          asset_mgr_positions_long: 9876,
          asset_mgr_positions_short: 3456,
          leveraged_funds_positions_long: 14567,
          leveraged_funds_positions_short: 5678,
          dealer_positions_long: 11234,
          dealer_positions_short: 4321,
          open_interest: 48900,
          retail_sentiment_long: 68,
          retail_sentiment_short: 32,
          commodity_subgroup_name: "CURRENCY",
          contract_market_name: "NEW ZEALAND DOLLAR",
        },
      ]

      setData(mockData)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchCFTCData()
  }, [])

  // Get the current currency pair details
  const currentPair = React.useMemo(() => {
    return CURRENCY_PAIRS.find((pair) => `${pair.base}/${pair.quote}` === selectedPair) || CURRENCY_PAIRS[0]
  }, [selectedPair])

  // Get the base and quote market data
  const baseMarketData = React.useMemo(() => {
    return data.find((item) => item.contract_market_name === currentPair.baseMarket)
  }, [data, currentPair])

  const quoteMarketData = React.useMemo(() => {
    return data.find((item) => item.contract_market_name === currentPair.quoteMarket)
  }, [data, currentPair])

  // Update the baseChartData and quoteChartData to handle the new categories
  const baseChartData = React.useMemo(() => {
    if (!baseMarketData) {
      return [
        { pair: "Long Positions", volume: 0, fill: "#03b198" },
        { pair: "Short Positions", volume: 0, fill: "#ff2f67" },
      ]
    }

    let longPositions = 0
    let shortPositions = 0

    if (selectedCategory === "Asset Managers") {
      longPositions = baseMarketData.asset_mgr_positions_long
      shortPositions = baseMarketData.asset_mgr_positions_short
    } else if (selectedCategory === "Leveraged Funds") {
      longPositions = baseMarketData.leveraged_funds_positions_long
      shortPositions = baseMarketData.leveraged_funds_positions_short
    } else if (selectedCategory === "Dealer Intermediary") {
      longPositions = baseMarketData.dealer_positions_long
      shortPositions = baseMarketData.dealer_positions_short
    } else if (selectedCategory === "Retail Sentiment") {
      longPositions = baseMarketData.retail_sentiment_long
      shortPositions = baseMarketData.retail_sentiment_short
    } else if (selectedCategory === "Open Interest") {
      longPositions = baseMarketData.open_interest
      shortPositions = 0
    }

    return [
      { pair: "Long Positions", volume: longPositions, fill: "#03b198" },
      { pair: "Short Positions", volume: shortPositions, fill: "#ff2f67" },
    ]
  }, [baseMarketData, selectedCategory])

  // Update the quoteChartData to handle the new categories
  const quoteChartData = React.useMemo(() => {
    if (!quoteMarketData) {
      return [
        { pair: "Long Positions", volume: 0, fill: "#03b198" },
        { pair: "Short Positions", volume: 0, fill: "#ff2f67" },
      ]
    }

    let longPositions = 0
    let shortPositions = 0

    if (selectedCategory === "Asset Managers") {
      longPositions = quoteMarketData.asset_mgr_positions_long
      shortPositions = quoteMarketData.asset_mgr_positions_short
    } else if (selectedCategory === "Leveraged Funds") {
      longPositions = quoteMarketData.leveraged_funds_positions_long
      shortPositions = quoteMarketData.leveraged_funds_positions_short
    } else if (selectedCategory === "Dealer Intermediary") {
      longPositions = quoteMarketData.dealer_positions_long
      shortPositions = quoteMarketData.dealer_positions_short
    } else if (selectedCategory === "Retail Sentiment") {
      longPositions = quoteMarketData.retail_sentiment_long
      shortPositions = quoteMarketData.retail_sentiment_short
    } else if (selectedCategory === "Open Interest") {
      longPositions = quoteMarketData.open_interest
      shortPositions = 0
    }

    return [
      { pair: "Long Positions", volume: longPositions, fill: "#03b198" },
      { pair: "Short Positions", volume: shortPositions, fill: "#ff2f67" },
    ]
  }, [quoteMarketData, selectedCategory])

  // Calculate totals and percentages
  const baseTotalPositions = React.useMemo(() => {
    return baseChartData.reduce((acc, curr) => acc + curr.volume, 0)
  }, [baseChartData])

  const baseNetLongPercentage = React.useMemo(() => {
    return baseTotalPositions === 0 ? 0 : ((baseChartData[0].volume / baseTotalPositions) * 100).toFixed(1)
  }, [baseChartData, baseTotalPositions])

  const quoteTotalPositions = React.useMemo(() => {
    return quoteChartData.reduce((acc, curr) => acc + curr.volume, 0)
  }, [quoteChartData])

  const quoteNetLongPercentage = React.useMemo(() => {
    return quoteTotalPositions === 0 ? 0 : ((quoteChartData[0].volume / quoteTotalPositions) * 100).toFixed(1)
  }, [quoteChartData, quoteTotalPositions])

  // Get time series data for the selected pair
  const timeSeriesData = React.useMemo(() => {
    return TIME_SERIES_DATA[selectedPair] || []
  }, [selectedPair])

  // Add net position data for bar chart
  const netPositionData = React.useMemo(() => {
    if (!baseMarketData || !quoteMarketData) {
      return [
        { currency: currentPair.base, netPosition: 0 },
        { currency: currentPair.quote, netPosition: 0 },
      ]
    }

    let baseNetPosition = 0
    let quoteNetPosition = 0

    if (selectedCategory === "Asset Managers") {
      baseNetPosition = baseMarketData.asset_mgr_positions_long - baseMarketData.asset_mgr_positions_short
      quoteNetPosition = quoteMarketData.asset_mgr_positions_long - quoteMarketData.asset_mgr_positions_short
    } else if (selectedCategory === "Leveraged Funds") {
      baseNetPosition = baseMarketData.leveraged_funds_positions_long - baseMarketData.leveraged_funds_positions_short
      quoteNetPosition =
        quoteMarketData.leveraged_funds_positions_long - quoteMarketData.leveraged_funds_positions_short
    } else if (selectedCategory === "Dealer Intermediary") {
      baseNetPosition = baseMarketData.dealer_positions_long - baseMarketData.dealer_positions_short
      quoteNetPosition = quoteMarketData.dealer_positions_long - quoteMarketData.dealer_positions_short
    } else if (selectedCategory === "Retail Sentiment") {
      baseNetPosition = baseMarketData.retail_sentiment_long - baseMarketData.retail_sentiment_short
      quoteNetPosition = quoteMarketData.retail_sentiment_long - quoteMarketData.retail_sentiment_short
    } else if (selectedCategory === "Open Interest") {
      baseNetPosition = baseMarketData.open_interest
      quoteNetPosition = quoteMarketData.open_interest
    }

    return [
      { currency: currentPair.base, netPosition: baseNetPosition },
      { currency: currentPair.quote, netPosition: quoteNetPosition },
    ]
  }, [baseMarketData, quoteMarketData, currentPair, selectedCategory])

  const chartConfig = {
    baseLong: {
      label: "Long",
      color: "#03b198",
    },
    baseShort: {
      label: "Short",
      color: "#ff2f67",
    },
    quoteLong: {
      label: "Long",
      color: "#03b198",
    },
    quoteShort: {
      label: "Short",
      color: "#ff2f67",
    },
    // Add these for pie charts
    "Long Positions": {
      label: "Long Positions",
      color: "#03b198",
    },
    "Short Positions": {
      label: "Short Positions",
      color: "#ff2f67",
    },
  }

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  // Calculate net positions
  const calculateNet = (long: number, short: number) => {
    return long - short
  }

  // Update the UI to include the new chart type and categories
  return (
    <div className="min-w-[550px]a max-w-[750px]">
      <Card className="w-fit border ">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b border py-1 sm:flex-row">
          <div className="grid flex-1 gap-1 text-left text-sm">
            <span className=" font-medium">Commitment of Traders</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className={`h-7 w-7 ${chartType === "donut" ? "bg-muted" : "border"}`}
                onClick={() => setChartType("donut")}
              >
                <PieChartIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Pie Chart</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-7 w-7 ${chartType === "area" ? "bg-muted" : "border"}`}
                onClick={() => setChartType("area")}
              >
                <ChartArea className="h-3.5 w-3.5" />
                <span className="sr-only">Area Chart</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-7 w-7 ${chartType === "bar" ? "bg-muted" : "border"}`}
                onClick={() => setChartType("bar")}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="sr-only">Bar Chart</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-7 w-7 ${chartType === "table" ? "bg-muted" : "border"}`}
                onClick={() => setChartType("table")}
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Data Table</span>
              </Button>
            </div>

            {/* Add filter dropdown for bar chart */}
            {chartType === "bar" && (
              <Select
                value={barDataFilter}
                onValueChange={(value) => setBarDataFilter(value as "both" | "base" | "quote")}
              >
                <SelectTrigger className="w-[100px] h-7 text-xs rounded-lg" aria-label="Filter Data">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border">
                  <SelectItem value="both" className="rounded-lg">
                    Both
                  </SelectItem>
                  <SelectItem value="base" className="rounded-lg">
                    {currentPair.base} Only
                  </SelectItem>
                  <SelectItem value="quote" className="rounded-lg">
                    {currentPair.quote} Only
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger className="w-[120px] h-7 text-xs rounded-lg" aria-label="Select Currency Pair">
                <SelectValue placeholder="Select Pair" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border">
                {CURRENCY_PAIRS.map((pair) => (
                  <SelectItem
                    key={`${pair.base}/${pair.quote}`}
                    value={`${pair.base}/${pair.quote}`}
                    className="rounded-lg"
                  >
                    {pair.base}/{pair.quote}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px] h-7 text-xs rounded-lg " aria-label="Select Category">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border">
                <SelectItem value="Asset Managers" className="rounded-lg">
                  Asset Managers
                </SelectItem>
                <SelectItem value="Leveraged Funds" className="rounded-lg">
                  Leveraged Funds
                </SelectItem>
                <SelectItem value="Dealer Intermediary" className="rounded-lg">
                  Dealer Intermediary
                </SelectItem>
                <SelectItem value="Retail Sentiment" className="rounded-lg">
                  Retail Sentiment
                </SelectItem>
                <SelectItem value="Open Interest" className="rounded-lg">
                  Open Interest
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* Chart content based on selected chart type */}
        {chartType === "donut" ? (
          // Donut chart content
          <div className="p-2">
            <div className="grid grid-cols-2 gap-2 max-w-[500px] mx-auto">
              <div>
                <div className="text-sm font-medium mb-2 text-center">{currentPair.base}</div>
                {loading ? (
                  <div className="text-center ">Loading...</div>
                ) : error ? (
                  <div className="text-center text-red-500">{error}</div>
                ) : (
                  <div className="h-[180px] w-[180px] mx-auto relative">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <PieChart width={180} height={180}>
                        <ChartTooltip cursor={false} content={<CustomTooltip />} />
                        <Pie
                          data={baseChartData}
                          dataKey="volume"
                          nameKey="pair"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          fillOpacity={0.5}
                        >
                          <Label
                            content={({ viewBox }) => {
                              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                    <tspan x={viewBox.cx} y={viewBox.cy} className=" text-2xl font-bold fill-primary">
                                      {baseNetLongPercentage}%
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={(viewBox.cy || 0) + 20}
                                      className="fill-muted-foreground text-xs"
                                    >
                                      Net Long
                                    </tspan>
                                  </text>
                                )
                              }
                              return null
                            }}
                          />
                          {baseChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} strokeWidth={1.5} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium mb-2 text-center">{currentPair.quote}</div>
                {loading ? (
                  <div className="text-center">Loading...</div>
                ) : error ? (
                  <div className="text-center text-red-500">{error}</div>
                ) : (
                  <div className="h-[180px] w-[180px] mx-auto relative">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <PieChart width={180} height={180}>
                        <ChartTooltip cursor={false} content={<CustomTooltip />} />
                        <Pie
                          data={quoteChartData}
                          dataKey="volume"
                          nameKey="pair"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          fillOpacity={0.5}
                        >
                          <Label
                            content={({ viewBox }) => {
                              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                    <tspan x={viewBox.cx} y={viewBox.cy} className=" text-2xl font-bold fill-primary">
                                      {quoteNetLongPercentage}%
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={(viewBox.cy || 0) + 20}
                                      className="fill-muted-foreground text-xs"
                                    >
                                      Net Long
                                    </tspan>
                                  </text>
                                )
                              }
                              return null
                            }}
                          />
                          {quoteChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} strokeWidth={1.5} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : chartType === "area" ? (
          // Area chart content
          <div className="pb-1 pt-2 pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="">
                <div className="text-sm font-medium mb-1 text-center">{currentPair.base}</div>
                <div className="h-[200px]">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart data={timeSeriesData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="baseLongGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#03b198" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#03b198" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="baseShortGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff2f67" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ff2f67" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#888888" fontSize={10} />
                      <YAxis stroke="#888888" fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="baseLong"
                        stackId="1"
                        stroke="#03b198"
                        fill="url(#baseLongGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="baseShort"
                        stackId="1"
                        stroke="#ff2f67"
                        fill="url(#baseShortGradient)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2 text-center">{currentPair.quote}</div>
                <div className="h-[200px]">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart data={timeSeriesData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="quoteLongGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#03b198" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#03b198" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="quoteShortGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff2f67" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ff2f67" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#888888" fontSize={10} />
                      <YAxis stroke="#888888" fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="quoteLong"
                        stackId="1"
                        stroke="#03b198"
                        fill="url(#quoteLongGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="quoteShort"
                        stackId="1"
                        stroke="#ff2f67"
                        fill="url(#quoteShortGradient)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </div>
        ) : chartType === "bar" ? (
          // Bar chart content
          <div className="pt-4 pb-2">
            <div className="h-[200px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart
                  data={HISTORICAL_NET_POSITIONS[selectedPair]}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`
                    }}
                  />
                  <YAxis stroke="#888888" fontSize={10} />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || payload.length === 0) return null

                      const date = new Date(label)
                      const formattedDate = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

                      // Find base and quote data if they exist
                      const baseData = payload.find((p) => p.dataKey === "baseNetPosition")
                      const quoteData = payload.find((p) => p.dataKey === "quoteNetPosition")

                      return (
                        <div className="custom-tooltip grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                          <p className="label font-semibold">{formattedDate}</p>

                          {baseData && (
                            <div className="flex justify-between">
                              <p className="desc text-muted-foreground">{currentPair.base}:</p>
                              <p
                                className="desc"
                                style={{ color: Number(baseData.value) >= 0 ? "#03b198" : "#ff2f67" }}
                              >
                                {Number(baseData.value).toLocaleString()}
                              </p>
                            </div>
                          )}

                          {quoteData && (
                            <div className="flex justify-between">
                              <p className="desc text-muted-foreground">{currentPair.quote}:</p>
                              <p
                                className="desc"
                                style={{ color: Number(quoteData.value) >= 0 ? "#03b198" : "#ff2f67" }}
                              >
                                {Number(quoteData.value).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    }}
                  />
                  <ReferenceLine y={0} stroke="#888888" />
                  {(barDataFilter === "both" || barDataFilter === "base") && (
                    <Bar dataKey="baseNetPosition" name={currentPair.base}>
                      {HISTORICAL_NET_POSITIONS[selectedPair].map((entry, index) => (
                        <Cell key={`cell-base-${index}`} fill={entry.baseNetPosition >= 0 ? "#03b198" : "#ff2f67"} />
                      ))}
                    </Bar>
                  )}
                  {(barDataFilter === "both" || barDataFilter === "quote") && (
                    <Bar dataKey="quoteNetPosition" name={currentPair.quote}>
                      {HISTORICAL_NET_POSITIONS[selectedPair].map((entry, index) => (
                        <Cell key={`cell-quote-${index}`} fill={entry.quoteNetPosition >= 0 ? "#03b198" : "#ff2f67"} />
                      ))}
                    </Bar>
                  )}
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        ) : null}

        {/* Data Table - Always visible below charts */}
        <div className={`p-2 overflow-x-auto w-[750px] ${chartType === "table" ? "bg-muted/20" : ""}`}>
          {loading ? (
            <div className="text-center py-2">Loading data...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-2">{error}</div>
          ) : !baseMarketData || !quoteMarketData ? (
            <div className="text-center text-muted-foreground py-2">No data available for this currency pair</div>
          ) : (
            <Table className="text-xs border">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-nowrap">Report Date</TableHead>
                  <TableHead className="text-right text-nowrap">({currentPair.base}) AM Net</TableHead>
                  <TableHead className="text-right text-nowrap">({currentPair.quote}) AM Net</TableHead>
                  <TableHead className="text-right text-nowrap">({currentPair.base}) LF Net</TableHead>
                  <TableHead className="text-right text-nowrap">({currentPair.quote}) LF Net</TableHead>
                  <TableHead className="text-right text-nowrap">({currentPair.base}) DI Net</TableHead>
                  <TableHead className="text-right text-nowrap">({currentPair.quote}) DI Net</TableHead>
                  <TableHead className="text-right text-nowrap">({currentPair.base}) RS Net</TableHead>
                  <TableHead className="text-right text-nowrap">({currentPair.quote}) RS Net</TableHead>
                  <TableHead className="text-right text-nowrap">({currentPair.base}) OI</TableHead>
                  <TableHead className="text-right text-nowrap">({currentPair.quote}) OI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HISTORICAL_NET_POSITIONS[selectedPair].map((entry, index) => {
                  // Create a simulated data entry for each historical date
                  const date = new Date(entry.date)
                  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`

                  // Calculate values based on the historical data
                  // We'll use the baseNetPosition and quoteNetPosition and apply some variation
                  const baseAMNet = entry.baseNetPosition
                  const quoteAMNet = entry.quoteNetPosition
                  const baseLFNet = Math.round(entry.baseNetPosition * 1.2)
                  const quoteLFNet = Math.round(entry.quoteNetPosition * 0.9)
                  const baseDINet = Math.round(entry.baseNetPosition * 0.7)
                  const quoteDINet = Math.round(entry.quoteNetPosition * 0.8)
                  const baseRSNet = Math.round(entry.baseNetPosition > 0 ? 65 : 35) - 50
                  const quoteRSNet = Math.round(entry.quoteNetPosition > 0 ? 62 : 38) - 50
                  const baseOI = 75000 + Math.round(Math.abs(entry.baseNetPosition) * 0.5)
                  const quoteOI = 85000 + Math.round(Math.abs(entry.quoteNetPosition) * 0.5)

                  return (
                    <TableRow key={entry.date}>
                      <TableCell className="text-nowrap py-1">{formattedDate}</TableCell>
                      <TableCell
                        className="text-right font-medium text-nowrap py-1.5"
                        style={{ color: baseAMNet >= 0 ? "#03b198" : "#ff2f67" }}
                      >
                        {formatNumber(baseAMNet)}
                      </TableCell>
                      <TableCell
                        className="text-right font-medium text-nowrap py-1.5"
                        style={{ color: quoteAMNet >= 0 ? "#03b198" : "#ff2f67" }}
                      >
                        {formatNumber(quoteAMNet)}
                      </TableCell>
                      <TableCell
                        className="text-right font-medium text-nowrap py-1.5"
                        style={{ color: baseLFNet >= 0 ? "#03b198" : "#ff2f67" }}
                      >
                        {formatNumber(baseLFNet)}
                      </TableCell>
                      <TableCell
                        className="text-right font-medium text-nowrap py-1.5"
                        style={{ color: quoteLFNet >= 0 ? "#03b198" : "#ff2f67" }}
                      >
                        {formatNumber(quoteLFNet)}
                      </TableCell>
                      <TableCell
                        className="text-right font-medium text-nowrap py-1.5"
                        style={{ color: baseDINet >= 0 ? "#03b198" : "#ff2f67" }}
                      >
                        {formatNumber(baseDINet)}
                      </TableCell>
                      <TableCell
                        className="text-right font-medium text-nowrap py-1.5"
                        style={{ color: quoteDINet >= 0 ? "#03b198" : "#ff2f67" }}
                      >
                        {formatNumber(quoteDINet)}
                      </TableCell>
                      <TableCell
                        className="text-right font-medium text-nowrap py-1.5"
                        style={{ color: baseRSNet >= 0 ? "#03b198" : "#ff2f67" }}
                      >
                        {formatNumber(baseRSNet)}
                      </TableCell>
                      <TableCell
                        className="text-right font-medium text-nowrap py-1.5"
                        style={{ color: quoteRSNet >= 0 ? "#03b198" : "#ff2f67" }}
                      >
                        {formatNumber(quoteRSNet)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-nowrap py-1" style={{ color: "#03b198" }}>
                        {formatNumber(baseOI)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-nowrap py-1" style={{ color: "#03b198" }}>
                        {formatNumber(quoteOI)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  )
}

