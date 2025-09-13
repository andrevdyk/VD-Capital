"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts"
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
  price: number
  timestamp: number
  fullTime: string
}

const forexPairs = [
  { pair: "EUR/USD", current: 1.7647, prediction: 1.7650, change: 0.75 },
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

    return supabaseData.map((item) => {
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
        price: item.close,
        timestamp: timestamp.getTime(),
      }
    })
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

  const forexPrices = chartData.map((d) => d.price)
  const minPrice = Math.min(...forexPrices)
  const maxPrice = Math.max(...forexPrices)
  const padding = 0.001 // 5% padding above and below
  const yAxisMin = minPrice - minPrice * padding
  const yAxisMax = maxPrice + maxPrice * padding

  console.log("[v0] Y-axis domain:", { minPrice, maxPrice, yAxisMin, yAxisMax, predictionPrice })

  return (
    <div className="h-full w-full">
      <ChartContainer
        config={{
          price: {
            label: "Price",
            color: "hsl(var(--chart-1))",
          },
        }}
        className="h-full w-full"
      >
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
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
            reversed={true}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(5)}
            domain={[yAxisMin, yAxisMax]}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value, payload) => {
                  const dataPoint = payload?.[0]?.payload
                  return dataPoint ? `${dataPoint.fullTime}` : `Time: ${value}`
                }}
                formatter={(value: string | number, name?: string, props?: any) => [Number(value).toFixed(5), "Price"]}
                indicator="dot"
              />
            }
          />
          <Area dataKey="price" type="natural" fill="url(#fillPrice)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
          {predictionPrice && (
            <ReferenceLine
              y={predictionPrice}
              stroke="#22c55e"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Target: ${predictionPrice.toFixed(5)}`,
                position: "insideTopRight",
                style: { fill: "#22c55e", fontSize: "12px" },
              }}
            />
          )}
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
