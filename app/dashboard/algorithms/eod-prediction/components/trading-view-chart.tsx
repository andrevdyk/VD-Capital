"use client"

import { useEffect, useRef, useState } from "react"
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
  LineStyle,
} from "lightweight-charts"
import { supabase } from "@/lib/supabase"

interface TradingViewChartProps {
  symbol: string
  supportLevel: number
  resistanceLevel: number
  predictionPrice?: number
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

export function TradingViewChart({ symbol, supportLevel, resistanceLevel, predictionPrice }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const [ohlcData, setOhlcData] = useState<CandlestickData[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(true)

  const fetchOHLCData = async (pair: string) => {
    try {
      console.log("[v0] Fetching OHLC data for", pair)
      const { data, error } = await supabase
        .from("forex_data")
        .select("*")
        .eq("pair", pair)
        .order("timestamp", { ascending: true })
        .limit(100)

      if (error) {
        console.error("[v0] Supabase error:", error)
        return []
      }

      console.log("[v0] Fetched data:", data?.length, "records")

      return (
        data?.map((item: ForexData) => ({
          time: (new Date(item.timestamp).getTime() / 1000) as Time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        })) || []
      )
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      return []
    }
  }

  useEffect(() => {
    const loadData = async () => {
      if (!mounted) return

      setLoading(true)
      const data = await fetchOHLCData(symbol)

      if (mounted) {
        setOhlcData(data)
        setLoading(false)
      }
    }
    loadData()
  }, [symbol, mounted])

  useEffect(() => {
    if (!chartContainerRef.current || !mounted) return

    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    const mutedForegroundColor = isDarkMode ? "rgb(115, 115, 128)" : "rgb(161, 161, 170)"

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 350,
      layout: {
        background: { color: "transparent" },
        textColor: mutedForegroundColor,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: mutedForegroundColor, style: 1 },
      },
      rightPriceScale: { borderColor: mutedForegroundColor },
      timeScale: { borderColor: mutedForegroundColor },
    })

    const series = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    })

    chartRef.current = chart
    seriesRef.current = series

    const handleResize = () => {
      if (chartContainerRef.current && mounted) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      setMounted(false)
      chart.remove()
    }
  }, [mounted])

  useEffect(() => {
    if (!chartRef.current || !seriesRef.current || loading || !mounted) return

    if (ohlcData.length > 0) {
      console.log("[v0] Setting chart data with", ohlcData.length, "candles")
      console.log("[v0] First few data points:", ohlcData.slice(0, 3))
      console.log(
        "[v0] Chart container dimensions:",
        chartContainerRef.current?.clientWidth,
        "x",
        chartContainerRef.current?.clientHeight,
      )

      try {
        seriesRef.current.setData(ohlcData)

        console.log("[v0] Data set successfully, fitting content")

        seriesRef.current.createPriceLine({
          price: supportLevel,
          color: "#ef4444",
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: `Support: ${supportLevel.toFixed(5)}`,
        })

        seriesRef.current.createPriceLine({
          price: resistanceLevel,
          color: "#22c55e",
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: `Resistance: ${resistanceLevel.toFixed(5)}`,
        })

        if (predictionPrice) {
          seriesRef.current.createPriceLine({
            price: predictionPrice,
            color: "#3b82f6",
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `Prediction: ${predictionPrice.toFixed(5)}`,
          })
        }

        chartRef.current.timeScale().fitContent()
      } catch (error) {
        console.error("[v0] Error updating chart:", error)
      }
    }
  }, [ohlcData, supportLevel, resistanceLevel, predictionPrice, loading, mounted])

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading chart data...</div>
      </div>
    )
  }

  if (ohlcData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-muted-foreground">No data available for {symbol}</div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <div ref={chartContainerRef} className="h-full w-full" />
    </div>
  )
}
