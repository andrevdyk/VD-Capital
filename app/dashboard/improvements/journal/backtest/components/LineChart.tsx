"use client"

import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LineChartData {
  date: Date
  close: number
}

interface CustomLineChartProps {
  data: LineChartData[]
  symbol: string
}

const chartConfig: ChartConfig = {
  close: {
    label: "Close",
    color: "hsl(var(--chart-1))",
  },
}

export function CustomLineChart({ data, symbol }: CustomLineChartProps) {
  const minValue = Math.min(...data.map(d => d.close))
  const maxValue = Math.max(...data.map(d => d.close))
  const yAxisMin = minValue - (minValue * 0.1)
  const yAxisMax = maxValue + (maxValue * 0.1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Chart</CardTitle>
        <CardDescription>{symbol} - Last {data.length} data points</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), "MM/dd")}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={50}
              />
              <YAxis
                domain={[yAxisMin, yAxisMax]}
                orientation="right"
                tickFormatter={(value) => value.toFixed(2)}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={false}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke="var(--color-close)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

