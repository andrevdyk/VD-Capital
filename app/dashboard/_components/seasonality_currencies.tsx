import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { createClient } from "@/utils/supabase/server";
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

export async function Seasonality() {
  const supabase = createClient()
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const fetchPredictionData = async () => {
      const { data, error } = await supabase
        .from("seasonality_currencies")
        .select("date, close, percentage_change, pair")
        .eq("past_prediction", "Prediction")
        .order("date", { ascending: true })

      if (error) {
        console.error("Error fetching data:", error)
      } else {
        const formattedData = data.map((item) => ({
          date: new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          close: item.close,
          percentage_change: item.percentage_change,
        }))
        setChartData(formattedData)
      }
    }

    fetchPredictionData()
  }, [])

  const chartConfig = {
    close: {
      label: "Close Price",
      color: "hsl(var(--chart-1))",
    },
    percentage_change: {
      label: "Percentage Change",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seasonality</CardTitle>
        <CardDescription>Prediction next 3 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-[550px]">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="var(--color-close)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-close)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillPercentageChange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="var(--color-percentage_change)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-percentage_change)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} horizontal={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="close"
              type="natural"
              fill="url(#fillClose)"
              stroke="var(--color-close)"
              stackId="a"
            />
            <Area
              dataKey="percentage_change"
              type="natural"
              fill="url(#fillPercentageChange)"
              stroke="var(--color-percentage_change)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up in predictions
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Predictions based on seasonal analysis
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}