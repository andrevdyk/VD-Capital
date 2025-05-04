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

interface SupplyDemandZone {
  id: string
  startTime: string
  endTime: string
  top: number
  bottom: number
  type: "supply" | "demand"
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const [activeButton, setActiveButton] = useState("sd")
  const [formattedData, setFormattedData] = useState<CandlestickData[]>([])
  const [supplyDemandZones, setSupplyDemandZones] = useState<SupplyDemandZone[]>([])
  const zoneRectanglesRef = useRef<any[]>([])

  // Format the data for the chart
  useEffect(() => {
    if (data.length > 0) {
      const formatted = data.map((item) => ({
        time: new Date(item.t).toISOString().split("T")[0] as any,
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
      }))
      setFormattedData(formatted)

      // Calculate supply and demand zones when data changes
      const zones = identifySupplyDemandZones(formatted)
      setSupplyDemandZones(zones)
    }
  }, [data])

  // Initialize the chart
  useEffect(() => {
    if (chartContainerRef.current && formattedData.length > 0) {
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

      seriesRef.current.setData(formattedData)
      chartRef.current.timeScale().fitContent()

      // Draw supply and demand zones if S/D tab is active
      if (activeButton === "sd") {
        drawSupplyDemandZones()
      }

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
  }, [formattedData])

  // Handle tab changes
  useEffect(() => {
    if (chartRef.current && seriesRef.current) {
      // Clear existing zones
      clearSupplyDemandZones()

      // Draw zones if S/D tab is active
      if (activeButton === "sd") {
        drawSupplyDemandZones()
      }
    }
  }, [activeButton, supplyDemandZones])

  // Identify supply and demand zones from price data
  const identifySupplyDemandZones = (data: CandlestickData[]): SupplyDemandZone[] => {
    const zones: SupplyDemandZone[] = []

    // Need at least 10 candles to identify zones
    if (data.length < 10) return zones

    // Parameters for zone identification
    const lookbackPeriod = 5 // How many candles to look back
    const strengthThreshold = 0.02 // 2% price movement to consider a strong move
    const consolidationThreshold = 0.005 // 0.5% range for consolidation

    for (let i = lookbackPeriod; i < data.length - 1; i++) {
      const currentCandle = data[i]
      const nextCandle = data[i + 1]

      // Calculate price movement percentage
      const priceMovement = Math.abs(nextCandle.close - currentCandle.close) / currentCandle.close

      // Check if we have a strong bullish move (potential demand zone before it)
      if (nextCandle.close > currentCandle.close && priceMovement > strengthThreshold) {
        // Look for consolidation before the move (potential demand zone)
        const consolidationStart = i - lookbackPeriod
        const consolidationEnd = i
        const bottom = Math.min(...data.slice(consolidationStart, consolidationEnd + 1).map((d) => d.low))
        const top = Math.max(...data.slice(consolidationStart, consolidationEnd + 1).map((d) => d.high))

        // Check if this is a tight consolidation
        if ((top - bottom) / bottom < consolidationThreshold) {
          zones.push({
            id: `demand-${i}`,
            startTime: data[consolidationStart].time as string,
            endTime: data[consolidationEnd].time as string,
            bottom: bottom * 0.998, // Extend slightly below for visibility
            top: top * 1.002, // Extend slightly above for visibility
            type: "demand",
          })
        }
      }

      // Check if we have a strong bearish move (potential supply zone before it)
      if (nextCandle.close < currentCandle.close && priceMovement > strengthThreshold) {
        // Look for consolidation before the move (potential supply zone)
        const consolidationStart = i - lookbackPeriod
        const consolidationEnd = i
        const bottom = Math.min(...data.slice(consolidationStart, consolidationEnd + 1).map((d) => d.low))
        const top = Math.max(...data.slice(consolidationStart, consolidationEnd + 1).map((d) => d.high))

        // Check if this is a tight consolidation
        if ((top - bottom) / bottom < consolidationThreshold) {
          zones.push({
            id: `supply-${i}`,
            startTime: data[consolidationStart].time as string,
            endTime: data[consolidationEnd].time as string,
            bottom: bottom * 0.998, // Extend slightly below for visibility
            top: top * 1.002, // Extend slightly above for visibility
            type: "supply",
          })
        }
      }
    }

    return zones
  }

  // Draw supply and demand zones on the chart
  const drawSupplyDemandZones = () => {
    if (!chartRef.current || !seriesRef.current) return

    // Clear any existing zones
    clearSupplyDemandZones()

    // Define blue colors for both supply and demand zones
    const supplyColor = "rgba(25, 118, 210, 0.2)" // Light blue with transparency
    const demandColor = "rgba(25, 118, 210, 0.2)" // Same blue for both
    const supplyBorderColor = "rgba(25, 118, 210, 0.5)" // Slightly darker blue for border
    const demandBorderColor = "rgba(25, 118, 210, 0.5)" // Same border color for both

    // Draw each zone using horizontal lines
    supplyDemandZones.forEach((zone) => {
      try {
        // Add a line at the top of the zone
        const topLine = seriesRef.current!.createPriceLine({
          price: zone.top,
          color: zone.type === "supply" ? supplyBorderColor : demandBorderColor,
          lineWidth: 1,
          lineStyle: 2, // Dashed line
          axisLabelVisible: false,
          title: zone.type === "supply" ? "Supply" : "Demand",
        })

        // Add a line at the bottom of the zone
        const bottomLine = seriesRef.current!.createPriceLine({
          price: zone.bottom,
          color: zone.type === "supply" ? supplyBorderColor : demandBorderColor,
          lineWidth: 1,
          lineStyle: 2, // Dashed line
          axisLabelVisible: false,
          title: "",
        })

        // Store the lines for later removal
        zoneRectanglesRef.current.push(topLine, bottomLine)

        // Add a filled area between the lines using a separate series
        const areaSeries = chartRef.current!.addAreaSeries({
          topColor: zone.type === "supply" ? supplyColor : demandColor,
          bottomColor: zone.type === "supply" ? supplyColor : demandColor,
          lineColor: "transparent",
          priceLineVisible: false,
          crosshairMarkerVisible: false,
          lastValueVisible: false,
        })

        // Create data points for the area
        const startDate = new Date(zone.startTime)
        const endDate = new Date(zone.endTime)

        // Extend the zone to the right edge of the chart for better visibility
        const lastDataPoint = formattedData[formattedData.length - 1]
        const endTimeToUse = lastDataPoint ? lastDataPoint.time : zone.endTime

        // Create area data
        const areaData = [
          { time: zone.startTime, value: zone.top },
          { time: endTimeToUse, value: zone.top },
        ]

        areaSeries.setData(areaData)

        // Store the area series for later removal
        zoneRectanglesRef.current.push(areaSeries)
      } catch (error) {
        console.error("Error drawing zone:", error)
      }
    })
  }

  // Clear all supply and demand zones
  const clearSupplyDemandZones = () => {
    // Remove price lines and area series
    zoneRectanglesRef.current.forEach((item) => {
      if (item && typeof item.remove === "function") {
        item.remove()
      }
    })

    zoneRectanglesRef.current = []
  }

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
            <div className="flex space-x-0">
              {buttons.map((button) => (
                <Button
                  key={button.value}
                  variant="ghost"
                  size="sm"
                  className={`text-xs px-1 ${
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

