"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, TrendingUp, TrendingDown } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { TradingViewChart } from "./components/trading-view-chart"
import { ForexPairsTable } from "./components/forex-pairs-table"

// Mock data for forex pairs
const forexPairs = [
  {
    pair: "EUR/USD",
    current: 1.7647,
    predictions: {
      "2025-09-12": 1.765,
      "2025-09-11": 1.769,
      "2025-09-10": 1.772,
      "2025-09-09": 1.768,
      "2025-09-08": 1.764,
      "2025-09-07": 1.771,
      "2025-09-06": 1.766,
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

export default function EODPredictionDashboard() {
  const [selectedPair, setSelectedPair] = useState("EUR/USD")
  const [date, setDate] = useState<Date>(new Date("2025-09-12"))
  const [currentData, setCurrentData] = useState(forexPairs[0])

  useEffect(() => {
    const selected = forexPairs.find((pair) => pair.pair === selectedPair)
    if (selected) {
      setCurrentData(selected)
    }
  }, [selectedPair])

  const getCurrentPrediction = () => {
    if (!date) return currentData.predictions["2025-09-12"] // Default to most recent
    const dateString = format(date, "yyyy-MM-dd")
    return (
      currentData.predictions[dateString as keyof typeof currentData.predictions] ||
      currentData.predictions["2025-09-12"]
    )
  }

  const calculatePips = (current: number, prediction: number) => {
    const pips = Math.abs((prediction - current) * 10000)
    return pips.toFixed(1)
  }

  const calculatePercentage = (current: number, prediction: number) => {
    return (((prediction - current) / current) * 100).toFixed(2)
  }

  const fetchPredictions = () => {
    // Mock function - would fetch from Supabase in real implementation
    console.log("Fetching predictions for last 7 days...")
  }

  const currentPrediction = getCurrentPrediction()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="w-[94vw] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">EoD Prediction Dashboard</h1>
          <div className="flex items-center gap-4">
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {forexPairs.map((pair) => (
                  <SelectItem key={pair.pair} value={pair.pair}>
                    {pair.pair}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>

            <Button onClick={fetchPredictions} className="bg-primary hover:bg-primary/90">
              Fetch 7-Day Predictions
            </Button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentData.current.toFixed(4)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Prediction Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentPrediction.toFixed(4)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pips Away</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculatePips(currentData.current, currentPrediction)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Percentage Away</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-2xl font-bold flex items-center gap-1",
                  currentData.change > 0 ? "text-chart-1" : "text-chart-2",
                )}
              >
                {currentData.change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(Number.parseFloat(calculatePercentage(currentData.current, currentPrediction)))}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-1">87.3%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* TradingView Chart */}
          <div className="lg:col-span-3">
            <Card className="h-[70vh]">
              <CardHeader>
                <CardTitle>{selectedPair} Chart with Prediction Line</CardTitle>
              </CardHeader>
              <CardContent className="h-[60vh]">
                <TradingViewChart symbol={selectedPair.replace("/", "")} selectedDate={date} />
              </CardContent>
            </Card>
          </div>

          {/* Forex Pairs Table */}
          <div className="lg:col-span-1">
            <Card className="h-[70vh]">
              <CardHeader>
                <CardTitle>Major Pairs</CardTitle>
              </CardHeader>
              <CardContent className="h-[60vh] overflow-y-auto">
                <ForexPairsTable pairs={forexPairs} onPairSelect={setSelectedPair} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
