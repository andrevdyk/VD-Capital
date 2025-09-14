"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { supabase } from "@/lib/supabase"

interface TradingViewChartProps {
  symbol: string
}

interface ForexData {
  id: number
  pair: string
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  resolution: string
}

interface ChartData {
  time: string
  forexPrice: number | null
  predictionPrice: number | null
  timestamp: number
  fullTime: string
}

const forexPairs = [
  { pair: "EUR/USD", current: 1.17647, prediction: 1.1765, change: 0.75 },
  { pair: "GBP/USD", current: 1.2634, prediction: 1.258, change: -0.43 },
  { pair: "USD/JPY", current: 149.82, prediction: 151.2, change: 0.92 },
  { pair: "USD/CHF", current: 0.8756, prediction: 0.869, change: -0.75 },
  { pair: "AUD/USD", current: 0.6523, prediction: 0.658, change: 0.87 },
  { pair: "USD/CAD", current: 1.3642, prediction: 1.359, change: -0.38 },
  { pair: "NZD/USD", current: 0.5987, prediction: 0.602, change: 0.55 },
]

export function TradingViewChart({ symbol }: TradingViewChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  const getPredictionPrice = (symbol: string) => {
    const formattedSymbol = symbol.includes("/") ? symbol : symbol.slice(0, 3) + "/" + symbol.slice(3)
    const pair = forexPairs.find((p) => p.pair === formattedSymbol)
    console.log("[v0] Looking for prediction for:", formattedSymbol, "Found:", pair?.prediction)
    return pair?.prediction
  }

  const predictionPrice = getPredictionPrice(symbol)

  const processSupabaseData = (supabaseData: ForexData[]) => {
    if (!supabaseData || supabaseData.length === 0) return []

    // Get the latest date from the data
    const latestDate = supabaseData.length > 0 ? new Date(supabaseData[0].timestamp) : new Date()
    const targetDate = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate())

    console.log("[v0] Latest date from data:", latestDate.toISOString())
    console.log("[v0] Target date for prediction:", targetDate.toISOString())

    // Process forex data
    const forexData = supabaseData.map((item) => {
      const timestamp = new Date(item.timestamp)
      return {
        time: timestamp.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        fullTime: timestamp.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        forexPrice: item.close,
        predictionPrice: null,
        timestamp: timestamp.getTime(),
      }
    })

    // Create prediction data for every hour from 08:00 to 22:00 on the target date
    const predictionData: ChartData[] = []
    if (predictionPrice) {
      for (let hour = 8; hour <= 22; hour++) {
        const predictionTimestamp = new Date(targetDate)
        predictionTimestamp.setHours(hour, 0, 0, 0)

        predictionData.push({
          time: predictionTimestamp.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          fullTime: predictionTimestamp.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          forexPrice: null,
          predictionPrice: predictionPrice,
          timestamp: predictionTimestamp.getTime(),
        })
      }
    }

    // Combine and sort all data by timestamp
    const combinedData = [...forexData, ...predictionData].sort((a, b) => a.timestamp - b.timestamp)

    console.log("[v0] Combined data points:", combinedData.length)
    console.log("[v0] Prediction data points:", predictionData.length)

    return combinedData
  }

  const fetchOHLCData = async (pair: string) => {
    try {
      console.log("[v0] Fetching OHLC data for", pair)
      const { data, error } = await supabase
        .from("forex_data")
        .select("*")
        .eq("pair", pair)
        .eq("resolution", "60m")
        .order("timestamp", { ascending: false })
        .limit(100)

      if (error) {
        console.error("[v0] Supabase error:", error)
        return []
      }

      console.log("[v0] Fetched data:", data?.length, "records")
      return processSupabaseData(data || [])
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      return []
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const data = await fetchOHLCData(symbol)
      setChartData(data)
      setLoading(false)
    }
    loadData()
  }, [symbol])

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading chart data...</div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-muted-foreground">No data available for {symbol}</div>
      </div>
    )
  }

  // Calculate Y-axis domain based on forex data only with 1% padding
  const forexPrices = chartData.filter((d) => d.forexPrice !== null).map((d) => d.forexPrice!)

  console.log("[v0] Chart data length:", chartData.length)
  console.log("[v0] Sample chart data:", chartData.slice(0, 3))
  console.log("[v0] Forex prices extracted:", forexPrices.slice(0, 5))
  console.log("[v0] Forex prices length:", forexPrices.length)

  let yAxisMin: number, yAxisMax: number

  const minPrice = Math.min(...forexPrices)
  const maxPrice = Math.max(...forexPrices)

  if (forexPrices.length === 0) {
    // Fallback if no forex data - use prediction price range
    const predictionPrices = chartData.filter((d) => d.predictionPrice !== null).map((d) => d.predictionPrice!)

    if (predictionPrices.length > 0) {
      const minPred = Math.min(...predictionPrices)
      const maxPred = Math.max(...predictionPrices)
      yAxisMin = minPred * 0.99 // 5% below min
      yAxisMax = maxPred * 1.01 // 5% above max
    } else {
      yAxisMin = 0
      yAxisMax = 1
    }
    console.log("[v0] No forex data, using prediction/fallback Y-axis domain:", { yAxisMin, yAxisMax })
  } else {
    const minPrice = Math.min(...forexPrices)
    const maxPrice = Math.max(...forexPrices)
    yAxisMin = minPrice * 0.999 // 5% below min
    yAxisMax = maxPrice * 1.0 // 5% above max
    console.log("[v0] Using forex data Y-axis domain:", {
      minPrice,
      maxPrice,
      yAxisMin,
      yAxisMax,
      forexDataCount: forexPrices.length,
    })
  }

  return (
    <div className="h-full w-full">
      <ChartContainer
        config={{
          forexPrice: {
            label: "Forex Price",
            color: "hsl(var(--chart-1))",
          },
          predictionPrice: {
            label: "Prediction Price",
            color: "hsl(var(--chart-2))",
          },
        }}
        className="h-full w-full"
      >
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="fillForex" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="fillPrediction" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(5)}
            domain={[minPrice, maxPrice]}
            type="number"
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value, payload) => {
                  const dataPoint = payload?.[0]?.payload
                  return dataPoint ? `${dataPoint.fullTime}` : `Time: ${value}`
                }}
                formatter={(value, name) => {
                  if (value === null) return null
                  return [Number(value).toFixed(5), name === "forexPrice" ? "Forex Price" : "Prediction Price"]
                }}
                indicator="dot"
              />
            }
          />
          {/* Forex Price Area Chart */}
          <Area
            dataKey="forexPrice"
            type="monotone"
            fill="url(#fillForex)"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            connectNulls={true}
            dot={false}
          />
          {/* Prediction Price Area Chart */}
          <Area
            dataKey="predictionPrice"
            type="monotone"
            fill="url(#fillPrediction)"
            stroke="#22c55e"
            strokeWidth={2}
            connectNulls={true}
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
