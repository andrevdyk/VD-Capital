"use client"

import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { format, parse } from 'date-fns'

interface DataPoint {
  date: string
  profit: number
  totalProfit: number
}

interface AreaChartProps {
  data: DataPoint[]
}

const POSITIVE_COLOR = "#03b198";
const NEGATIVE_COLOR = "#ff004d";
const TRANSPARENT_COLOR = "rgba(255, 255, 255, 0)";

export function AreaChartComponent({ data }: AreaChartProps) {
  const [chartData, setChartData] = useState<DataPoint[]>([])
  const [viewType, setViewType] = useState<'accumulative' | 'ordinary'>('accumulative')
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area')
  const [timeGrouping, setTimeGrouping] = useState<'day' | 'month' | 'year'>('day')

  useEffect(() => {
    const baselinePoint: DataPoint = {
      date: '',
      profit: 0,
      totalProfit: 0
    }
    setChartData([baselinePoint, ...groupDataByTime(data, timeGrouping)])
  }, [data, timeGrouping])

  const handleViewTypeChange = (value: 'accumulative' | 'ordinary') => {
    setViewType(value)
  }

  const reverseChartData = (data: DataPoint[]) => [...data].reverse();

  const groupDataByTime = (data: DataPoint[], grouping: 'day' | 'month' | 'year'): DataPoint[] => {
    const groupedData: { [key: string]: DataPoint } = {};
    
    data.forEach(point => {
      const date = new Date(point.date);
      let key: string;
      
      switch (grouping) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = `${date.getFullYear()}`;
          break;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = { ...point, date: key };
      } else {
        groupedData[key].profit += point.profit;
        groupedData[key].totalProfit += point.totalProfit;
      }
    });
    
    return Object.values(groupedData);
  };

  const formatXAxisTick = (dateString: string) => {
    if (!dateString) return 'Baseline';
    if (timeGrouping === 'month') {
      const date = parse(dateString, 'yyyy-MM', new Date());
      return format(date, 'MMM');
    }
    return dateString;
  };

  const renderChart = () => {
    const dataKey = viewType === 'accumulative' ? 'totalProfit' : 'profit'
    const reversedData = reverseChartData(chartData)

    const values = reversedData.map(item => item[dataKey])
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)

    const commonProps = {
      data: reversedData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    }

    const commonAxisProps = {
      stroke: "hsl(var(--muted-foreground))",
      fontSize: 12,
      tickLine: false,
      axisLine: false,
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const value = payload[0].value;
        const color = value >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;
        return (
          <div className="custom-tooltip" style={{ 
            backgroundColor: "hsl(var(--background))", 
            border: `1px solid ${color}`, 
            borderRadius: "var(--radius)",
            padding: "10px"
          }}>
            <p className="label" style={{ color: "hsl(var(--foreground))" }}>{`Date: ${label || 'Baseline'}`}</p>
            <p className="value" style={{ color: color }}>
              {`${dataKey}: $${value.toFixed(2)}`}
            </p>
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

    switch (chartType) {
      case 'area':
        return (
          <ChartContainer config={chartConfig}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={POSITIVE_COLOR} stopOpacity={1} />
                  <stop offset={`${offset * 100}%`} stopColor={POSITIVE_COLOR} stopOpacity={0} />
                  <stop offset={`${offset * 100}%`} stopColor={NEGATIVE_COLOR} stopOpacity={0} />
                  <stop offset="100%" stopColor={NEGATIVE_COLOR} stopOpacity={1} />
                </linearGradient>
                <linearGradient id="strokeColor" x1="0" y1="0" x2="0" y2="1">
                
                <stop
                  offset= "0%" // This sets where the gradient changes
                  stopColor="#03b198"
                  stopOpacity={1}
                />

                <stop
                  offset="0%" // Same base point for the transition
                  stopColor="#03b198"
                  stopOpacity={1}
                />
                <stop
                  offset={`${offset * 100}%`} 
                  stopColor="#03b198"
                  stopOpacity={1}
                />
                <stop
                  offset={`${offset * 100}%`}
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
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                {...commonAxisProps} 
                reversed={true}
                tickFormatter={formatXAxisTick}
                interval={timeGrouping === 'month' ? 0 : 'preserveStartEnd'}
              />
              <YAxis {...commonAxisProps} tickFormatter={(value) => `$${value}`} domain={[Math.min(minValue, 0), Math.max(maxValue, 0)]} />
              <ChartTooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey={dataKey}
                fill="url(#splitColor)"
                fillOpacity={0.6}
                stroke="url(#strokeColor)"
                strokeWidth={2}
              />
              {reversedData.map((entry, index) => {
                if (index === 0) return null; // Skip the first point (baseline)
                const prevEntry = reversedData[index - 1];
                return (
                  <Line
                    key={index}
                    strokeWidth={2}
                    stroke={entry[dataKey] >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}
                    type="linear"
                    dataKey={dataKey}
                    points={[
                      { x: index - 1, y: prevEntry[dataKey] },
                      { x: index, y: entry[dataKey] },
                    ]}
                  />
                );
              })}
            </AreaChart>
          </ChartContainer>
        )
      case 'bar':
        return (
          <ChartContainer config={chartConfig}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                {...commonAxisProps} 
                reversed={true}
                tickFormatter={formatXAxisTick}
                interval={timeGrouping === 'month' ? 0 : 'preserveStartEnd'}
              />
              <YAxis {...commonAxisProps} tickFormatter={(value) => `$${value}`} domain={[Math.min(minValue, 0), Math.max(maxValue, 0)]} />
              <ChartTooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <Bar dataKey={dataKey}>
                {reversedData.map((entry, index) => {
                  const value = entry[dataKey];
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={value >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ChartContainer>
        )
      case 'line':
        return (
          <ChartContainer config={chartConfig}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={POSITIVE_COLOR} stopOpacity={1} />
                  <stop offset={`${offset * 100}%`} stopColor={POSITIVE_COLOR} stopOpacity={0} />
                  <stop offset={`${offset * 100}%`} stopColor={NEGATIVE_COLOR} stopOpacity={0} />
                  <stop offset="100%" stopColor={NEGATIVE_COLOR} stopOpacity={1} />
                </linearGradient>
                <linearGradient id="strokeColor" x1="0" y1="0" x2="0" y2="1">
                
                <stop
                  offset= "0%" // This sets where the gradient changes
                  stopColor="#03b198"
                  stopOpacity={1}
                />

                <stop
                  offset="0%" // Same base point for the transition
                  stopColor="#03b198"
                  stopOpacity={1}
                />
                <stop
                  offset={`${offset * 100}%`} 
                  stopColor="#03b198"
                  stopOpacity={1}
                />
                <stop
                  offset={`${offset * 100}%`}
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
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                {...commonAxisProps} 
                reversed={true}
                tickFormatter={formatXAxisTick}
                interval={timeGrouping === 'month' ? 0 : 'preserveStartEnd'}
              />
              <YAxis {...commonAxisProps} tickFormatter={(value) => `$${value}`} domain={[Math.min(minValue, 0), Math.max(maxValue, 0)]} />
              <ChartTooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey={dataKey}
                fill="url(#splitColor)"
                fillOpacity={0}
                stroke="url(#strokeColor)"
                strokeWidth={2}
              />
              {reversedData.map((entry, index) => {
                if (index === 0) return null; // Skip the first point (baseline)
                const prevEntry = reversedData[index - 1];
                return (
                  <Line
                    key={index}
                    strokeWidth={2}
                    stroke={entry[dataKey] >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}
                    type="linear"
                    dataKey={dataKey}
                    points={[
                      { x: index - 1, y: prevEntry[dataKey] },
                      { x: index, y: entry[dataKey] },
                    ]}
                  />
                );
              })}
            </AreaChart>
          </ChartContainer>
        )
      default:
        return <div>No chart type selected</div>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Over Time</CardTitle>
        <div className="flex justify-between items-center">
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex space-x-2 mt-4">
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
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[400px]">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  )
}

