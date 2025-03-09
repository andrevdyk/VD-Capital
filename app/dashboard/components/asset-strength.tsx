"use client"

import * as React from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Define the major currencies we'll track
const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"] as const
type Currency = (typeof CURRENCIES)[number]

// Define the currency pairs we'll use for calculations
const CURRENCY_PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "AUD/USD",
  "NZD/USD",
  "USD/JPY",
  "USD/CAD",
  "USD/CHF",
  "EUR/GBP",
  "EUR/JPY",
  "GBP/JPY",
  "AUD/JPY",
  "EUR/AUD",
  "GBP/AUD",
  "EUR/CAD",
  "GBP/CAD",
  "AUD/CAD",
  "EUR/CHF",
  "GBP/CHF",
  "AUD/CHF",
  "CAD/CHF",
  "AUD/NZD",
  "EUR/NZD",
  "GBP/NZD",
  "NZD/JPY",
  "NZD/CAD",
  "NZD/CHF",
]

// Time periods for the chart
const TIME_PERIODS = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "1y" },
] as const
type TimePeriod = (typeof TIME_PERIODS)[number]["value"]

interface PricePoint {
  date: string
  price: number
}

interface StrengthDataPoint {
  date: string
  [currency: string]: number | string
}

// Currency colors for the chart
const CURRENCY_COLORS: Record<Currency, string> = {
  USD: "#ff2f67", // Red
  EUR: "#03b198", // Green
  GBP: "#5b05f0", // Blue
  JPY: "#f005a6", //  Pink
  AUD: "#f04c05", // Orange
  CAD: "#00ebcc", // Teal
  CHF: "#ebc000", // Yellow
  NZD: "#8500eb", // Purple
}

// Generate mock historical price data for currency pairs
const generateMockPriceData = (): { dates: string[]; priceData: Record<string, PricePoint[]> } => {
  const dates: string[] = []
  const now = new Date()

  // Generate dates for the past year (daily data points)
  for (let i = 365; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    dates.push(date.toISOString().split("T")[0])
  }

  // Generate price data for each currency pair
  const priceData: Record<string, PricePoint[]> = {}

  CURRENCY_PAIRS.forEach((pair) => {
    // Start with a base price between 0.5 and 2.0
    let basePrice = 0.5 + Math.random() * 1.5

    // Special cases for certain pairs to make them more realistic
    if (pair.includes("JPY")) {
      basePrice = 80 + Math.random() * 60 // JPY pairs are typically larger numbers
    }

    priceData[pair] = dates.map((date) => {
      // Add some random movement to the price (between -0.5% and +0.5%)
      const dailyChange = (Math.random() - 0.5) * 0.01
      basePrice = basePrice * (1 + dailyChange)

      return {
        date,
        price: basePrice,
      }
    })
  })

  return { dates, priceData }
}

// Calculate percentage change between two prices
const calculatePercentageChange = (oldPrice: number, newPrice: number): number => {
  return ((newPrice - oldPrice) / oldPrice) * 100
}

// Calculate currency strength based on the formula provided
const calculateCurrencyStrength = (
  priceData: Record<string, PricePoint[]>,
  dates: string[],
  startIndex: number,
  endIndex: number,
): StrengthDataPoint[] => {
  const strengthData: StrengthDataPoint[] = []

  // For each date in the selected range
  for (let i = startIndex; i <= endIndex; i++) {
    const date = dates[i]
    const currencyStrengths: Record<string, { sum: number; count: number }> = {}

    // Initialize strength counters for each currency
    CURRENCIES.forEach((currency) => {
      currencyStrengths[currency] = {
        sum: 0,
        count: 0,
      }
    })

    // Calculate the percentage change for each pair over the last day
    CURRENCY_PAIRS.forEach((pair) => {
      const [base, quote] = pair.split("/") as [Currency, Currency]

      // Get current and previous prices
      const currentPrice = priceData[pair][i].price
      const previousPrice = priceData[pair][Math.max(0, i - 1)].price

      // Calculate percentage change
      const percentChange = calculatePercentageChange(previousPrice, currentPrice)

      // Add to base currency strength (positive if base currency strengthened)
      currencyStrengths[base].sum += percentChange
      currencyStrengths[base].count += 1

      // Add to quote currency strength (negative if base currency strengthened)
      currencyStrengths[quote].sum -= percentChange
      currencyStrengths[quote].count += 1
    })

    // Calculate average strength for each currency
    const dateStrengths: StrengthDataPoint = { date }
    CURRENCIES.forEach((currency) => {
      if (currencyStrengths[currency].count > 0) {
        dateStrengths[currency] = currencyStrengths[currency].sum / currencyStrengths[currency].count
      } else {
        dateStrengths[currency] = 0
      }
    })

    strengthData.push(dateStrengths)
  }

  // Normalize the strength values to a 0-100 scale
  const normalizedData = normalizeStrengthData(strengthData)

  return normalizedData
}

// Normalize strength values to a 0-100 scale
const normalizeStrengthData = (strengthData: StrengthDataPoint[]): StrengthDataPoint[] => {
  // Find min and max values across all currencies and dates
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  strengthData.forEach((dateData) => {
    CURRENCIES.forEach((currency) => {
      const value = dateData[currency]
      if (typeof value === "number") {
        min = Math.min(min, value)
        max = Math.max(max, value)
      }
    })
  })

  // Normalize the values
  return strengthData.map((dateData) => {
    const normalized: StrengthDataPoint = { date: dateData.date }

    CURRENCIES.forEach((currency) => {
      const value = dateData[currency]
      if (typeof value === "number") {
        // Normalize to 0-100 scale
        normalized[currency] = ((value - min) / (max - min)) * 100
      }
    })

    return normalized
  })
}

// Get the appropriate date range based on the selected time period
const getDateRange = (dates: string[], period: TimePeriod): { startIndex: number; endIndex: number } => {
  const endIndex = dates.length - 1
  let startIndex = 0

  switch (period) {
    case "1d":
      startIndex = Math.max(0, endIndex - 1)
      break
    case "1w":
      startIndex = Math.max(0, endIndex - 7)
      break
    case "1m":
      startIndex = Math.max(0, endIndex - 30)
      break
    case "3m":
      startIndex = Math.max(0, endIndex - 90)
      break
    case "6m":
      startIndex = Math.max(0, endIndex - 180)
      break
    case "1y":
      startIndex = 0 // Full year
      break
    default:
      startIndex = Math.max(0, endIndex - 30) // Default to 1 month
  }

  return { startIndex, endIndex }
}

// Format date for display
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    dataKey: string
    value: number
    color: string
  }>
  label?: string
}

// Custom tooltip component for the chart
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <div className="text-xs font-medium">{label ? formatDate(label) : ""}</div>
      <div className="mt-1 flex flex-col gap-1">
        {payload
          .sort((a, b) => b.value - a.value) // Sort by value (descending)
          .map((entry) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs">{entry.dataKey}</span>
              </div>
              <span className="text-xs font-medium">{entry.value.toFixed(1)}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

export function AssetStrength() {
  const [selectedPeriod, setSelectedPeriod] = React.useState<TimePeriod>("1m")
  const [selectedCurrencies, setSelectedCurrencies] = React.useState<Currency[]>(["USD", "EUR", "GBP", "JPY"])
  const [strengthData, setStrengthData] = React.useState<StrengthDataPoint[]>([])
  const [open, setOpen] = React.useState(false)

  // Generate mock data on component mount
  React.useEffect(() => {
    const { dates, priceData } = generateMockPriceData()
    const { startIndex, endIndex } = getDateRange(dates, selectedPeriod)
    const calculatedData = calculateCurrencyStrength(priceData, dates, startIndex, endIndex)

    // Only keep data points that are evenly spaced for better visualization
    const filteredData = filterDataPoints(calculatedData, selectedPeriod)
    setStrengthData(filteredData)
  }, [selectedPeriod])

  // Filter data points to avoid overcrowding the chart
  const filterDataPoints = (data: StrengthDataPoint[], period: TimePeriod): StrengthDataPoint[] => {
    if (data.length <= 30) return data

    let step = 1
    switch (period) {
      case "1m":
        step = 1
        break
      case "3m":
        step = 3
        break
      case "6m":
        step = 6
        break
      case "1y":
        step = 12
        break
      default:
        step = 1
    }

    return data.filter((_, index) => index % step === 0)
  }

  // Toggle currency selection
  const toggleCurrency = (currency: Currency) => {
    if (selectedCurrencies.includes(currency)) {
      // Remove if already selected
      if (selectedCurrencies.length > 1) {
        // Ensure at least one currency is selected
        setSelectedCurrencies(selectedCurrencies.filter((c) => c !== currency))
      }
    } else {
      // Add if not selected
      setSelectedCurrencies([...selectedCurrencies, currency])
    }
  }

  // Get the latest strength values for each currency
  const getLatestStrengths = (): Record<Currency, number> => {
    if (strengthData.length === 0) return {} as Record<Currency, number>

    const latest = strengthData[strengthData.length - 1]
    const result = {} as Record<Currency, number>

    CURRENCIES.forEach((currency) => {
      const value = latest[currency]
      result[currency] = typeof value === "number" ? value : 0
    })

    return result
  }

  const latestStrengths = getLatestStrengths()

  // Sort currencies by strength (descending)
  const sortedCurrencies = [...CURRENCIES].sort((a, b) => {
    return latestStrengths[b] - latestStrengths[a]
  })

  return (
    <Card className="w-full border" style={{ maxHeight: "200px", overflow: "hidden" }}>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-1 sm:flex-row">
        <div className="grid flex-1 gap-1 text-left text-sm">
          <span className="font-medium">Currency Strength Index</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Currency dropdown */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="text-xs h-7 flex items-center gap-1 w-[140px] justify-between"
              >
                Currencies ({selectedCurrencies.length})
                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 max-h-[200px] overflow-auto">
              <div className="py-1">
                {sortedCurrencies.map((currency) => (
                  <div
                    key={currency}
                    className={cn(
                      "flex items-center px-3 py-1.5 hover:bg-muted cursor-pointer text-sm",
                      selectedCurrencies.includes(currency) && "bg-muted/50",
                    )}
                    onClick={() => toggleCurrency(currency)}
                  >
                    <div className="mr-2 flex h-4 w-4 items-center justify-center">
                      {selectedCurrencies.includes(currency) && <Check className="h-3 w-3" />}
                    </div>
                    <span
                      className="h-2 w-2 rounded-full mr-2"
                      style={{ backgroundColor: CURRENCY_COLORS[currency] }}
                    ></span>
                    <span className="text-xs">{currency}</span>
                    <span className="ml-auto text-xs font-medium">
                      {latestStrengths[currency] ? latestStrengths[currency].toFixed(1) : "0.0"}
                    </span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Time period buttons */}
          <div className="flex space-x-1">
            {TIME_PERIODS.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                size="sm"
                className="text-xs h-7 px-1.5"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[180px]">
        {/* Strength chart */}
        <div className="h-full w-full">
          <ChartContainer
            config={Object.fromEntries(
              CURRENCIES.map((currency) => [currency, { label: currency, color: CURRENCY_COLORS[currency] }]),
            )}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strengthData} margin={{ top: 5, right: 5, left: 0, bottom: 8 }}>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 10 }}
                  tickMargin={2}
                  minTickGap={30}
                  axisLine={{ strokeWidth: 1 }}
                  tickLine={{ strokeWidth: 1 }}
                  dx={0}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickMargin={5}
                  axisLine={{ strokeWidth: 1 }}
                  tickLine={{ strokeWidth: 1 }}
                  width={30}
                />
                <ChartTooltip content={<CustomTooltip />} />
                {selectedCurrencies.map((currency) => (
                  <Line
                    key={currency}
                    type="monotone"
                    dataKey={currency}
                    stroke={CURRENCY_COLORS[currency]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

