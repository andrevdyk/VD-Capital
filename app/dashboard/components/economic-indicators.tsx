"use client"

import * as React from "react"
import {
  ArrowDown,
  ArrowUp,
  BarChart4,
  DollarSign,
  Globe,
  LineChart,
  PieChart,
  Shield,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface IndicatorItem {
  name: string
  description: string
  impact: "high" | "medium" | "low"
  trend?: "up" | "down" | "neutral"
  value?: string
}

interface IndicatorCategory {
  name: string
  description: string
  icon: React.ReactNode
  indicators: IndicatorItem[]
}

const economicData: IndicatorCategory[] = [
  {
    name: "Market Risk",
    description: "Investor Confidence & Volatility",
    icon: <BarChart4 className="h-5 w-5" />,
    indicators: [
      {
        name: "VIX (Volatility Index)",
        description: "Measures market fear & uncertainty",
        impact: "high",
        trend: "up",
        value: "18.62",
      },
      {
        name: "Stock Market Trends",
        description: "Bullish stocks = risk-on, Bearish stocks = risk-off",
        impact: "high",
        trend: "up",
        value: "S&P +0.8%",
      },
      {
        name: "Safe-Haven Flows",
        description: "JPY & CHF gain in risk-off environments",
        impact: "medium",
        trend: "down",
        value: "Low",
      },
      {
        name: "High-Yielding vs. Low-Yielding Currencies",
        description: "Risk appetite impacts carry trades",
        impact: "medium",
        trend: "up",
        value: "Carry +1.2%",
      },
    ],
  },
  {
    name: "Geopolitics",
    description: "Political & Global Stability",
    icon: <Globe className="h-5 w-5" />,
    indicators: [
      {
        name: "Elections & Political Instability",
        description: "Can drive uncertainty & volatility",
        impact: "medium",
        trend: "neutral",
        value: "Moderate",
      },
      {
        name: "Wars & Conflicts",
        description: "Military tensions affect commodity & safe-haven currencies",
        impact: "high",
        trend: "up",
        value: "Elevated",
      },
      {
        name: "Trade Wars & Sanctions",
        description: "Tariffs & trade restrictions impact supply chains",
        impact: "medium",
        trend: "neutral",
        value: "Stable",
      },
      {
        name: "Natural Disasters & Pandemics",
        description: "Economic disruptions affect currency demand",
        impact: "low",
        trend: "down",
        value: "Low",
      },
    ],
  },
  {
    name: "Economic Data",
    description: "Fundamental Indicators of Currency Strength",
    icon: <LineChart className="h-5 w-5" />,
    indicators: [
      {
        name: "Inflation Data (CPI, PPI, Core CPI)",
        description: "Key driver of central bank actions",
        impact: "high",
        trend: "down",
        value: "3.2%",
      },
      {
        name: "Employment Data",
        description: "NFP, Unemployment Rate, Jobless Claims - Signals labor market health",
        impact: "high",
        trend: "neutral",
        value: "3.8%",
      },
      {
        name: "GDP Growth",
        description: "Quarterly & Annualized GDP Reports - Measures economic strength",
        impact: "high",
        trend: "up",
        value: "2.1%",
      },
      {
        name: "Retail Sales & Consumer Spending",
        description: "Drives economic expansion",
        impact: "medium",
        trend: "up",
        value: "+0.7%",
      },
      {
        name: "PMI (Purchasing Managers' Index)",
        description: "Business expansion/contraction indicator",
        impact: "medium",
        trend: "up",
        value: "52.3",
      },
      {
        name: "Consumer Confidence Index (CCI)",
        description: "Reflects household spending optimism",
        impact: "medium",
        trend: "up",
        value: "103.2",
      },
    ],
  },
  {
    name: "Global Growth",
    description: "Macroeconomic Trends & Business Cycle",
    icon: <PieChart className="h-5 w-5" />,
    indicators: [
      {
        name: "Major Economies' GDP Growth",
        description: "US, China, EU drive global demand",
        impact: "high",
        trend: "neutral",
        value: "Mixed",
      },
      {
        name: "Industrial Production & Manufacturing Data",
        description: "Signals economic expansion",
        impact: "medium",
        trend: "up",
        value: "+0.4%",
      },
      {
        name: "Commodity Demand",
        description: "Oil, Metals, Agriculture - Tied to emerging markets & trade",
        impact: "medium",
        trend: "up",
        value: "Strong",
      },
      {
        name: "World Bank & IMF Growth Forecasts",
        description: "Future economic outlook",
        impact: "medium",
        trend: "down",
        value: "2.8%",
      },
    ],
  },
  {
    name: "Intermarket Analysis",
    description: "Cross-Asset Correlations",
    icon: <TrendingUp className="h-5 w-5" />,
    indicators: [
      {
        name: "Oil Prices (Brent, WTI)",
        description: "CAD, NOK, RUB - Commodity-currency correlation",
        impact: "high",
        trend: "up",
        value: "$82.45",
      },
      {
        name: "Gold & Silver Prices",
        description: "AUD, NZD, CHF - Safe-haven vs. risk asset dynamics",
        impact: "medium",
        trend: "up",
        value: "$2,345",
      },
      {
        name: "US Dollar Index (DXY)",
        description: "Strength of USD impacts forex pairs",
        impact: "high",
        trend: "down",
        value: "104.2",
      },
      {
        name: "Bond Market Trends",
        description: "Treasury Yields, Credit Spreads - Higher yields = stronger currency",
        impact: "high",
        trend: "up",
        value: "4.25%",
      },
      {
        name: "Cryptocurrency Market Sentiment",
        description: "Growing correlation with risk appetite",
        impact: "low",
        trend: "up",
        value: "Bullish",
      },
    ],
  },
  {
    name: "Policies",
    description: "Central Bank & Government Actions",
    icon: <DollarSign className="h-5 w-5" />,
    indicators: [
      {
        name: "Central Bank Interest Rate Decisions",
        description: "Fed, ECB, BoE, BoJ, etc. - Key forex driver",
        impact: "high",
        trend: "neutral",
        value: "Stable",
      },
      {
        name: "Quantitative Easing (QE) & Tightening (QT)",
        description: "Liquidity & money supply shifts",
        impact: "high",
        trend: "neutral",
        value: "Neutral",
      },
      {
        name: "Monetary Policy Statements & Forward Guidance",
        description: "Market expectations pricing",
        impact: "high",
        trend: "neutral",
        value: "Hawkish",
      },
      {
        name: "Government Fiscal Policies",
        description: "Spending, Tax Cuts, Stimulus - Affects growth & inflation",
        impact: "medium",
        trend: "neutral",
        value: "Mixed",
      },
    ],
  },
  {
    name: "Capital Flow",
    description: "Investment & Currency Demand",
    icon: <TrendingDown className="h-5 w-5" />,
    indicators: [
      {
        name: "Foreign Direct Investment (FDI)",
        description: "More investment = currency appreciation",
        impact: "medium",
        trend: "up",
        value: "Strong",
      },
      {
        name: "Bond Market Inflows & Outflows",
        description: "Higher bond yields attract capital",
        impact: "medium",
        trend: "up",
        value: "Inflows",
      },
      {
        name: "Stock Market Capital Flows",
        description: "Foreign investors buying/selling equities",
        impact: "medium",
        trend: "up",
        value: "Inflows",
      },
      {
        name: "Hedge Fund & Institutional Positioning",
        description: "Large capital shifts affect price trends",
        impact: "high",
        trend: "neutral",
        value: "Neutral",
      },
    ],
  },
  {
    name: "Terms of Trade",
    description: "Trade Balance & Economic Competitiveness",
    icon: <Shield className="h-5 w-5" />,
    indicators: [
      {
        name: "Trade Balance",
        description: "Exports vs. Imports - Surplus strengthens a currency",
        impact: "medium",
        trend: "down",
        value: "-$65.2B",
      },
      {
        name: "Current Account Balance",
        description: "Deficits can weaken a currency over time",
        impact: "medium",
        trend: "down",
        value: "-$206B",
      },
      {
        name: "Commodity Export Prices",
        description: "Australia, Canada, Norway - Affects currency valuation",
        impact: "medium",
        trend: "up",
        value: "Rising",
      },
      {
        name: "Currency Pegs & Exchange Rate Interventions",
        description: "Central banks controlling currency value",
        impact: "high",
        trend: "neutral",
        value: "Limited",
      },
    ],
  },
]

export function EconomicIndicators() {
  const [view, setView] = React.useState<"detailed" | "summary">("summary")

  const buttons = [
    { label: "Summary", value: "summary" },
    { label: "Detailed", value: "detailed" },
  ]

  return (
    <Card className="w-full border">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-0 sm:flex-row">
        <div className="grid flex-1 gap-1 text-left text-sm">
          <span className="font-medium">Economic Indicators</span>
        </div>
        <div className="flex space-x-1">
          {buttons.map((button) => (
            <Button
              key={button.value}
              variant="ghost"
              size="sm"
              className={`text-xs px-2 ${
                view === button.value ? "border-b-2 border-primary" : "border-b-2 border-transparent"
              }`}
              onClick={() => setView(button.value as "summary" | "detailed")}
            >
              {button.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={view} className="w-full">
          <TabsContent value="summary" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
              {economicData.map((category, index) => (
                <div
                  key={category.name}
                  className={`p-4 border ${index % 4 !== 3 ? "border-r" : ""} ${
                    index < economicData.length - 4 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-primary">{category.icon}</div>
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{category.description}</p>
                  <div className="space-y-2">
                    {category.indicators.slice(0, 3).map((indicator) => (
                      <div key={indicator.name} className="flex items-center justify-between">
                        <span className="text-xs truncate max-w-[70%]">{indicator.name}</span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`text-xs px-1.5 py-0 h-5 ${
                              indicator.trend === "up"
                                ? "text-[#03b198] border-[#03b198]"
                                : indicator.trend === "down"
                                  ? "text-[#ff2f67] border-[#ff2f67]"
                                  : "text-[#ff932f] border-[#ff932f]"
                            }`}
                          >
                            {indicator.value}
                          </Badge>
                          {indicator.trend === "up" ? (
                            <ArrowUp className="h-3 w-3 text-[#03b198]" />
                          ) : indicator.trend === "down" ? (
                            <ArrowDown className="h-3 w-3 text-[#ff2f67]" />
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                  {category.indicators.length > 3 && (
                    <div className="mt-2 text-xs text-muted-foreground text-right">
                      +{category.indicators.length - 3} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="detailed" className="m-0">
            <Accordion type="multiple" className="w-full">
              {economicData.map((category) => (
                <AccordionItem key={category.name} value={category.name} className="border-b px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-muted-foreground">{category.icon}</div>
                      <div className="text-left">
                        <h3 className="font-medium ">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pb-4">
                      {category.indicators.map((indicator) => (
                        <div key={indicator.name} className="grid grid-cols-[1fr,auto] gap-2 items-center">
                          <div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <h4 className="text-sm font-medium flex items-center gap-2">
                                    {indicator.name}
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] px-1.5 py-0 h-4 ${
                                        indicator.impact === "high"
                                          ? "text-[#ff2f67] border-[#ff2f67]"
                                          : indicator.impact === "medium"
                                            ? "text-[#ff932f] border-[#ff932f]"
                                            : "text-[#03b198] border-[#03b198]"
                                      }`}
                                    >
                                      {indicator.impact}
                                    </Badge>
                                  </h4>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">{indicator.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <p className="text-xs text-muted-foreground">{indicator.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`${
                                indicator.trend === "up"
                                  ? "text-[#03b198] border-[#03b198]"
                                  : indicator.trend === "down"
                                    ? "text-[#ff2f67] border-[#ff2f67]"
                                    : "text-[#ff932f] border-[#ff932f]"
                              }`}
                            >
                              {indicator.value}
                            </Badge>
                            {indicator.trend === "up" ? (
                              <ArrowUp className="h-4 w-4 text-[#03b198]" />
                            ) : indicator.trend === "down" ? (
                              <ArrowDown className="h-4 w-4 text-[#ff2f67]" />
                            ) : (
                              <div className="h-1 w-4 bg-[#ff932f] rounded-full" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

