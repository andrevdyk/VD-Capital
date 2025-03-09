"use client"

import * as React from "react"
import { ArrowDown, ArrowRight, ArrowUp, Calendar, Clock, Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NewsEvent {
  id: string
  title: string
  date: string
  time: string
  currency: string
  impact: "high" | "medium" | "low"
  previous: string | number
  forecast: string | number
  actual?: string | number
  analysis: string
  sentiment: "bullish" | "bearish" | "neutral"
}

// Mock data for upcoming events
const upcomingEvents: NewsEvent[] = [
  {
    id: "1",
    title: "Fed Interest Rate Decision",
    date: "2024-06-12",
    time: "18:00",
    currency: "USD",
    impact: "high",
    previous: "5.25%",
    forecast: "5.00%",
    analysis:
      "If actual rate cut is larger than forecast (below 5.00%), then bearish on USD. If rates are maintained at 5.25%, then bullish on USD.",
    sentiment: "bearish",
  },
  {
    id: "2",
    title: "US Non-Farm Payrolls",
    date: "2024-06-07",
    time: "12:30",
    currency: "USD",
    impact: "high",
    previous: "175K",
    forecast: "190K",
    analysis:
      "If actual NFP is higher than forecast, then bullish on USD. Strong job growth typically strengthens the dollar.",
    sentiment: "bullish",
  },
  {
    id: "3",
    title: "ECB Monetary Policy Statement",
    date: "2024-06-06",
    time: "11:45",
    currency: "EUR",
    impact: "high",
    previous: "4.50%",
    forecast: "4.50%",
    analysis:
      "If ECB signals future rate cuts, then bearish on EUR. If policy remains unchanged with hawkish tone, then bullish on EUR.",
    sentiment: "neutral",
  },
  {
    id: "4",
    title: "UK GDP (QoQ)",
    date: "2024-06-11",
    time: "06:00",
    currency: "GBP",
    impact: "high",
    previous: "0.3%",
    forecast: "0.4%",
    analysis:
      "If actual GDP is higher than forecast, then bullish on GBP. Strong economic growth supports currency strength.",
    sentiment: "bullish",
  },
  {
    id: "5",
    title: "Australia Employment Change",
    date: "2024-06-13",
    time: "01:30",
    currency: "AUD",
    impact: "medium",
    previous: "38.5K",
    forecast: "25.0K",
    analysis:
      "If actual employment change is higher than forecast, then bullish on AUD. Strong job market supports RBA hawkishness.",
    sentiment: "bullish",
  },
  {
    id: "6",
    title: "Japan CPI (YoY)",
    date: "2024-06-21",
    time: "23:30",
    currency: "JPY",
    impact: "medium",
    previous: "2.5%",
    forecast: "2.7%",
    analysis:
      "If actual inflation is higher than forecast, then bullish on JPY. Higher inflation may prompt BoJ to continue policy normalization.",
    sentiment: "bullish",
  },
  {
    id: "7",
    title: "Canada Retail Sales (MoM)",
    date: "2024-06-21",
    time: "12:30",
    currency: "CAD",
    impact: "medium",
    previous: "0.2%",
    forecast: "0.4%",
    analysis:
      "If actual retail sales are higher than forecast, then bullish on CAD. Strong consumer spending supports economic growth.",
    sentiment: "bullish",
  },
]

// Mock data for historical events
const historicalEvents: NewsEvent[] = [
  {
    id: "h1",
    title: "US CPI (YoY)",
    date: "2024-05-15",
    time: "12:30",
    currency: "USD",
    impact: "high",
    previous: "3.5%",
    forecast: "3.4%",
    actual: "3.3%",
    analysis:
      "Inflation came in below forecast, indicating cooling price pressures. Bullish for risk assets, bearish for USD as it supports Fed rate cuts.",
    sentiment: "bearish",
  },
  {
    id: "h2",
    title: "ECB Interest Rate Decision",
    date: "2024-05-02",
    time: "11:45",
    currency: "EUR",
    impact: "high",
    previous: "4.50%",
    forecast: "4.50%",
    actual: "4.50%",
    analysis:
      "ECB maintained rates but signaled potential cuts in June. Slightly bearish for EUR due to dovish forward guidance.",
    sentiment: "bearish",
  },
  {
    id: "h3",
    title: "UK Employment Change",
    date: "2024-05-14",
    time: "06:00",
    currency: "GBP",
    impact: "medium",
    previous: "103K",
    forecast: "85K",
    actual: "120K",
    analysis:
      "Employment significantly exceeded expectations, showing robust labor market. Bullish for GBP as it may delay BoE rate cuts.",
    sentiment: "bullish",
  },
  {
    id: "h4",
    title: "Australia GDP (QoQ)",
    date: "2024-05-01",
    time: "01:30",
    currency: "AUD",
    impact: "high",
    previous: "0.2%",
    forecast: "0.3%",
    actual: "0.2%",
    analysis:
      "GDP growth missed expectations, suggesting economic weakness. Neutral to slightly bearish for AUD as growth remains positive but subdued.",
    sentiment: "neutral",
  },
  {
    id: "h5",
    title: "Japan Industrial Production (MoM)",
    date: "2024-04-30",
    time: "23:50",
    currency: "JPY",
    impact: "medium",
    previous: "-3.4%",
    forecast: "3.0%",
    actual: "3.8%",
    analysis:
      "Industrial production rebounded strongly, exceeding forecasts. Bullish for JPY as it indicates economic recovery.",
    sentiment: "bullish",
  },
  {
    id: "h6",
    title: "Canada Interest Rate Decision",
    date: "2024-04-10",
    time: "14:00",
    currency: "CAD",
    impact: "high",
    previous: "5.00%",
    forecast: "4.75%",
    actual: "4.75%",
    analysis:
      "BoC cut rates as expected but signaled a pause in further cuts. Neutral for CAD as the cut was priced in, but pause is hawkish.",
    sentiment: "neutral",
  },
  {
    id: "h7",
    title: "US Retail Sales (MoM)",
    date: "2024-04-15",
    time: "12:30",
    currency: "USD",
    impact: "high",
    previous: "0.6%",
    forecast: "0.3%",
    actual: "0.1%",
    analysis:
      "Retail sales significantly missed expectations, suggesting consumer weakness. Bearish for USD as it may accelerate Fed rate cuts.",
    sentiment: "bearish",
  },
  {
    id: "h8",
    title: "Eurozone Manufacturing PMI",
    date: "2024-05-02",
    time: "08:00",
    currency: "EUR",
    impact: "medium",
    previous: "47.3",
    forecast: "48.0",
    actual: "49.2",
    analysis:
      "Manufacturing PMI improved more than expected, approaching expansion territory. Bullish for EUR as it indicates economic recovery.",
    sentiment: "bullish",
  },
  {
    id: "h9",
    title: "China GDP (YoY)",
    date: "2024-04-16",
    time: "02:00",
    currency: "CNY",
    impact: "high",
    previous: "5.2%",
    forecast: "5.0%",
    actual: "5.3%",
    analysis:
      "GDP growth exceeded expectations, indicating economic resilience. Bullish for CNY and commodity currencies like AUD.",
    sentiment: "bullish",
  },
  {
    id: "h10",
    title: "US FOMC Meeting Minutes",
    date: "2024-05-22",
    time: "18:00",
    currency: "USD",
    impact: "high",
    previous: "N/A",
    forecast: "N/A",
    actual: "N/A",
    analysis:
      "Minutes revealed concerns about persistent inflation, suggesting a more hawkish stance. Bullish for USD as rate cuts may be delayed.",
    sentiment: "bullish",
  },
]

export function EconomicNews() {
  const [activeTab, setActiveTab] = React.useState("upcoming")
  const [filter, setFilter] = React.useState<string>("all")

  // Filter events based on currency
  const filteredUpcomingEvents =
    filter === "all" ? upcomingEvents : upcomingEvents.filter((event) => event.currency === filter)

  const filteredHistoricalEvents =
    filter === "all" ? historicalEvents : historicalEvents.filter((event) => event.currency === filter)

  // Get unique currencies for filter
  const currencies = Array.from(new Set([...upcomingEvents, ...historicalEvents].map((event) => event.currency))).sort()

  // Format date to readable format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-[#ff2f67] bg-opacity-20 text-[#ff2f67] border-[#ff2f67]"
      case "medium":
        return "bg-[#ff932f] bg-opacity-20 text-[#ff932f] border-[#ff932f]"
      case "low":
        return "bg-blue-100 bg-opacity-20 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 bg-opacity-20 text-gray-800 border-gray-200"
    }
  }

  // Get sentiment color and icon
  const getSentimentInfo = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return { color: "text-[#03b198]", icon: <ArrowUp className="h-4 w-4" /> }
      case "bearish":
        return { color: "text-[#ff2f67]", icon: <ArrowDown className="h-4 w-4" /> }
      case "neutral":
        return { color: "text-[#ff932f]", icon: <ArrowRight className="h-4 w-4" /> }
      default:
        return { color: "text-gray-500", icon: <Info className="h-4 w-4" /> }
    }
  }

  return (
    <Card className="w-full border lg:max-h-[650px]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-1 sm:flex-row ">
        <div className="grid flex-1 gap-1 text-left text-sm">
          <span className="font-medium">Economic Calendar</span>
          
        </div>
        <div className="flex space-x-1">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="text-xs h-7 w-[140px] rounded-lg">
              <SelectValue placeholder="All Currencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-10">
              <TabsTrigger
                value="upcoming"
                className={`text-sm ${activeTab === "upcoming" ? "border-b-2 border-primary rounded-none" : ""}`}
              >
                Upcoming Events
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className={`text-sm ${activeTab === "history" ? "border-b-2 border-primary rounded-none" : ""}`}
              >
                Event History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upcoming" className="m-0 max-h-[590px] overflow-y-auto">
            <div className="divide-y">
              {filteredUpcomingEvents.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No upcoming events for selected currency</div>
              ) : (
                filteredUpcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 hover:bg-muted/20">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`${getImpactColor(event.impact)} text-[10px] px-1.5 py-0`}
                          >
                            {event.impact}
                          </Badge>
                          <span className="font-medium text-sm">{event.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {event.currency}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="text-xs">
                            <div className="text-muted-foreground">Previous</div>
                            <div className="font-medium">{event.previous}</div>
                          </div>
                          <div className="text-xs">
                            <div className="text-muted-foreground">Forecast</div>
                            <div className="font-medium">{event.forecast}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs flex items-start gap-1">
                      <div className={`${getSentimentInfo(event.sentiment).color} mt-0.5`}>
                        {getSentimentInfo(event.sentiment).icon}
                      </div>
                      <div className="text-muted-foreground">{event.analysis}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="m-0 max-h-[590px] overflow-y-auto">
            <div className="divide-y">
              {filteredHistoricalEvents.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No historical events for selected currency</div>
              ) : (
                filteredHistoricalEvents.map((event) => (
                  <div key={event.id} className="p-3 hover:bg-muted/20">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`${getImpactColor(event.impact)} text-[10px] px-1.5 py-0`}
                          >
                            {event.impact}
                          </Badge>
                          <span className="font-medium text-sm">{event.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {event.currency}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="text-xs">
                            <div className="text-muted-foreground">Previous</div>
                            <div className="font-medium">{event.previous}</div>
                          </div>
                          <div className="text-xs">
                            <div className="text-muted-foreground">Forecast</div>
                            <div className="font-medium">{event.forecast}</div>
                          </div>
                          <div className="text-xs">
                            <div className="text-muted-foreground">Actual</div>
                            <div
                              className={`font-medium ${
                                event.actual && event.forecast && Number(event.actual) > Number(event.forecast)
                                  ? "text-[#03b198]"
                                  : Number(event.actual) < Number(event.forecast)
                                    ? "text-[#ff2f67]"
                                    : ""
                              }`}
                            >
                              {event.actual}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs flex items-start gap-1">
                      <div className={`${getSentimentInfo(event.sentiment).color} mt-0.5`}>
                        {getSentimentInfo(event.sentiment).icon}
                      </div>
                      <div className="text-muted-foreground">{event.analysis}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

