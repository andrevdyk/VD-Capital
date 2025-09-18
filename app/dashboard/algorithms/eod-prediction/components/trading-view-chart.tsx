"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

interface TradingViewChartProps {
  symbol: string
  selectedDate?: Date
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
  {
    pair: "EUR/USD",
    current: 1.17647,
    predictions: {
      "2025-09-12": 1.173544,
      "2025-09-11": 1.173091,
      "2025-09-10": 1.172152,
      "2025-09-09": 1.170292,
      "2025-09-08": 1.169640,
      "2025-09-07": 1.1771,
      "2025-09-06": 1.1766,
    },
    change: 0.75,
  },
  {
    pair: "GBP/USD",
    current: 1.2634,
    predictions: {
      "2025-09-12": 1.258,
      "2025-09-11": 1.261,
      "2025-09-10": 1.265,
      "2025-09-09": 1.259,
      "2025-09-08": 1.256,
      "2025-09-07": 1.263,
      "2025-09-06": 1.26,
    },
    change: -0.43,
  },
  {
    pair: "USD/JPY",
    current: 149.82,
    predictions: {
      "2025-09-12": 151.2,
      "2025-09-11": 150.8,
      "2025-09-10": 149.5,
      "2025-09-09": 151.0,
      "2025-09-08": 150.3,
      "2025-09-07": 149.9,
      "2025-09-06": 151.5,
    },
    change: 0.92,
  },
  {
    pair: "USD/CHF",
    current: 0.8756,
    predictions: {
      "2025-09-12": 0.869,
      "2025-09-11": 0.872,
      "2025-09-10": 0.875,
      "2025-09-09": 0.871,
      "2025-09-08": 0.868,
      "2025-09-07": 0.873,
      "2025-09-06": 0.87,
    },
    change: -0.75,
  },
  {
    pair: "AUD/USD",
    current: 0.6523,
    predictions: {
      "2025-09-12": 0.658,
      "2025-09-11": 0.655,
      "2025-09-10": 0.651,
      "2025-09-09": 0.657,
      "2025-09-08": 0.659,
      "2025-09-07": 0.654,
      "2025-09-06": 0.656,
    },
    change: 0.87,
  },
  {
    pair: "USD/CAD",
    current: 1.3642,
    predictions: {
      "2025-09-12": 1.359,
      "2025-09-11": 1.362,
      "2025-09-10": 1.365,
      "2025-09-09": 1.361,
      "2025-09-08": 1.358,
      "2025-09-07": 1.363,
      "2025-09-06": 1.36,
    },
    change: -0.38,
  },
  {
    pair: "NZD/USD",
    current: 0.5987,
    predictions: {
      "2025-09-12": 0.602,
      "2025-09-11": 0.599,
      "2025-09-10": 0.596,
      "2025-09-09": 0.601,
      "2025-09-08": 0.603,
      "2025-09-07": 0.598,
      "2025-09-06": 0.6,
    },
    change: 0.55,
  },
]

export function TradingViewChart({ symbol, selectedDate }: TradingViewChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  const getPredictionPrice = (symbol: string, date?: Date) => {
    const formattedSymbol = symbol.includes("/") ? symbol : symbol.slice(0, 3) + "/" + symbol.slice(3)
    const pair = forexPairs.find((p) => p.pair === formattedSymbol)

    if (!pair) return undefined

    const targetDate = date ? format(date, "yyyy-MM-dd") : "2025-09-12"
    return pair.predictions[targetDate as keyof typeof pair.predictions] || pair.predictions["2025-09-12"]
  }

  const predictionPrice = getPredictionPrice(symbol, selectedDate)

  const processSupabaseData = (supabaseData: ForexData[]) => {
    if (!supabaseData || supabaseData.length === 0) return []

    const targetDate = selectedDate || (supabaseData.length > 0 ? new Date(supabaseData[0].timestamp) : new Date())
    const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())

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

    const predictionData: ChartData[] = []
    if (predictionPrice) {
      for (let hour = 8; hour <= 22; hour++) {
        const predictionTimestamp = new Date(targetDateOnly)
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

    const combinedData = [...forexData, ...predictionData].sort((a, b) => a.timestamp - b.timestamp)

    return combinedData
  }

  const fetchOHLCData = async (pair: string) => {
    try {
      let query = supabase
        .from("forex_data")
        .select("*")
        .eq("pair", pair)
        .eq("resolution", "60m")
        .order("timestamp", { ascending: false })
        .limit(100)

      if (selectedDate) {
        const startOfDay = new Date(selectedDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(selectedDate)
        endOfDay.setHours(23, 59, 59, 999)

        query = query.lte("timestamp", endOfDay.toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error("[v0] Supabase error:", error)
        return []
      }

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
  }, [symbol, selectedDate])

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

  const forexPrices = chartData.filter((d) => d.forexPrice !== null).map((d) => d.forexPrice!)

  let yAxisMin: number, yAxisMax: number

  if (forexPrices.length === 0) {
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
  } else {
    const minPrice = Math.min(...forexPrices)
    const maxPrice = Math.max(...forexPrices)
    const padding = 0.001 // 5% padding
    yAxisMin = minPrice * (1 - padding) // 5% below min
    yAxisMax = maxPrice * (1 + padding) // 5% above max
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
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillPrediction" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
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
            domain={[yAxisMin, yAxisMax]}
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
          <Area
            dataKey="forexPrice"
            type="monotone"
            fill="url(#fillForex)"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            connectNulls={true}
            dot={false}
          />
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
