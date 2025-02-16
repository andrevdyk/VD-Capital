"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { TooltipProps } from 'recharts';


const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
        <p className="label font-semibold">{label}</p> {/* Set label color to gray */}
        
        {/* Space out the tooltip and align values to the right */}
        <div className="flex justify-between">
          <p className="desc text-muted-foreground" style={{ color: payload[0].color }}>
            % Change: 
          </p>
          <p className="desc">{payload[0].value}%</p>
        </div>
        
        <div className="flex justify-between">
          <p className="desc text-muted-foreground">Close: </p>
          <p className="desc">{payload[0].payload.close}</p>
        </div>

        <div className="flex justify-between">
          <p className="desc text-muted-foreground">Probability: </p>
          <p className="desc">{payload[0].payload.probability}%</p>
        </div>
      </div>
    );
  }

  return null;
};

// Define Chart Data type
type ChartData = {
  date: string;
  close: number;
  percentage_change: number;
  pair: string; // Add pair to the ChartData type
  probability: number;
};

// Supabase setup
const supabase = createClient();

export function Seasonality() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedPair, setSelectedPair] = useState("EURUSD"); // Initialize with a default pair
  const pairs = ["AUDUSD", "EURCAD", "EURCHF", "EURGBP", "EURHUF", "EURJPY", "EURSEK", "EURUSD", "GBPJPY", "GBPUSD", "NZDUSD", 
    "USDCNY", "USDHKD", "USDIDR", "USDINR", "USDJPY", "USDMXN", "USDMYR", "USDPHP", "USDRUB", "USDSGD", "USDTHB", "USDZAR"
]; 

  useEffect(() => {
    const fetchPredictionData = async () => {
      const { data, error } = await supabase
        .from("seasonality_currencies")
        .select("date, close, percentage_change, pair, probability")
        .eq("past_prediction", "Prediction")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        const formattedData: ChartData[] = data.map((item) => ({
          date: new Date(item.date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          close: item.close,
          percentage_change: item.percentage_change,
          pair: item.pair, // Include pair in formatted data
          probability: item.probability,
        }));

        setChartData(formattedData);
      }
    };

    fetchPredictionData();
  }, []);

  const filteredData = chartData.filter((item) => item.pair === selectedPair); // Filter data by selected pair

  // Calculate min and max for YAxis
  const closeValues = filteredData.map(item => item.close);
  const percentageChangeValues = filteredData.map(item => item.percentage_change);

  const minClose = closeValues.length > 0 ? Math.min(...closeValues) : 0;
  const maxClose = closeValues.length > 0 ? Math.max(...closeValues) : 100;
  const minPercentageChange = percentageChangeValues.length > 0 ? Math.min(...percentageChangeValues) : -100;
  const maxPercentageChange = percentageChangeValues.length > 0 ? Math.max(...percentageChangeValues) : 100;
  const totalDistance = maxPercentageChange - minPercentageChange;
  const basePercentageOffset = 100 - (minPercentageChange/totalDistance) * -100;
  const basePercentageOffsetplus = basePercentageOffset + 1;
  const basePercentageOffsetminus = basePercentageOffset - 1;

  const chartConfig = {
    percentage_change: {
      label: "Change: ",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;


  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-left text-sm">
          <span>Seasonality</span>
        </div>
        <CardDescription>Prediction next 3 months</CardDescription>
        <Select value={selectedPair} onValueChange={setSelectedPair}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a pair"
          >
            <SelectValue placeholder="Select Currency Pair" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {pairs.map((pair) => (
              <SelectItem key={pair} value={pair} className="rounded-lg">
                {pair}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-[550px]"
        >
          <AreaChart data={filteredData}>
            <defs>
            <linearGradient id="fillPercentageChange" x1="0" y1="0" x2="0" y2="1">
              {/* Positive area gradient (above 0%) */}
              <stop
                offset= "0%" // This sets where the gradient changes
                stopColor="#03b198"
                stopOpacity={0.8}
              />

              <stop
                offset={`${basePercentageOffset}%`} // Same base point for the transition
                stopColor="#000000"
                stopOpacity={0.0}
              />
              <stop
                offset="100%"
                stopColor="#ff2f67"
                stopOpacity={0.8}
              />
            </linearGradient>
            <linearGradient id="strokePercentageChange" x1="0" y1="0" x2="0" y2="1">
              {/* Positive stroke gradient */}
              <stop
                offset= "0%" // This sets where the gradient changes
                stopColor="#03b198"
                stopOpacity={1}
              />

              <stop
                offset={`${basePercentageOffsetminus}%`} // Same base point for the transition
                stopColor="#03b198"
                stopOpacity={1}
              />
              <stop
                offset={`${basePercentageOffset}%`} // Same base point for the transition
                stopColor="#03b198"
                stopOpacity={1}
              />
              <stop
                offset={`${basePercentageOffsetplus}%`} // Same base point for the transition
                stopColor="#ff2f67"
                stopOpacity={1}
              />
              <stop
                offset="100%"
                stopColor="#ff2f67"
                stopOpacity={1}
              />
              {/* Negative stroke gradient */}
            </linearGradient>
            </defs>
            <CartesianGrid vertical={false} horizontal={false} />
            <YAxis domain={[Math.min( minPercentageChange) - (Math.min(minPercentageChange) * 0.3), Math.max( maxPercentageChange) +  - (Math.min(minPercentageChange) * 0.3)]} tickLine={false} axisLine={false} hide />
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
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Area
              dataKey="percentage_change"
              type="natural"
              fill="url(#fillPercentageChange)"
              stroke="url(#strokePercentageChange)"
              stackId="a"
            >
              <LabelList
                dataKey="percentage_change"
                position="top"
                formatter={(value: number) => `${value}%`}
                fill="gray" // Label color
                offset={10} // Adjusts the distance between label and the point
              />
            </Area>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
