"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface BacktestResultsProps {
  trades: any[]
  selectedStrategy: string | null
  selectedSetup: string | null
}

export function BacktestResults({ trades, selectedStrategy, selectedSetup }: BacktestResultsProps) {
  const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0)
  const winningTrades = trades.filter(trade => trade.profit > 0)
  const losingTrades = trades.filter(trade => trade.profit < 0)
  const winRate = (winningTrades.length / trades.length) * 100 || 0

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Backtest Results</h3>
      <div className="mb-4">
        <p className="font-medium">Selected Strategy: {selectedStrategy || 'None'}</p>
        <p className="font-medium">Selected Setup: {selectedSetup || 'None'}</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="font-medium">Total Profit</p>
          <p className={totalProfit >= 0 ? "text-green-500" : "text-red-500"}>
            ${totalProfit.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="font-medium">Win Rate</p>
          <p>{winRate.toFixed(2)}%</p>
        </div>
        <div>
          <p className="font-medium">Total Trades</p>
          <p>{trades.length}</p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Entry Date</TableHead>
            <TableHead>Exit Date</TableHead>
            <TableHead>Profit/Loss</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade, index) => (
            <TableRow key={index}>
              <TableCell>{trade.type}</TableCell>
              <TableCell>{trade.entryDate.toLocaleString()}</TableCell>
              <TableCell>{trade.exitDate ? trade.exitDate.toLocaleString() : 'Open'}</TableCell>
              <TableCell className={trade.profit >= 0 ? "text-green-500" : "text-red-500"}>
                ${trade.profit ? trade.profit.toFixed(2) : '0.00'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

