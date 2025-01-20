"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CandlestickChartIcon as ChartCandlestick, AreaChartIcon as ChartArea, LineChartIcon as ChartLine, ClockIcon } from 'lucide-react'
import { CandlestickChart } from './CandlestickChart'
import { CustomLineChart } from './LineChart'
import { AreaChart } from './AreaChart'
import { TradeControls } from './TradeControls'
import { TimeControls } from './TimeControls'
import { StrategySelector } from './StrategySelector'
import { BacktestResults } from './BacktestResults'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Interval = '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo'

export function BacktestingComponent() {
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick')
  const [interval, setInterval] = useState<Interval>('1d')
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [speed, setSpeed] = useState<number>(1)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [selectedSetup, setSelectedSetup] = useState<string | null>(null)
  const [trades, setTrades] = useState<any[]>([])
  const [priceData, setPriceData] = useState<any[]>([])
  const [symbol, setSymbol] = useState<string>('AAPL')
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/dashboard/improvements/journal/backtest/api?symbol=${symbol}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&interval=${interval}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No data returned from the API')
        }

        const formattedData = data.map((item: any) => ({
          date: new Date(item.date),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }))

        setPriceData(formattedData)
      } catch (error: any) {
        console.error('Error fetching data:', error)
        setError(error.message || 'Failed to fetch data. Please check the symbol and try again.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [symbol, startDate, endDate, interval])

  const handlePlaceTrade = (tradeDetails: any) => {
    setTrades([...trades, { ...tradeDetails, entryDate: currentDate }])
  }

  const handleFastForward = () => {
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed)
  }

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate)
  }

  const handleStrategyChange = (strategyId: string) => {
    setSelectedStrategy(strategyId)
    setSelectedSetup(null)
  }

  const handleSetupChange = (setupId: string) => {
    setSelectedSetup(setupId)
  }

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol.toUpperCase())
  }

  const handleIntervalChange = (newInterval: Interval) => {
    setInterval(newInterval)
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Label htmlFor="symbol">Symbol</Label>
        <Input
          id="symbol"
          value={symbol}
          onChange={(e) => handleSymbolChange(e.target.value)}
          className="mt-1"
        />
      </div>
      {isLoading && <div className="text-blue-500">Loading data...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <Card className="w-full p-2">
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <div className="flex space-x-2">
              <Button
                variant={chartType === 'candlestick' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setChartType('candlestick')}
              >
                <ChartCandlestick className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setChartType('line')}
              >
                <ChartLine className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setChartType('area')}
              >
                <ChartArea className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <ClockIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {(['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'] as Interval[]).map((i) => (
                    <DropdownMenuItem key={i} onSelect={() => handleIntervalChange(i)}>
                      {i}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="h-[calc(100vh-200px)]">
            {!isLoading && priceData.length > 0 && (
              <>
                {chartType === 'candlestick' && <CandlestickChart data={priceData} />}
                {chartType === 'line' && <CustomLineChart data={priceData} symbol={symbol} />}
                {chartType === 'area' && <AreaChart data={priceData} />}
              </>
            )}
            {!isLoading && priceData.length === 0 && !error && (
              <div className="flex items-center justify-center h-full">
                <p>No data available for the selected symbol and date range.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full p-6">
        <CardContent>
          <div className="space-y-6">
            <StrategySelector 
              onStrategyChange={handleStrategyChange}
              onSetupChange={handleSetupChange}
            />
            <TradeControls onPlaceTrade={handlePlaceTrade} />
            <TimeControls 
              currentDate={currentDate}
              onDateChange={handleDateChange}
              speed={speed}
              onSpeedChange={handleSpeedChange}
              isRunning={isRunning}
              onFastForward={handleFastForward}
              onPause={handlePause}
            />
            <BacktestResults 
              trades={trades} 
              selectedStrategy={selectedStrategy}
              selectedSetup={selectedSetup}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

