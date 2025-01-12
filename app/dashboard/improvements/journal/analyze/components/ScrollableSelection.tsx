"use client"

import { useState, useMemo } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FilterOption {
  id: string
  label: string
}

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

interface ScrollableSelectionProps {
  title: string
  options: FilterOption[]
  onSelectionChange: (selectedIds: string[]) => void
  trades: Trade[]
  filterType: 'mistakes' | 'strategies' | 'setups' | 'months' | 'weekdays' | 'hours' | 'symbols' | 'directions'
}

export function ScrollableSelection({ title, options, onSelectionChange, trades, filterType }: ScrollableSelectionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const handleCheckboxChange = (id: string) => {
    setSelectedOptions((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    
      onSelectionChange(newSelection)
      return newSelection
    })
  }

  const calculateStats = (optionId: string) => {
    let filteredTrades = trades
    switch (filterType) {
      case 'mistakes':
        filteredTrades = trades.filter(trade => {
          if (!trade.notes) return false;
          try {
            const parsedNotes = JSON.parse(trade.notes) as {
              preTrade: { mistakes: string[] };
              duringTrade: { mistakes: string[] };
              postTrade: { mistakes: string[] };
              improvement: { mistakes: string[] };
            };
            return Object.values(parsedNotes).some(section => 
              section.mistakes.includes(optionId)
            );
          } catch (error) {
            console.error('Error parsing notes for trade:', trade.id, error);
            return false;
          }
        })
        break
      case 'strategies':
        filteredTrades = trades.filter(trade => trade.strategy_id === optionId)
        break
      case 'setups':
        filteredTrades = trades.filter(trade => trade.setup_id === optionId)
        break
      case 'months':
        filteredTrades = trades.filter(trade => new Date(trade.closing_time).getMonth().toString() === optionId)
        break
      case 'weekdays':
        filteredTrades = trades.filter(trade => new Date(trade.closing_time).getDay().toString() === optionId)
        break
      case 'hours':
        filteredTrades = trades.filter(trade => new Date(trade.closing_time).getHours().toString() === optionId)
        break
      case 'symbols':
        filteredTrades = trades.filter(trade => trade.symbol === optionId)
        break
      case 'directions':
        filteredTrades = trades.filter(trade => trade.side === optionId)
        break
    }

    const totalProfit = filteredTrades.reduce((sum, trade) => sum + trade.net_profit, 0)
    const totalTrades = filteredTrades.length
    const profitPercentage = totalTrades > 0 ? (totalProfit / Math.abs(filteredTrades.reduce((sum, trade) => sum + trade.entry_price * trade.qty, 0))) * 100 : 0

    return {
      totalProfit: totalProfit.toFixed(2),
      profitPercentage: profitPercentage.toFixed(2)
    }
  }

  const memoizedStats = useMemo(() => {
    return options.reduce((acc, option) => {
      acc[option.id] = calculateStats(option.id)
      return acc
    }, {} as Record<string, { totalProfit: string, profitPercentage: string }>)
  }, [options, trades, filterType])

  return (
    <div className="space-y-2 flex flex-col">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ScrollArea className="h-fit max-h-[200px] w-[390px] overflow-y-scroll rounded-md border p-4 " style={{scrollbarWidth: 'thin',scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent'}}>
        {options.map((option) => {
          const stats = memoizedStats[option.id]
          const totalProfit = parseFloat(stats.totalProfit)
          const textColor = totalProfit > 0 ? 'text-[#04D4B5]' : 
                            totalProfit < 0 ? 'text-[#ff004d]' : 
                            'text-muted-foreground'

          return (
            <div key={option.id} className="flex items-center space-x-2 mb-2">
              <Checkbox
                id={option.id}
                checked={selectedOptions.includes(option.id)}
                onCheckedChange={() => handleCheckboxChange(option.id)}
              />
              <Label htmlFor={option.id} className="flex-grow text-sm">{option.label}</Label>
              <div className={`text-xs ${textColor} flex flex-col items-end`}>
                <span>${stats.totalProfit}</span>
                <span>({stats.profitPercentage}%)</span>
              </div>
            </div>
          )
        })}
      </ScrollArea>
    </div>
  )
}

