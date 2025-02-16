"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { createChart, type IChartApi, type ISeriesApi, type CandlestickData } from "lightweight-charts"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ChartProps {
  data: {
    t: number
    o: number
    h: number
    l: number
    c: number
  }[]
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const [activeButton, setActiveButton] = useState("sd")

  useEffect(() => {
    if (chartContainerRef.current && data.length > 0) {
      const isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      const mutedForegroundColor = isDarkMode ? "rgb(115, 115, 128)" : "rgb(161, 161, 170)"

      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 350,
        layout: {
          background: { color: "transparent" },
          textColor: mutedForegroundColor,
        },
        grid: {
          vertLines: {
            color: "transparent",
            style: 1,
          },
          horzLines: {
            color: mutedForegroundColor,
            style: 1,
          },
        },
        rightPriceScale: {
          borderColor: mutedForegroundColor,
        },
        timeScale: {
          borderColor: mutedForegroundColor,
        },
      })

      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: "#03b198",
        downColor: "#ff2f67",
        borderVisible: false,
        wickUpColor: "#03b198",
        wickDownColor: "#ff2f67",
      })

      const formattedData: CandlestickData[] = data.map((item) => ({
        time: new Date(item.t).toISOString().split("T")[0] as any,
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
      }))

      seriesRef.current.setData(formattedData)

      chartRef.current.timeScale().fitContent()

      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
        }
      }

      const handleColorSchemeChange = (e: MediaQueryListEvent) => {
        if (chartRef.current) {
          const newColor = e.matches ? "rgb(115, 115, 128)" : "rgb(161, 161, 170)"
          chartRef.current.applyOptions({
            layout: {
              textColor: newColor,
            },
            grid: {
              vertLines: {
                color: "transparent",
              },
              horzLines: {
                color: newColor,
              },
            },
            rightPriceScale: {
              borderColor: newColor,
            },
            timeScale: {
              borderColor: newColor,
            },
          })
        }
      }

      window.addEventListener("resize", handleResize)
      window.matchMedia("(prefers-color-scheme: dark)").addListener(handleColorSchemeChange)

      return () => {
        window.removeEventListener("resize", handleResize)
        window.matchMedia("(prefers-color-scheme: dark)").removeListener(handleColorSchemeChange)
        if (chartRef.current) {
          chartRef.current.remove()
        }
      }
    }
  }, [data])

  const buttons = [
    { value: "sd", label: "S/D" },
    { value: "patterns", label: "Patterns" },
    { value: "trend", label: "Trend" },
    { value: "indicators", label: "Indicators" },
    { value: "fibonacci", label: "Fibonacci" },
    { value: "volume", label: "Volume" },
    { value: "candlestick", label: "Candlestick" },
  ]

  return (
    <div className="flex flex-col md:flex-row ">
      <Card className="flex flex-col w-full h-[400px]">
        <CardHeader className="flex items-center space-y-0 border-b py-0 sm:flex-row">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium">Technical Analysis</span>
            <div className="flex space-x-1">
              {buttons.map((button) => (
                <Button
                  key={button.value}
                  variant="ghost"
                  size="sm"
                  className={`text-xs px-2 ${
                    activeButton === button.value ? "border-b-2 border-primary" : "border-b-2 border-transparent"
                  }`}
                  onClick={() => setActiveButton(button.value)}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full overflow-y-auto p-0">
          <div ref={chartContainerRef} className="w-full h-[350px]" />
        </CardContent>
      </Card>
    </div>
  )
}

export default Chart

