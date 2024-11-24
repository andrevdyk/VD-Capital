"use client"
import { TrendingUp } from "lucide-react"
import { LabelList, RadialBar, RadialBarChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { browser: "Profitability", visitors: 80, fill: "#ff2f67" },
  { browser: "ROE", visitors: 200, fill: "#00ff7f" },
  { browser: "EBITDA", visitors: 187, fill: "#FE7667" },
  { browser: "FCF", visitors: 173, fill: "#fa409d" },
  { browser: "NET", visitors: 283, fill: "#7C00FE" },
]
const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  Profitability: {
    label: "Profitability",
    color: "hsl(var(--chart-1))",
  },
  ROE: {
    label: "ROE",
    color: "hsl(var(--chart-2))",
  },
  EBITDA: {
    label: "EBITDA Margin",
    color: "hsl(var(--chart-3))",
  },
  FCF: {
    label: "Free Cash Flow Margin",
    color: "hsl(var(--chart-4))",
  },
  NET: {
    label: "Net Margin",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig
export function RadialChart() {
  return (
    <Card className="flex flex-col aspect-square w-[220px]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-left text-sm">
          <span>Company Quality</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={380}
            innerRadius={10}
            outerRadius={80}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="browser" />}
            />
            <RadialBar dataKey="visitors" background>
              <LabelList
                position="insideStart"
                dataKey="browser"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}