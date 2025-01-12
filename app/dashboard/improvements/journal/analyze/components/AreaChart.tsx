"use client"

import { useState, useEffect, useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'
import React, { Fragment } from 'react'

interface DataPoint {
  date: string
  profit: number
  totalProfit: number
  [key: string]: string | number
}

interface Trade {
  net_profit: number
  // Add other trade properties as needed
}

interface AreaChartProps {
  data: DataPoint[] | { name: string; data: DataPoint[] }[]
  mode: 'evaluation' | 'simulation'
  trades: Trade[]
}

const POSITIVE_COLOR = "#03b198";
const NEGATIVE_COLOR = "#ff004d";
const FILTERED_COLOR = "#6200FF";

export function AreaChartComponent({ data, mode, trades }: AreaChartProps) {
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
    const totalReturn = trades.reduce((sum, trade) => sum + trade.net_profit, 0);
    const winningTrades = trades.filter(trade => trade.net_profit > 0);
    const winRate = (winningTrades.length / trades.length) * 100;
    
    // Calculate Sharpe Ratio (assuming risk-free rate of 0 for simplicity)
    const averageReturn = totalReturn / trades.length;
    const stdDev = Math.sqrt(trades.reduce((sum, trade) => sum + Math.pow(trade.net_profit - averageReturn, 2), 0) / trades.length);
    const sharpeRatio = averageReturn / stdDev;
    
    // Calculate Z-Score (assuming normal distribution)
    const zScore = averageReturn / (stdDev / Math.sqrt(trades.length));
    
    // Calculate Expectancy
    const averageWin = winningTrades.reduce((sum, trade) => sum + trade.net_profit, 0) / winningTrades.length;
    const averageLoss = (totalReturn - winningTrades.reduce((sum, trade) => sum + trade.net_profit, 0)) / (trades.length - winningTrades.length);
    const expectancy = (winRate / 100 * averageWin) - ((1 - winRate / 100) * Math.abs(averageLoss));

    return {
      return: totalReturn,
      winRate,
      tradeCount: trades.length,
      sharpeRatio,
      zScore,
      expectancy
    };
  }, [trades]);

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
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Return</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">${metrics.return.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{metrics.winRate.toFixed(2)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{metrics.tradeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sharpe Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{metrics.sharpeRatio.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Z-Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{metrics.zScore.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expectancy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">${metrics.expectancy.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>
        <div className="flex-grow h-[57vh]">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  )
}

