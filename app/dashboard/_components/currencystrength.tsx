"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive area chart"

const chartData = [
  { date: "2024-04-01", EUR: 222, USD: 150, JPY: -222, GBP: -150 },
{ date: "2024-04-02", EUR: 97, USD: 180, JPY: -97, GBP: -180 },
{ date: "2024-04-03", EUR: 167, USD: 120, JPY: -167, GBP: -120 },
{ date: "2024-04-04", EUR: 242, USD: 260, JPY: -242, GBP: -260 },
{ date: "2024-04-05", EUR: 373, USD: 290, JPY: -373, GBP: -290 },
{ date: "2024-04-06", EUR: 301, USD: 340, JPY: -301, GBP: -340 },
{ date: "2024-04-07", EUR: 245, USD: 180, JPY: -245, GBP: -180 },
{ date: "2024-04-08", EUR: 409, USD: 320, JPY: -409, GBP: -320 },
{ date: "2024-04-09", EUR: 59, USD: 110, JPY: -59, GBP: -110 },
{ date: "2024-04-10", EUR: 261, USD: 190, JPY: -261, GBP: -190 },
{ date: "2024-04-11", EUR: 327, USD: 350, JPY: -327, GBP: -350 },
{ date: "2024-04-12", EUR: 292, USD: 210, JPY: -292, GBP: -210 },
{ date: "2024-04-13", EUR: 342, USD: 380, JPY: -342, GBP: -380 },
{ date: "2024-04-14", EUR: 137, USD: 220, JPY: -137, GBP: -220 },
{ date: "2024-04-15", EUR: 120, USD: 170, JPY: -120, GBP: -170 },
{ date: "2024-04-16", EUR: 138, USD: 190, JPY: -138, GBP: -190 },
{ date: "2024-04-17", EUR: 446, USD: 360, JPY: -446, GBP: -360 },
{ date: "2024-04-18", EUR: 364, USD: 410, JPY: -364, GBP: -410 },
{ date: "2024-04-19", EUR: 243, USD: 180, JPY: -243, GBP: -180 },
{ date: "2024-04-20", EUR: 89, USD: 150, JPY: -89, GBP: -150 },
{ date: "2024-04-21", EUR: 137, USD: 200, JPY: -137, GBP: -200 },
{ date: "2024-04-22", EUR: 224, USD: 170, JPY: -224, GBP: -170 },
{ date: "2024-04-23", EUR: 138, USD: 230, JPY: -138, GBP: -230 },
{ date: "2024-04-24", EUR: 387, USD: 290, JPY: -387, GBP: -290 },
{ date: "2024-04-25", EUR: 215, USD: 250, JPY: -215, GBP: -250 },
{ date: "2024-04-26", EUR: 75, USD: 130, JPY: -75, GBP: -130 },
{ date: "2024-04-27", EUR: 383, USD: 420, JPY: -383, GBP: -420 },
{ date: "2024-04-28", EUR: 122, USD: 180, JPY: -122, GBP: -180 },
{ date: "2024-04-29", EUR: 315, USD: 240, JPY: -315, GBP: -240 },
{ date: "2024-04-30", EUR: 454, USD: 380, JPY: -454, GBP: -380 },
{ date: "2024-05-01", EUR: 165, USD: 220, JPY: -165, GBP: -220 },
{ date: "2024-05-02", EUR: 293, USD: 310, JPY: -293, GBP: -310 },
{ date: "2024-05-03", EUR: 247, USD: 190, JPY: -247, GBP: -190 },
{ date: "2024-05-04", EUR: 385, USD: 420, JPY: -385, GBP: -420 },
{ date: "2024-05-05", EUR: 481, USD: 390, JPY: -481, GBP: -390 },
{ date: "2024-05-06", EUR: 498, USD: 520, JPY: -498, GBP: -520 },
{ date: "2024-05-07", EUR: 388, USD: 300, JPY: -388, GBP: -300 },
{ date: "2024-05-08", EUR: 149, USD: 210, JPY: -149, GBP: -210 },
{ date: "2024-05-09", EUR: 227, USD: 180, JPY: -227, GBP: -180 },
{ date: "2024-05-10", EUR: 293, USD: 330, JPY: -293, GBP: -330 },
{ date: "2024-05-11", EUR: 335, USD: 270, JPY: -335, GBP: -270 },
{ date: "2024-05-12", EUR: 197, USD: 240, JPY: -197, GBP: -240 },
{ date: "2024-05-13", EUR: 197, USD: 160, JPY: -197, GBP: -160 },
{ date: "2024-05-14", EUR: 448, USD: 490, JPY: -448, GBP: -490 },
{ date: "2024-05-15", EUR: 473, USD: 380, JPY: -473, GBP: -380 },
{ date: "2024-05-16", EUR: 338, USD: 400, JPY: -338, GBP: -400 },
{ date: "2024-05-17", EUR: 499, USD: 420, JPY: -499, GBP: -420 },
{ date: "2024-05-18", EUR: 315, USD: 350, JPY: -315, GBP: -350 },
{ date: "2024-05-19", EUR: 235, USD: 180, JPY: -235, GBP: -180 },
{ date: "2024-05-20", EUR: 177, USD: 230, JPY: -177, GBP: -230 },
{ date: "2024-05-21", EUR: 82, USD: 140, JPY: -82, GBP: -140 },
{ date: "2024-05-22", EUR: 81, USD: 120, JPY: -81, GBP: -120 },
{ date: "2024-05-23", EUR: 252, USD: 290, JPY: -252, GBP: -290 },
{ date: "2024-05-24", EUR: 294, USD: 220, JPY: -294, GBP: -220 },
{ date: "2024-05-25", EUR: 201, USD: 250, JPY: -201, GBP: -250 },
{ date: "2024-05-26", EUR: 213, USD: 170, JPY: -213, GBP: -170 },
{ date: "2024-05-27", EUR: 420, USD: 460, JPY: -420, GBP: -460 },
{ date: "2024-05-28", EUR: 233, USD: 190, JPY: -233, GBP: -190 },
{ date: "2024-05-29", EUR: 78, USD: 130, JPY: -78, GBP: -130 },
{ date: "2024-05-30", EUR: 340, USD: 280, JPY: -340, GBP: -280 },
{ date: "2024-05-31", EUR: 178, USD: 230, JPY: -178, GBP: -230 },
{ date: "2024-06-01", EUR: 178, USD: 200, JPY: -178, GBP: -200 },
{ date: "2024-06-02", EUR: 470, USD: 410, JPY: -470, GBP: -410 },
{ date: "2024-06-03", EUR: 103, USD: 160, JPY: -103, GBP: -160 },
{ date: "2024-06-04", EUR: 439, USD: 380, JPY: -439, GBP: -380 },
{ date: "2024-06-05", EUR: 88, USD: 140, JPY: -88, GBP: -140 },
{ date: "2024-06-06", EUR: 294, USD: 250, JPY: -294, GBP: -250 },
{ date: "2024-06-07", EUR: 323, USD: 370, JPY: -323, GBP: -370 },
{ date: "2024-06-08", EUR: 385, USD: 320, JPY: -385, GBP: -320 },
{ date: "2024-06-09", EUR: 438, USD: 480, JPY: -438, GBP: -480 },
{ date: "2024-06-10", EUR: 155, USD: 200, JPY: -155, GBP: -200 },
{ date: "2024-06-11", EUR: 92, USD: 150, JPY: -92, GBP: -150 },
{ date: "2024-06-12", EUR: 492, USD: 420, JPY: -492, GBP: -420 },
{ date: "2024-06-13", EUR: 81, USD: 130, JPY: -81, GBP: -130 },
{ date: "2024-06-14", EUR: 426, USD: 380, JPY: -426, GBP: -380 },
{ date: "2024-06-15", EUR: 307, USD: 350, JPY: -307, GBP: -350 },
{ date: "2024-06-16", EUR: 371, USD: 310, JPY: -371, GBP: -310 },
{ date: "2024-06-17", EUR: 475, USD: 520, JPY: -475, GBP: -520 },
{ date: "2024-06-18", EUR: 107, USD: 170, JPY: -107, GBP: -170 },
{ date: "2024-06-19", EUR: 341, USD: 290, JPY: -341, GBP: -290 },
{ date: "2024-06-20", EUR: 408, USD: 450, JPY: -408, GBP: -450 },
{ date: "2024-06-21", EUR: 169, USD: 210, JPY: -169, GBP: -210 },
{ date: "2024-06-22", EUR: 317, USD: 270, JPY: -317, GBP: -270 },
{ date: "2024-06-23", EUR: 480, USD: 530, JPY: -480, GBP: -530 },
{ date: "2024-06-24", EUR: 132, USD: 180, JPY: -132, GBP: -180 },
{ date: "2024-06-25", EUR: 141, USD: 190, JPY: -141, GBP: -190 },
{ date: "2024-06-26", EUR: 434, USD: 380, JPY: -434, GBP: -380 },
{ date: "2024-06-27", EUR: 448, USD: 490, JPY: -448, GBP: -490 },
{ date: "2024-06-28", EUR: 149, USD: 200, JPY: -149, GBP: -200 },
{ date: "2024-06-29", EUR: 103, USD: 160, JPY: -103, GBP: -160 },
{ date: "2024-06-30", EUR: 446, USD: 400, JPY: -446, GBP: -400 },

]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  EUR: {
    label: "EUR",
    color: "hsl(var(--chart-1))",
  },
  USD: {
    label: "USD",
    color: "hsl(var(--chart-2))",
  },
  JPY: {
    label: "JPY",
    color: "hsl(var(--chart-3))",
  },
  GBP: {
    label: "GBP",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function CurrencyStrength() {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const now = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    now.setDate(now.getDate() - daysToSubtract)
    return date >= now
  })

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-left text-sm">
          <span>Currency Strength</span>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-[550px]"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillEUR" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="10%"
                  stopColor="var(--color-EUR)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-EUR)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillUSD" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="10%"
                  stopColor="var(--color-USD)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-USD)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillJPY" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="10%"
                  stopColor="var(--color-JPY)"
                  stopOpacity={0.1}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-JPY)"
                  stopOpacity={0.8}
                />
              </linearGradient>
              <linearGradient id="fillGBP" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="10%"
                  stopColor="var(--color-GBP)"
                  stopOpacity={0.1}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-GBP)"
                  stopOpacity={0.8}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} horizontal={false} />
            <YAxis 
              domain={[-1000, 1000]} 
              tickLine={false}
              axisLine={false} 
              hide={true}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="USD"
              type="natural"
              fill="url(#fillUSD)"
              stroke="var(--color-USD)"
              stackId="a"
            />
            <Area
              dataKey="EUR"
              type="natural"
              fill="url(#fillEUR)"
              stroke="var(--color-EUR)"
              stackId="a"
            />
            <Area
              dataKey="JPY"
              type="natural"
              fill="url(#fillJPY)"
              stroke="var(--color-JPY)"
              stackId="b"
            />
            <Area
              dataKey="GBP"
              type="natural"
              fill="url(#fillGBP)"
              stroke="var(--color-GBP)"
              stackId="b"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
