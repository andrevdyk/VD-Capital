"use client";
import * as React from "react";
import { Pie, PieChart, Label } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface CFTCData {
  report_date: string;
  dealer_positions_long_all: number;
  dealer_positions_short_all: number;
}

export function BaseDealerDonut() {
  const [data, setData] = React.useState<CFTCData[]>([]);
  const [chartData, setChartData] = React.useState([
    { pair: "Long Positions", volume: 0, fill: "#03b198" },
    { pair: "Short Positions", volume: 0, fill: "#ff2f67" },
  ]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Chart configuration
  const chartConfig: ChartConfig = {
    longPositions: {
      label: "Long Positions",
      color: "hsl(var(--chart-1))",
    },
    shortPositions: {
      label: "Short Positions",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  // Fetch CFTC data from your API
  React.useEffect(() => {
    const fetchCFTCData = async () => {
      try {
        const response = await fetch("/api/cftc");
        if (!response.ok) throw new Error("Network response was not ok");
        const result: CFTCData[] = await response.json();

        // Find the max report date
        const maxDate = result.reduce((max, current) => {
          return new Date(current.report_date) > new Date(max) ? current.report_date : max;
        }, result[0].report_date);

        // Filter to get the relevant data for the max report date
        const latestData = result.find(item => item.report_date === maxDate);

        if (latestData) {
          const { dealer_positions_long_all, dealer_positions_short_all } = latestData;
          setChartData([
            { pair: "Long Positions", volume: dealer_positions_long_all, fill: "#03b198" },
            { pair: "Short Positions", volume: dealer_positions_short_all, fill: "#ff2f67" },
          ]);
          setData([latestData]);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCFTCData();
  }, []);

  // Total positions for display
  const totalPositions = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.volume, 0);
  }, [chartData]);

  // Calculate net long percentage
  const netLongPercentage = React.useMemo(() => {
    return totalPositions === 0 ? 0 : ((chartData[0].volume / totalPositions) * 100).toFixed(1);
  }, [chartData, totalPositions]);

  // Calculate short percentage
  const netShortPercentage = React.useMemo(() => {
    return totalPositions === 0 ? 0 : ((chartData[1].volume / totalPositions) * 100).toFixed(1);
  }, [chartData, totalPositions]);

  return (
    <div>
    <Card className="flex flex-col w-[250px]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-left text-sm">
          <span>Dealer Intermediary</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Pie
                data={chartData}
                dataKey="volume"
                nameKey="pair"
                innerRadius={50}
                strokeWidth={0}
                label={false} // Disable default labels
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0)}
                            className="fill-foreground text-xl font-bold"
                          >
                            {netLongPercentage}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Net Long %
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
    
    </div>
  );
}
