'use client'

import { useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CardSkeleton } from "../trading-plan/components/CardSkeleton"
import { TraderTypeCard } from "../trading-plan/components/TraderTypeCard"
import { MarketTypesCard } from "../trading-plan/components/MarketTypesCard"

export function JournalContent() {
  const [selectedMarkets, setSelectedMarkets] = useState<string[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTraderTypeChange = useCallback((newTraderType: string | null) => {
    console.log('Trader type changed:', newTraderType)
    // You can add any other logic here if needed
  }, [])

  const handleMarketChange = useCallback((newMarkets: string[] | null) => {
    setSelectedMarkets(newMarkets)
  }, [])

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>
            Trade Journal
          </CardTitle>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
      <main className="space-y-6">
        <div className="flex flex-nowrap gap-2 overflow-x-auto">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <TraderTypeCard initialTraderType={null} onTraderTypeChange={handleTraderTypeChange} />
              <MarketTypesCard initialMarkets={null} onMarketChange={handleMarketChange} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

