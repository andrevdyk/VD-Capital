"use client"

import { useState, useEffect } from 'react'
import { AreaChartComponent } from "./AreaChart"
import { ScrollableSelection } from "./ScrollableSelection"
import { Button } from "@/components/ui/button"

interface Trade {
  id: string
  symbol: string
  side: string
  qty: number
  placing_time: string
  closing_time: string
  entry_price: number
  exit_price: number
  net_profit: number
  notes?: string
  strategy_id?: string
  setup_id?: string
}

interface Strategy {
  strategy_id: string
  strategy_name: string
}

interface Setup {
  id: string
  setup_name: string
  strategy_id: string
}

interface AnalyzePageClientProps {
  initialTrades: Trade[]
  strategies: Strategy[]
  setups: Setup[]
}

interface NotesContent {
  preTrade: { text: string; mistakes: string[] };
  duringTrade: { text: string; mistakes: string[] };
  postTrade: { text: string; mistakes: string[] };
  improvement: { text: string; mistakes: string[] };
}

type Mode = 'evaluation' | 'simulation';

export function AnalyzePageClient({ initialTrades, strategies, setups }: AnalyzePageClientProps) {
  const [filteredTrades, setFilteredTrades] = useState(initialTrades)
  const [filters, setFilters] = useState({
    mistakes: [] as string[],
    strategies: [] as string[],
    setups: [] as string[],
    months: [] as string[],
    weekdays: [] as string[],
    hours: [] as string[],
    symbols: [] as string[],
    directions: [] as string[],
  })
  const [mode, setMode] = useState<Mode>('evaluation')

  // Extract unique mistakes from all trades
  const allMistakes = Array.from(new Set(initialTrades.flatMap(trade => {
    if (!trade.notes) return [];
    try {
      const parsedNotes = JSON.parse(trade.notes) as NotesContent;
      const mistakes = Object.values(parsedNotes).flatMap(section => section.mistakes);
      return mistakes;
    } catch (error) {
      console.error('Error parsing notes for trade:', trade.id, error);
      return [];
    }
  })));

  useEffect(() => {
    const newFilteredTrades = initialTrades.filter(trade => {
      const tradeDate = new Date(trade.closing_time)
      const tradeMistakes = trade.notes ? (() => {
        try {
          const parsedNotes = JSON.parse(trade.notes) as NotesContent;
          return Object.values(parsedNotes).flatMap(section => section.mistakes);
        } catch (error) {
          console.error('Error parsing notes for trade:', trade.id, error);
          return [];
        }
      })() : [];
      
      return (
        (filters.mistakes.length === 0 || filters.mistakes.some(mistake => tradeMistakes.includes(mistake))) &&
        (filters.strategies.length === 0 || filters.strategies.includes(trade.strategy_id || '')) &&
        (filters.setups.length === 0 || filters.setups.includes(trade.setup_id || '')) &&
        (filters.months.length === 0 || filters.months.includes(tradeDate.getMonth().toString())) &&
        (filters.weekdays.length === 0 || filters.weekdays.includes(tradeDate.getDay().toString())) &&
        (filters.hours.length === 0 || filters.hours.includes(tradeDate.getHours().toString())) &&
        (filters.symbols.length === 0 || filters.symbols.includes(trade.symbol)) &&
        (filters.directions.length === 0 || filters.directions.includes(trade.side))
      )
    })

    setFilteredTrades(newFilteredTrades)
  }, [filters, initialTrades])

  const generateChartData = (trades: Trade[]) => {
    return trades
      .sort((a, b) => new Date(a.closing_time).getTime() - new Date(b.closing_time).getTime())
      .reduce((acc, trade) => {
        const date = new Date(trade.closing_time).toLocaleDateString();
        const lastTotal = acc.length > 0 ? acc[acc.length - 1].totalProfit : 0;
        const newTotal = lastTotal + trade.net_profit;
        
        if (acc.length > 0 && acc[acc.length - 1].date === date) {
          // Update the existing entry for this date
          acc[acc.length - 1].profit += trade.net_profit;
          acc[acc.length - 1].totalProfit = newTotal;
        } else {
          // Add a new entry for this date
          acc.push({
            date,
            profit: trade.net_profit,
            totalProfit: newTotal
          });
        }
        
        return acc;
      }, [] as { date: string; profit: number; totalProfit: number }[]);
  }

  const chartData = (() => {
    const allTradesData = generateChartData(initialTrades);
    const filteredTradesData = generateChartData(filteredTrades);

    switch (mode) {
      case 'simulation':
        return [
          { name: 'All Trades', data: allTradesData },
          { name: 'Filtered Trades', data: filteredTradesData }
        ];
      case 'evaluation':
        return filteredTradesData;
      default:
        return allTradesData;
    }
  })();

  const symbols = Array.from(new Set(initialTrades.map(trade => trade.symbol)))
  const directions = ['Buy', 'Sell']
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

  const handleFilterChange = (filterType: keyof typeof filters) => (selected: string[]) => {
    setFilters(prev => ({ ...prev, [filterType]: selected }))
  }

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold p-4">Analyze Your Trades</h2>
        <div className="">
          <Button
            variant={mode === 'evaluation' ? 'default' : 'outline'}
            onClick={() => setMode('evaluation')}
          >
            Evaluation
          </Button>
          <Button
            variant={mode === 'simulation' ? 'default' : 'outline'}
            onClick={() => setMode('simulation')}
          >
            Simulation
          </Button>
        </div>
      </div>
      <div className="flex gap-6 h-[82vh]">
        <div className="flex-grow w-[72vw]">
          <AreaChartComponent data={chartData} mode={mode} trades={filteredTrades} />
        </div>
        <div className="w-[410px] space-y-4 overflow-auto h-full" style={{scrollbarWidth: 'thin',scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent'}}>
          <ScrollableSelection
            title="Mistakes"
            options={allMistakes.map(mistake => ({ id: mistake, label: mistake }))}
            onSelectionChange={handleFilterChange('mistakes')}
            trades={initialTrades}
            filterType="mistakes"
          />
          <ScrollableSelection
            title="Strategies"
            options={strategies.map(strategy => ({ id: strategy.strategy_id, label: strategy.strategy_name }))}
            onSelectionChange={handleFilterChange('strategies')}
            trades={initialTrades}
            filterType="strategies"
          />
          <ScrollableSelection
            title="Setups"
            options={setups.map(setup => ({ id: setup.id, label: setup.setup_name }))}
            onSelectionChange={handleFilterChange('setups')}
            trades={initialTrades}
            filterType="setups"
          />
          <ScrollableSelection
            title="Months"
            options={months.map((month, index) => ({ id: index.toString(), label: month }))}
            onSelectionChange={handleFilterChange('months')}
            trades={initialTrades}
            filterType="months"
          />
          <ScrollableSelection
            title="Weekdays"
            options={weekdays.map((day, index) => ({ id: index.toString(), label: day }))}
            onSelectionChange={handleFilterChange('weekdays')}
            trades={initialTrades}
            filterType="weekdays"
          />
          <ScrollableSelection
            title="Hours"
            options={hours.map((hour, index) => ({ id: index.toString(), label: hour }))}
            onSelectionChange={handleFilterChange('hours')}
            trades={initialTrades}
            filterType="hours"
          />
          <ScrollableSelection
            title="Symbols"
            options={symbols.map(symbol => ({ id: symbol, label: symbol }))}
            onSelectionChange={handleFilterChange('symbols')}
            trades={initialTrades}
            filterType="symbols"
          />
          <ScrollableSelection
            title="Direction"
            options={directions.map(direction => ({ id: direction, label: direction }))}
            onSelectionChange={handleFilterChange('directions')}
            trades={initialTrades}
            filterType="directions"
          />
        </div>
      </div>
    </div>
  )
}

