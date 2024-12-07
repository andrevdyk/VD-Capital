'use client'

import { useState, Suspense, lazy, useEffect, useCallback } from 'react'
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { TraderTypeCard } from "./components/TraderTypeCard"
import { Toaster } from "@/components/ui/toaster"
import { AddTradesButton } from "../components/add-trades-button"
import { JournalNavigation } from "../components/journal-navigation"
import { TradeSetupTemplateSkeleton } from "./components/TradeSetupTemplateSkeleton"
const TradeSetupTemplate = lazy(() => import("./components/TradeSetupTemplate"))
import { MarketTypesCard } from "./components/MarketTypesCard"
import { UserSetupsList } from "./components/UserSetupsList"
import { getUserSetups, getSetupById } from './actions/save-setup'

interface UserSetup {
  id: string
  setup_name: string
  setup_description?: string
  tags: string[]
  created_at: string
}

export default function TradingQuizPage() {
  const [selectedMarkets, setSelectedMarkets] = useState<string[] | null>(null)
  const [userSetups, setUserSetups] = useState<UserSetup[]>([])
  const [setupToEdit, setSetupToEdit] = useState<UserSetup | null>(null)

  const handleTraderTypeChange = useCallback((newTraderType: string | null) => {
    console.log('Trader type changed:', newTraderType);
    // You can add any other logic here if needed
  }, []);

  const handleMarketChange = useCallback((newMarkets: string[] | null) => {
    setSelectedMarkets(newMarkets)
  }, []);

  const updateUserSetups = useCallback(async () => {
    const updatedSetups = await getUserSetups()
    if (updatedSetups) {
      setUserSetups(updatedSetups as UserSetup[])
    }
  }, [])

  const handleEditSetup = useCallback(async (setupId: string) => {
    const setup = await getSetupById(setupId)
    if (setup) {
      setSetupToEdit(setup as UserSetup)
    }
  }, [])

  useEffect(() => {
    console.log('TradingQuizPage rendered');
    updateUserSetups();
  }, [updateUserSetups]);

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

      <main className="my-auto flex flex-col p-4 gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-4">
            <TraderTypeCard initialTraderType={null} onTraderTypeChange={handleTraderTypeChange} />
            <MarketTypesCard initialMarkets={null} onMarketChange={handleMarketChange} />
          </div>
          <Suspense fallback={<TradeSetupTemplateSkeleton />}>
            <TradeSetupTemplate onSetupSaved={updateUserSetups} setupToEdit={setupToEdit} />
          </Suspense>
        </div>
        <UserSetupsList setups={userSetups} onUpdate={updateUserSetups} onEdit={handleEditSetup} />
        <Toaster />
      </main>
    </div>
  )
}

