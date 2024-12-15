'use client'

import { useState, Suspense, lazy, useEffect, useCallback } from 'react'
import { TraderTypeCard } from "./components/TraderTypeCard"
import { Toaster } from "@/components/ui/toaster"
import { AddTradesButton } from "../components/add-trades-button"
import { JournalNavigation } from "../components/journal-navigation"
import { TradeSetupTemplateSkeleton } from "./components/TradeSetupTemplateSkeleton"
const TradeSetupTemplate = lazy(() => import("./components/TradeSetupTemplate"))
import { MarketTypesCard } from "./components/MarketTypesCard"
import { RiskRewardCard } from "./components/RiskRewardCard"
import { RiskPercentageCard } from "./components/RiskPercentageCard"
import { UserSetupsListSkeleton } from "./components/UserSetupsListSkeleton"
const UserSetupsList = lazy(() => import("./components/UserSetupsList"))
import { getUserSetups, getSetupById } from './actions/save-setup'
import { UserSetup, RiskRewardStrategy } from '@/app/types/user'
import { CardSkeleton } from "./components/CardSkeleton"
import { StrategyArea } from "./components/StrategyArea"

interface Strategy {
  id: string
  name: string
  description: string
  created_at: string
}

export default function TradingQuizPage() {
  const [selectedMarkets, setSelectedMarkets] = useState<string[] | null>(null)
  const [userSetups, setUserSetups] = useState<UserSetup[]>([])
  const [setupToEdit, setSetupToEdit] = useState<UserSetup | null>(null)
  const [riskRewardStrategy, setRiskRewardStrategy] = useState<RiskRewardStrategy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)

  const handleTraderTypeChange = useCallback((newTraderType: string | null) => {
    console.log('Trader type changed:', newTraderType)
    // You can add any other logic here if needed
  }, [])

  const handleMarketChange = useCallback((newMarkets: string[] | null) => {
    setSelectedMarkets(newMarkets)
  }, [])

  const handleRiskRewardChange = useCallback((newStrategy: RiskRewardStrategy | null) => {
    setRiskRewardStrategy(newStrategy)
  }, [])

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

  const handleStrategySelect = useCallback((strategy: Strategy) => {
    setSelectedStrategy(strategy)
  }, [])

  useEffect(() => {
    console.log('TradingQuizPage rendered')
    const loadData = async () => {
      await updateUserSetups()
      setIsLoading(false)
    }
    loadData()
  }, [updateUserSetups])

  return (
    <div className="flex flex-col h-screen">
      <div className="h-14 lg:h-[55px] border-b w-full bg-white dark:bg-black flex items-center gap-4 z-1">
        <div className="px-4 -z-1">
          <JournalNavigation />
        </div>
        <div className="justify-end px-2 ml-auto">
          <AddTradesButton />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <StrategyArea onStrategySelect={handleStrategySelect} />
        <div className="flex-1 overflow-auto p-4">
          <main className="space-y-6">
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-4">
              {isLoading ? (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              ) : (
                <>
                  <TraderTypeCard initialTraderType={null} onTraderTypeChange={handleTraderTypeChange} className="flex-none w-64" />
                  <MarketTypesCard initialMarkets={null} onMarketChange={handleMarketChange} className="flex-none w-64" />
                  <RiskRewardCard initialStrategy={riskRewardStrategy} onStrategyChange={handleRiskRewardChange} className="flex-none w-64" />
                  <RiskPercentageCard 
                    initialStrategies={null} 
                    onStrategiesChange={() => {}} 
                    className="flex-none w-64"
                  />
                </>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {isLoading ? (
                <>
                  <UserSetupsListSkeleton />
                  <TradeSetupTemplateSkeleton />
                </>
              ) : (
                <>
                  <Suspense fallback={<UserSetupsListSkeleton />}>
                    <UserSetupsList 
                      setups={userSetups} 
                      onUpdate={updateUserSetups} 
                      onEdit={handleEditSetup}
                      selectedStrategyId={selectedStrategy?.id || null}
                    />
                  </Suspense>
                  <Suspense fallback={<TradeSetupTemplateSkeleton />}>
                    <TradeSetupTemplate 
                      onSetupSaved={updateUserSetups} 
                      setupToEdit={setupToEdit} 
                      selectedStrategy={selectedStrategy}
                    />
                  </Suspense>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

