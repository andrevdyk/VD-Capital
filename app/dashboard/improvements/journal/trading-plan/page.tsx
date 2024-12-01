'use client'

import { useState } from 'react'
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { TraderTypeCard } from "./components/TraderTypeCard"
import { Toaster } from "@/components/ui/toaster"
import { AddTradesButton } from "../components/add-trades-button"
import { JournalNavigation } from "../components/journal-navigation"
import { TradeSetupTemplate } from "./components/TradeSetupTemplate"
import { MarketTypesCard } from "./components/MarketTypesCard"

export default function TradingQuizPage() {
  const [traderType, setTraderType] = useState<string | null>(null)
  const [selectedMarkets, setSelectedMarkets] = useState<string[] | null>(null)

  const handleTraderTypeChange = (newTraderType: string | null) => {
    setTraderType(newTraderType)
  }

  const handleMarketChange = (newMarkets: string[] | null) => {
    setSelectedMarkets(newMarkets)
  }

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
        {traderType && <TradeSetupTemplate traderType={traderType} />}
        <Toaster />
      </main>
    </div>
  )
}

