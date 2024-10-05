"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

interface CustomPayload extends Payload<number, string> {
  close: number; // Add the `close` property
}

// Define your custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded p-2 shadow-md">
        <p className="font-semibold">{label}</p>
        {payload.map((entry: CustomPayload, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            % Change: {entry.value}%
          </p>
        ))}
        {/* Accessing the close value from the first entry */}
        <p>Close: {payload[0].payload.close}</p>
        <p>Probability: {payload[0].payload.probability}%</p>
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
const supabaseUrl = "https://nobtgazxiggvkrwxugpq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vYnRnYXp4aWdndmtyd3h1Z3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2Nzk5OTIsImV4cCI6MjA0MjI1NTk5Mn0.SWmzkATJ5uUNhCrFdXB-FeCEL3wcVk6p_eDqXpOD-qg"; // Replace this with your key
const supabase = createClient(supabaseUrl, supabaseKey);

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
            <YAxis domain={[Math.min( minPercentageChange) - (Math.min(minPercentageChange) * 0.1), Math.max( maxPercentageChange) +  - (Math.min(minPercentageChange) * 0.1)]} tickLine={false} axisLine={false}  />
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
  );
}
