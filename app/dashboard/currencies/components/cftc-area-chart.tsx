"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export const description = "An area chart with gradient fill";

// Define the type for your CFTC data
type CFTCData = {
  report_date: string;
  open_interest_all: number;
  dealer_positions_long_all: number;
  dealer_positions_short_all: number;
  asset_mgr_positions_long: number;
  asset_mgr_positions_short: number;
  lev_money_positions_long: number;
  lev_money_positions_short: number;
  commodity_subgroup_name: string;
  contract_market_name: string;
};

// Set the initial chart data state
const chartConfig = {
  dealerlong: {
    label: "Dealer Longs",
    color: "hsl(var(--chart-1))", // Adjust colors based on your theme
  },
  dealershort: {
    label: "Dealer Shorts",
    color: "hsl(var(--chart-2))",
  },
  assetlong: {
    label: "Asset Mgr Longs",
    color: "hsl(var(--chart-1))", // Adjust colors based on your theme
  },
  assetshort: {
    label: "Asset Mgr Shorts",
    color: "hsl(var(--chart-2))",
  },
  levlong: {
    label: "Lvrgd Fund Longs",
    color: "hsl(var(--chart-1))", // Adjust colors based on your theme
  },
  levshort: {
    label: "Lvrgd Fund Shorts",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function CFTCChart() {
    const [data, setData] = useState<CFTCData[]>([]);
    const [selectedContract, setSelectedContract] = useState<string | undefined>(undefined); // Changed to use undefined
    const [contractMarkets, setContractMarkets] = useState<string[]>([]);
  
    // Fetch CFTC data from your API
    useEffect(() => {
      const fetchCFTCData = async () => {
        const response = await fetch("/api/cftc");
        const result: CFTCData[] = await response.json();
        setData(result);
  
        // Extract unique contract market names for CURRENCY subgroup
        const markets = Array.from(
          new Set(
            result
              .filter(item => item.commodity_subgroup_name === "CURRENCY" ||
                item.commodity_subgroup_name === "CURRENCY(NON-MAJOR)")
              .map(item => item.contract_market_name)
          )
        );
        setContractMarkets(markets);
      };
  
      fetchCFTCData();
    }, []);
  
    // Get the date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
    // Filter data for the selected commodity subgroup, contract market, and the last 6 months
    const filteredData = data.filter(item => {
      const reportDate = new Date(item.report_date);
      return (
        item.commodity_subgroup_name === "CURRENCY" || item.commodity_subgroup_name === "CURRENCY(NON-MAJOR)" &&
        (selectedContract ? item.contract_market_name === selectedContract : true) &&
        reportDate >= sixMonthsAgo // Filter for the last 6 months
      );
    });
  
    // Format the data to be compatible with Recharts
    const formattedData = filteredData.map(item => ({
      report_date: item.report_date,
      dealerlong: item.dealer_positions_long_all,
      dealershort: item.dealer_positions_short_all,
      assetlong: item.asset_mgr_positions_long,
      assetshort: item.asset_mgr_positions_short,
      levlong: item.lev_money_positions_long,
      levshort: item.lev_money_positions_short,
    }));

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-left text-sm">
          <span>CFTC Data</span>
        </div>
        <CardDescription>Dealer Intermediary</CardDescription>
        <Select value={selectedContract} onValueChange={setSelectedContract}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select Currency"
          >
            <SelectValue placeholder="Select Contract Market" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {contractMarkets.map(market => (
              <SelectItem key={market} value={market} className="rounded-lg">
                {market}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-[550px]">
          <AreaChart
            accessibilityLayer
            data={formattedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="report_date"
              tickLine={false}
              axisLine={false}
              tickMargin={16}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }} 
              reversed // Add this line to flip the X-axis
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillDealerLong" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#03b198" //#D3FE3E
                  stopOpacity={0.2}
                />
                <stop
                  offset="75%"
                  stopColor="#03b198"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillDealerShort" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#ff2f67" //#693EFE
                  stopOpacity={0.2}
                />
                <stop
                  offset="75%"
                  stopColor="#ff2f67"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillAssetLong" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#D3FE3E" //#D3FE3E
                  stopOpacity={0.2}
                />
                <stop
                  offset="75%"
                  stopColor="#D3FE3E"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillAssetShort" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#693EFE" //#693EFE
                  stopOpacity={0.2}
                />
                <stop
                  offset="75%"
                  stopColor="#693EFE"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillLevLong" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#40CAFC" 
                  stopOpacity={0.2}
                />
                <stop
                  offset="75%"
                  stopColor="#40CAFC"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillLevShort" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#FC7240" 
                  stopOpacity={0.2}
                />
                <stop
                  offset="75%"
                  stopColor="#FC7240"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="dealerlong"
              type="natural"
              fill="url(#fillDealerLong)"
              fillOpacity={0.2}
              stroke="#03b198"
              stackId="a"
            />
            <Area
              dataKey="dealershort"
              type="natural"
              fill="url(#fillDealerShort)"
              fillOpacity={0.2}
              stroke="#ff2f67"
              stackId="a"
            />
            <Area
              dataKey="assetlong"
              type="natural"
              fill="url(#fillAssetLong)"
              fillOpacity={0.2}
              stroke="#D3FE3E"
              stackId="a"
            />
            <Area
              dataKey="assetshort"
              type="natural"
              fill="url(#fillAssetShort)"
              fillOpacity={0.2}
              stroke="#693EFE"
              stackId="a"
            />
            <Area
              dataKey="levlong"
              type="natural"
              fill="url(#fillLevLong)"
              fillOpacity={0.2}
              stroke="#40CAFC"
              stackId="a"
            />
            <Area
              dataKey="levshort"
              type="natural"
              fill="url(#fillLevShort)"
              fillOpacity={0.2}
              stroke="#FC7240"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
