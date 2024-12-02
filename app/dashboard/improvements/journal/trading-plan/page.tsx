'use client'

import { useState, Suspense, lazy, useEffect, useCallback } from 'react'
import { TraderTypeCard } from "./components/TraderTypeCard"
import { Toaster } from "@/components/ui/toaster"
import { AddTradesButton } from "../components/add-trades-button"
import { JournalNavigation } from "../components/journal-navigation"
import { TradeSetupTemplateSkeleton } from "./components/TradeSetupTemplateSkeleton"
const TradeSetupTemplate = lazy(() => import("./components/TradeSetupTemplate"))
import { MarketTypesCard } from "./components/MarketTypesCard"

export default function TradingQuizPage() {
  //const [traderType, setTraderType] = useState<string | null>(null)
  const [selectedMarkets, setSelectedMarkets] = useState<string[] | null>(null)

  const handleTraderTypeChange = useCallback((newTraderType: string | null) => {
    console.log('Trader type changed:', newTraderType);
    // You can add any other logic here if needed
  }, []);

  const handleMarketChange = useCallback((newMarkets: string[] | null) => {
    setSelectedMarkets(newMarkets)
  }, []);

  useEffect(() => {
    console.log('TradingQuizPage rendered');
  }, []);

  return (
    <div>
      <div className="h-14 lg:h-[55px] border-b w-full bg-white dark:bg-black flex items-center gap-4 z-1">
        <div className="px-4 -z-1">
          <JournalNavigation />
        </div>
        <div className="justify-end px-2 ml-auto">
          <AddTradesButton />
        </div>
      </div>

      <main className="my-auto flex flex-col md:flex-row p-4 gap-4">
        <div className="flex flex-col gap-4">
          <TraderTypeCard initialTraderType={null} onTraderTypeChange={handleTraderTypeChange} />
          <MarketTypesCard initialMarkets={null} onMarketChange={handleMarketChange} />
        </div>
        <Suspense fallback={<TradeSetupTemplateSkeleton />}>
          <TradeSetupTemplate />
        </Suspense>
        <Toaster />
      </main>
    </div>
  )
}

