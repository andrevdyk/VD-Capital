"use client"

import { useState, useEffect, useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, ReferenceLine, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'
import React, { Fragment } from 'react'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DataPoint {
  date: string
  profit: number
  totalProfit: number
  [key: string]: string | number
}

interface Trade {
  net_profit: number
  side: 'Buy' | 'Sell'
  // Add other trade properties as needed
}

interface AreaChartProps {
  data: DataPoint[] | { name: string; data: DataPoint[] }[]
  mode: 'evaluation' | 'simulation'
  trades: Trade[]
  allTrades: Trade[]
}

const POSITIVE_COLOR = "#03b198";
const NEGATIVE_COLOR = "#ff004d";
const FILTERED_COLOR = "#4338ca";

const formatLargeNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return "N/A";
  const roundedNum = Math.abs(num).toFixed(2);
  const [integerPart, decimalPart] = roundedNum.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${num < 0 ? '-' : ''}${formattedInteger}.${decimalPart}`;
};

export function AreaChartComponent({ data, mode, trades, allTrades }: AreaChartProps) {
  const [chartData, setChartData] = useState<DataPoint[] | { name: string; data: DataPoint[] }[]>([])
  const [viewType, setViewType] = useState<'accumulative' | 'ordinary'>('accumulative')
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area')
  const [timeGrouping, setTimeGrouping] = useState<'day' | 'month' | 'year'>('day')

  useEffect(() => {
    setChartData(data)
  }, [data])

  const handleViewTypeChange = (value: 'accumulative' | 'ordinary') => {
    setViewType(value)
  }

  const reverseChartData = (data: DataPoint[]) => [...data].reverse();

  const formatNumber = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return (value / 1000000).toFixed(2) + 'M';
    } else if (absValue >= 1000) {
      return (value / 1000).toFixed(2) + 'K';
    }
    return value.toFixed(2);
  };

  const formatXAxisTick = (dateString: string) => {
    if (!dateString) return 'Baseline';
    const date = new Date(dateString);
    switch (timeGrouping) {
      case 'month':
        return format(date, 'MMM yyyy');
      case 'year':
        return format(date, 'yyyy');
      default: // day
        return format(date, 'dd MMM');
    }
  };

  const metrics = useMemo(() => {
    const calculateMetrics = (trades: Trade[]) => {
      const totalReturn = trades.reduce((sum, trade) => sum + trade.net_profit, 0);
      const winningTrades = trades.filter(trade => trade.net_profit > 0);
      const losingTrades = trades.filter(trade => trade.net_profit < 0);
      const winRate = (winningTrades.length / trades.length) * 100;
      const longTrades = trades.filter(trade => trade.side === 'Buy');
      const shortTrades = trades.filter(trade => trade.side === 'Sell');
      
      // Calculate Sharpe Ratio (assuming risk-free rate of 0 for simplicity)
      const averageReturn = totalReturn / trades.length;
      const stdDev = Math.sqrt(trades.reduce((sum, trade) => sum + Math.pow(trade.net_profit - averageReturn, 2), 0) / trades.length);
      const sharpeRatio = averageReturn / stdDev;
      
      // Calculate Z-Score (assuming normal distribution)
      const zScore = averageReturn / (stdDev / Math.sqrt(trades.length));
      
      // Calculate Expectancy
      const averageWin = winningTrades.length > 0 ? winningTrades.reduce((sum, trade) => sum + trade.net_profit, 0) / winningTrades.length : 0;
      const averageLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, trade) => sum + trade.net_profit, 0) / losingTrades.length) : 0;
      const expectancy = (winRate / 100 * averageWin) - ((1 - winRate / 100) * averageLoss);

      return {
        return: totalReturn,
        winRate,
        tradeCount: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        longTrades: longTrades.length,
        shortTrades: shortTrades.length,
        sharpeRatio,
        zScore,
        expectancy
      };
    };

    const filteredMetrics = calculateMetrics(trades);
    const allTradesMetrics = mode === 'simulation' ? calculateMetrics(allTrades) : null;

    return { filtered: filteredMetrics, all: allTradesMetrics };
  }, [trades, mode, allTrades]);

  const renderChart = () => {
    const dataKey = viewType === 'accumulative' ? 'totalProfit' : 'profit'
    
    let chartDataToUse: DataPoint[];
    let multipleDatasets = false;

    if (Array.isArray(chartData) && chartData.length > 0 && 'name' in chartData[0]) {
      multipleDatasets = true;
      chartDataToUse = (chartData as { name: string; data: DataPoint[] }[])[0].data;
    } else {
      chartDataToUse = chartData as DataPoint[];
    }

    const reversedData = reverseChartData(chartDataToUse)

    const values = reversedData.map(item => item[dataKey])
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)

    const commonProps = {
      data: reversedData,
      margin: { top: 10, right: 30, left: 0, bottom: 2 },
    }

    const commonAxisProps = {
      stroke: "hsl(var(--muted-foreground))",
      fontSize: 12,
      tickLine: false,
      axisLine: false,
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const formattedDate = label ? format(new Date(label), 'dd MMM yyyy') : 'Baseline';
        return (
          <div className="custom-tooltip" style={{ 
            backgroundColor: "hsl(var(--background))", 
            border: `1px solid hsl(var(--border))`, 
            borderRadius: "var(--radius)",
            padding: "10px"
          }}>
            <p className="label" style={{ color: "hsl(var(--foreground))" }}>{`Date: ${formattedDate}`}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }}>
                {`${entry.name}: $${entry.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    const chartConfig = {
      [dataKey]: {
        label: viewType === 'accumulative' ? "Accumulative Return: " : "Ordinary Return: ",
        color: "hsl(var(--chart-1))",
      },
    };

    const gradientOffset = () => {
      if (maxValue <= 0) {
        return 0
      }
      if (minValue >= 0) {
        return 1
      }
      return maxValue / (maxValue - minValue);
    }

    const offset = gradientOffset();

    const renderAreas = () => {
      if (multipleDatasets) {
        return (chartData as { name: string; data: DataPoint[] }[]).map((dataset, index) => (
          <Area
            key={dataset.name}
            type="monotone"
            dataKey={dataKey as keyof DataPoint}
            data={reverseChartData(dataset.data)}
            name={dataset.name === 'Filtered Trades' ? 'Simulated' : dataset.name}
            fill={index === 0 ? `url(#splitColor${index})` : FILTERED_COLOR}
            fillOpacity={0.6}
            stroke={index === 0 ? `url(#strokeColor${index})` : FILTERED_COLOR}
            strokeWidth={2}
          />
        ));
      } else {
        return (
          <Area
            type="monotone"
            dataKey={dataKey as keyof DataPoint}
            fill="url(#splitColor0)"
            fillOpacity={0.6}
            stroke="url(#strokeColor0)"
            strokeWidth={2}
          />
        );
      }
    };

    const renderBars = () => {
      if (multipleDatasets) {
        return (chartData as { name: string; data: DataPoint[] }[]).map((dataset, index) => (
          <Bar 
            key={dataset.name} 
            dataKey={dataKey as keyof DataPoint} 
            name={dataset.name === 'Filtered Trades' ? 'Simulated' : dataset.name}
            fill={index === 0 ? POSITIVE_COLOR : FILTERED_COLOR}
          >
            {dataset.data.map((entry, entryIndex) => (
              <Cell 
                key={`cell-${entryIndex}`} 
                fill={(entry[dataKey] as number) >= 0 ? (index === 0 ? POSITIVE_COLOR : FILTERED_COLOR) : NEGATIVE_COLOR} 
              />
            ))}
          </Bar>
        ));
      } else {
        return (
          <Bar dataKey={dataKey as keyof DataPoint}>
            {reversedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={(entry[dataKey] as number) >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR} 
              />
            ))}
          </Bar>
        );
      }
    };

    const renderLines = () => {
      if (multipleDatasets) {
        return (chartData as { name: string; data: DataPoint[] }[]).map((dataset, index) => (
          <Area
            key={dataset.name}
            type="monotone"
            dataKey={dataKey as keyof DataPoint}
            data={reverseChartData(dataset.data)}
            name={dataset.name === 'Filtered Trades' ? 'Simulated' : dataset.name}
            fill={index === 0 ? `url(#splitColor${index})` : FILTERED_COLOR}
            fillOpacity={0.6}
            stroke={index === 0 ? `url(#strokeColor${index})` : FILTERED_COLOR}
            strokeWidth={2}
          />
        ));
      } else {
        return (
          <Area
            type="monotone"
            dataKey={dataKey as keyof DataPoint}
            fill="url(#splitColor0)"
            fillOpacity={0.6}
            stroke="url(#strokeColor0)"
            strokeWidth={2}
          />
        );
      }
    };

    switch (chartType) {
      case 'area':
        return (
          <ChartContainer config={chartConfig} className="border rounded-lg p-2 w-full h-full">
            <ResponsiveContainer width="99%" height="99%">
              <AreaChart {...commonProps}>
                <defs>
                  {(multipleDatasets ? chartData : [chartData]).map((_, index) => (
                    <Fragment key={index}>
                      <linearGradient id={`splitColor${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={index === 0 ? POSITIVE_COLOR : FILTERED_COLOR} stopOpacity={1} />
                        <stop offset={`${offset * 100}%`} stopColor={index === 0 ? POSITIVE_COLOR : FILTERED_COLOR} stopOpacity={0} />
                        <stop offset={`${offset * 100}%`} stopColor={NEGATIVE_COLOR} stopOpacity={0} />
                        <stop offset="100%" stopColor={NEGATIVE_COLOR} stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id={`strokeColor${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={index === 0 ? POSITIVE_COLOR : FILTERED_COLOR} stopOpacity={1} />
                        <stop offset={`${offset * 100}%`} stopColor={index === 0 ? POSITIVE_COLOR : FILTERED_COLOR} stopOpacity={1} />
                        <stop offset={`${offset * 100}%`} stopColor={NEGATIVE_COLOR} stopOpacity={1} />
                        <stop offset="100%" stopColor={NEGATIVE_COLOR} stopOpacity={1} />
                      </linearGradient>
                    </Fragment>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  {...commonAxisProps} 
                  reversed={true}
                  tickFormatter={formatXAxisTick}
                  interval={timeGrouping === 'month' ? 0 : 'preserveStartEnd'}
                />
                <YAxis {...commonAxisProps} tickFormatter={(value) => `$${formatNumber(value)}`} domain={[Math.min(minValue, 0), Math.max(maxValue, 0)]} />
                <ChartTooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                {renderAreas()}
                {multipleDatasets && <Legend />}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )
      case 'bar':
        return (
          <ChartContainer config={chartConfig} className="border rounded-lg p-2 w-full h-full">
            <ResponsiveContainer width="99%" height="99%">
              <BarChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  {...commonAxisProps} 
                  reversed={true}
                  tickFormatter={formatXAxisTick}
                  interval={timeGrouping === 'month' ? 0 : 'preserveStartEnd'}
                />
                <YAxis {...commonAxisProps} tickFormatter={(value) => `$${formatNumber(value)}`} domain={[Math.min(minValue, 0), Math.max(maxValue, 0)]} />
                <ChartTooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                {renderBars()}
                {multipleDatasets && <Legend />}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )
      case 'line':
        return (
          <ChartContainer config={chartConfig} className="border rounded-lg p-2 w-full h-full">
            <ResponsiveContainer width="99%" height="99%">
              <AreaChart {...commonProps}>
                <defs>
                  {(multipleDatasets ? chartData : [chartData]).map((_, index) => (
                    <Fragment key={index}>
                      <linearGradient id={`splitColor${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={index === 0 ? POSITIVE_COLOR : FILTERED_COLOR} stopOpacity={0} />
                        <stop offset={`${offset * 100}%`} stopColor={index === 0 ? POSITIVE_COLOR : FILTERED_COLOR} stopOpacity={0} />
                        <stop offset={`${offset * 100}%`} stopColor={NEGATIVE_COLOR} stopOpacity={0} />
                        <stop offset="100%" stopColor={NEGATIVE_COLOR} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id={`strokeColor${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={index === 0 ? POSITIVE_COLOR : FILTERED_COLOR} stopOpacity={1} />
                        <stop offset={`${offset * 100}%`} stopColor={index === 0 ? POSITIVE_COLOR : FILTERED_COLOR} stopOpacity={1} />
                        <stop offset={`${offset * 100}%`} stopColor={NEGATIVE_COLOR} stopOpacity={1} />
                        <stop offset="100%" stopColor={NEGATIVE_COLOR} stopOpacity={1} />
                      </linearGradient>
                    </Fragment>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  {...commonAxisProps} 
                  reversed={true}
                  tickFormatter={formatXAxisTick}
                  interval={timeGrouping === 'month' ? 0 : 'preserveStartEnd'}
                />
                <YAxis {...commonAxisProps} tickFormatter={(value) => `$${formatNumber(value)}`} domain={[Math.min(minValue, 0), Math.max(maxValue, 0)]} />
                <ChartTooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                {renderLines()}
                {multipleDatasets && <Legend />}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )
      default:
        return <div>No chart type selected</div>
    }
  }

  return (
    <Card className="w-full h-fit flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>Profit Over Time</CardTitle>
        <div className="flex justify-between items-center space-x-4">
          <RadioGroup
            defaultValue="accumulative"
            onValueChange={(value) => handleViewTypeChange(value as 'accumulative' | 'ordinary')}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="accumulative" id="accumulative" />
              <Label htmlFor="accumulative">Accumulative Return</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ordinary" id="ordinary" />
              <Label htmlFor="ordinary">Ordinary Return</Label>
            </div>
          </RadioGroup>
          <Select value={chartType} onValueChange={(value) => setChartType(value as 'area' | 'bar' | 'line')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <Button
              variant={timeGrouping === 'day' ? 'default' : 'outline'}
              onClick={() => setTimeGrouping('day')}
            >
              Day
            </Button>
            <Button
              variant={timeGrouping === 'month' ? 'default' : 'outline'}
              onClick={() => setTimeGrouping('month')}
            >
              Month
            </Button>
            <Button
              variant={timeGrouping === 'year' ? 'default' : 'outline'}
              onClick={() => setTimeGrouping('year')}
            >
              Year
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className=" flex-grow overflow-hidden flex flex-col">
        
        <div className="grid grid-cols-6 gap-2 mb-4">
          {[
            { 
              label: "Return", 
              value: metrics.filtered.return, 
              format: (v: number) => `$${formatLargeNumber(v)}`,
              info: "The total profit or loss from all trades." 
            },
            { 
              label: "Win Rate", 
              value: metrics.filtered.winRate, 
              format: (v: number | undefined) => v !== undefined ? `${Math.round(v)}%` : 'N/A', 
              subValue: `Wins: ${metrics.filtered.winningTrades} Losses: ${metrics.filtered.losingTrades}`,
              info: "The percentage of trades that resulted in a profit." 
            },
            { 
              label: "Trades", 
              value: metrics.filtered.tradeCount, 
              format: (v: number) => Math.round(v).toString(),
              subValue: `Longs: ${metrics.filtered.longTrades} Shorts: ${metrics.filtered.shortTrades}`,
              info: "The total number of trades executed." 
            },
            { 
              label: "Sharpe Ratio", 
              value: metrics.filtered.sharpeRatio, 
              format: (v: number | undefined) => v !== undefined ? v.toFixed(2) : 'N/A', 
              color: (v: number | undefined) => v !== undefined ? (v > 1 ? 'text-[#03b198]' : v > 0.85 ? 'text-yellow-500' : 'text-[#ff004d]') : '',
              info: "A measure of risk-adjusted return. A higher Sharpe ratio indicates better risk-adjusted performance. Generally, a Sharpe ratio above 1 is considered good, above 2 is very good, and above 3 is excellent.",
              allTradesValue: metrics.all?.sharpeRatio
            },
            { 
              label: "Z-Score", 
              value: metrics.filtered.zScore, 
              format: (v: number | undefined) => v !== undefined ? v.toFixed(2) : 'N/A', 
              color: (v: number | undefined) => v !== undefined ? (Math.abs(v) > 2 ? 'text-[#03b198]' : Math.abs(v) > 1 ? 'text-yellow-500' : 'text-[#ff004d]') : '',
              info: "A measure of how many standard deviations the returns are from the mean. A Z-score above 2 or below -2 is generally considered significant.",
              allTradesValue: metrics.all?.zScore
            },
            {
              label: "Expectancy",
              value: metrics.filtered.expectancy,
              format: (v: number) => {
                const formatted = formatLargeNumber(v);
                return `$${formatted}`;
              },
              color: (v: number) => v > 0 ? 'text-[#03b198]' : v < 0 ? 'text-[#ff004d]' : 'text-white',
              info: "The average amount you can expect to win (or lose) per trade. A positive expectancy indicates a profitable system."
            },
          ].map(({ label, value, format, color, subValue, info, allTradesValue }) => (
            <Card key={label}>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  {label}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{info}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-xl font-bold ${color ? color(value) : ''}`}>
                  {typeof value === 'number' && !isNaN(value) ? format(value) : 'N/A'}
                </p>
                {subValue && <p className="text-sm text-muted-foreground">{subValue}</p>}
                {mode === 'simulation' && metrics.all && (
                  <p className="text-sm text-muted-foreground">
                    Actual: {
                      label === 'Sharpe Ratio' || label === 'Z-Score'
                        ? allTradesValue !== undefined ? format(allTradesValue) : 'N/A'
                        : label === 'Win Rate'
                          ? `${Math.round(metrics.all.winRate)}%`
                          : label === 'Trades'
                            ? `${metrics.all.tradeCount}`
                            : typeof metrics.all[label.toLowerCase() as keyof typeof metrics.all] === 'number'
                              ? format(metrics.all[label.toLowerCase() as keyof typeof metrics.all] as number)
                              : 'N/A'
                    }
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex-grow h-[57vh]">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  )
}

