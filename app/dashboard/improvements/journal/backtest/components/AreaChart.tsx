"use client"

import { Area, AreaChart as RechartsAreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AreaChartData {
  date: Date
  close: number
}

interface AreaChartProps {
  data: AreaChartData[]
}

export function AreaChart({ data }: AreaChartProps) {
  const minValue = Math.min(...data.map(d => d.close))
  const maxValue = Math.max(...data.map(d => d.close))
  const yAxisMin = minValue - (minValue * 0.1)
  const yAxisMax = maxValue + (maxValue * 0.1)

  return (
    <ChartContainer
      config={{
        close: {
          label: "Close",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[calc(100vh-200px)]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(new Date(value), "MM/dd")}
            minTickGap={50}
          />
          <YAxis
            domain={[yAxisMin, yAxisMax]}
            orientation="right"
            tickFormatter={(value) => value.toFixed(2)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4338ca" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="close"
            stroke="var(--color-close)"
            fillOpacity={1}
            fill="url(#colorClose)"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

