"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ForexPair {
  pair: string
  current: number
  predictions: {
    [key: string]: number
  }
  change: number
}

interface ForexPairsTableProps {
  pairs: ForexPair[]
  onPairSelect: (pair: string) => void
}

export function ForexPairsTable({ pairs, onPairSelect }: ForexPairsTableProps) {
  const getMostRecentPrediction = (predictions: { [key: string]: number }) => {
    const dates = Object.keys(predictions).sort().reverse()
    return predictions[dates[0]] || 0
  }

  const calculatePercentage = (current: number, prediction: number) => {
    return (((prediction - current) / current) * 100).toFixed(2)
  }

  return (
    <div className="space-y-2">
      {pairs.map((pair) => {
        const currentPrediction = getMostRecentPrediction(pair.predictions)
        const percentageAway = Number.parseFloat(calculatePercentage(pair.current, currentPrediction))
        const isPositive = percentageAway > 0

        return (
          <div
            key={pair.pair}
            onClick={() => onPairSelect(pair.pair)}
            className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">{pair.pair}</span>
              <div className={cn("flex items-center gap-1 text-xs", isPositive ? "text-chart-1" : "text-chart-2")}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(percentageAway)}%
              </div>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Current:</span>
                <span className="font-mono">{pair.current.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Prediction:</span>
                <span className="font-mono">{currentPrediction.toFixed(4)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
