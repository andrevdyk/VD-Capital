"use client"; 
import * as React from "react";
import { Pie, PieChart, Label, Cell } from "recharts";
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
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { TooltipProps } from 'recharts';

interface CFTCData {
  report_date: string;
  lev_money_positions_long: number;
  lev_money_positions_short: number;
  commodity_subgroup_name: string;
  contract_market_name: string;
}

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const netLong = payload[0]?.value || 0;
    const netShort = payload[1]?.value || 0;

    return (
      <div className="custom-tooltip grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
        <p className="label font-semibold">Leveraged Funds</p>

        <div className="flex justify-between">
          <p className="desc text-muted-foreground" style={{ color: payload[0]?.color }}>
            Positions: 
          </p>
          <p className="desc">{netLong} </p>
        </div>
      </div>
    );
  }

  return null;
};

export function LeveragedDonut() {
  const [data, setData] = React.useState<CFTCData[]>([]);
  const [chartData, setChartData] = React.useState([
    { pair: "Long Positions", volume: 0, fill: "#03b198" },
    { pair: "Short Positions", volume: 0, fill: "rgb(255,47,103, 0.5)" },
  ]);
  const [secondChartData, setSecondChartData] = React.useState([
    { pair: "Long Positions", volume: 0, fill: "#03b198" },
    { pair: "Short Positions", volume: 0, fill: "rgb(255,47,103, 0.5)" },
  ]);
  const [contractMarkets, setContractMarkets] = React.useState<string[]>([]);
  const [selectedContract, setSelectedContract] = React.useState<string | undefined>(undefined);
  const [secondSelectedContract, setSecondSelectedContract] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCFTCData = async () => {
      try {
        const response = await fetch("/api/cftc");
        if (!response.ok) throw new Error("Network response was not ok");
        const result: CFTCData[] = await response.json();
        setData(result);

        const markets = Array.from(
          new Set(
            result
              .filter(
                item =>
                  item.commodity_subgroup_name === "CURRENCY" ||
                  item.commodity_subgroup_name === "CURRENCY(NON-MAJOR)"
              )
              .map(item => item.contract_market_name)
          )
        );
        setContractMarkets(markets);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCFTCData();
  }, []);

  React.useEffect(() => {
    if (!selectedContract) return;

    const filteredData = data.filter(item => item.contract_market_name === selectedContract);

    if (filteredData.length > 0) {
      const maxDate = filteredData.reduce((max, current) => {
        return new Date(current.report_date) > new Date(max) ? current.report_date : max;
      }, filteredData[0].report_date);

      const latestData = filteredData.find(item => item.report_date === maxDate);

      if (latestData) {
        const { lev_money_positions_long, lev_money_positions_short } = latestData;
        setChartData([
          { pair: "Long Positions", volume: lev_money_positions_long, fill: "#03b198" },
          { pair: "Short Positions", volume: lev_money_positions_short, fill: "#ff2f67" },
        ]);
      }
    }
  }, [selectedContract, data]);

  React.useEffect(() => {
    if (!secondSelectedContract) return;

    const filteredData = data.filter(item => item.contract_market_name === secondSelectedContract);

    if (filteredData.length > 0) {
      const maxDate = filteredData.reduce((max, current) => {
        return new Date(current.report_date) > new Date(max) ? current.report_date : max;
      }, filteredData[0].report_date);

      const latestData = filteredData.find(item => item.report_date === maxDate);

      if (latestData) {
        const { lev_money_positions_long, lev_money_positions_short } = latestData;
        setSecondChartData([
          { pair: "Long Positions", volume: lev_money_positions_long, fill: "#03b198" },
          { pair: "Short Positions", volume: lev_money_positions_short, fill: "#ff2f67" },
        ]);
      }
    }
  }, [secondSelectedContract, data]);

  const totalPositions = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.volume, 0);
  }, [chartData]);

  const netLongPercentage = React.useMemo(() => {
    return totalPositions === 0 ? 0 : ((chartData[0].volume / totalPositions) * 100).toFixed(1);
  }, [chartData, totalPositions]);

  const totalSecondPositions = React.useMemo(() => {
    return secondChartData.reduce((acc, curr) => acc + curr.volume, 0);
  }, [secondChartData]);

  const secondNetLongPercentage = React.useMemo(() => {
    return totalSecondPositions === 0 ? 0 : ((secondChartData[0].volume / totalSecondPositions) * 100).toFixed(1);
  }, [secondChartData, totalSecondPositions]);

  const chartConfig: ChartConfig = {
    // Add any chart configuration here if needed
  };

  return (
    <Card className="flex flex-col w-[400px] h-[225px]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-left text-sm">
          <span>Leveraged Funds</span>
        </div>
      </CardHeader>
      <div className="flex flex-row">
        <div className="w-[50%] flexbox justify-center pb-2 border-r h-[185px]">
        <Select value={selectedContract ?? undefined} onValueChange={setSelectedContract}>
          <SelectTrigger className="w-[160px] rounded-lg ml-[10%]" aria-label="Select Currency">
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
        <CardContent className="flexbox justify-center left-0">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <ChartContainer className="mx-auto aspect-square " config={chartConfig}>
              <PieChart>
                <ChartTooltip cursor={false} content={<CustomTooltip />} />
                <Pie data={chartData} dataKey="volume" nameKey="pair" innerRadius={45} fillOpacity={0.5} >
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
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">
                              {netLongPercentage}%
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground">
                              Net Long
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill} // Use the fill color from your data
                    stroke={entry.fill} // Outline color matching the fill
                    strokeWidth={1.5} // Set outline width
                    fillOpacity={0.5} // Fill opacity for each segment
                  />
                ))}
              </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
        </div>
        
        <div className="w-[50%] justify-center ">
        <CardContent className="flex-1 pb-0">
          <div className=" mr-0">
          <Select value={secondSelectedContract ?? undefined} onValueChange={setSecondSelectedContract}>
              <SelectTrigger className="w-[160px] rounded-lg ml-[1%]" aria-label="Select Currency">
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
            </div>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <ChartContainer className="mx-auto aspect-square" config={chartConfig}>
              <PieChart>
                <ChartTooltip cursor={false} content={<CustomTooltip />} />
                <Pie data={secondChartData} dataKey="volume" nameKey="pair" innerRadius={45} fillOpacity={0.5}>
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
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">
                            {secondNetLongPercentage}%
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground">
                            Net Long
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
                {secondChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill} // Use the fill color from your data
                    stroke={entry.fill} // Outline color matching the fill
                    strokeWidth={1.5} // Set outline width
                    fillOpacity={0.5} // Fill opacity for each segment
                  />
                ))}
              </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
        </div>
      </div>
    </Card>
  );
}
