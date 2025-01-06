'use client'

import { useState, Suspense, lazy, useEffect, useCallback } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { AddTradesButton } from "../components/add-trades-button"
import { JournalNavigation } from "../components/journal-navigation"
import { TradeSetupTemplateSkeleton } from "./components/TradeSetupTemplateSkeleton"
const TradeSetupTemplate = lazy(() => import("./components/TradeSetupTemplate"))
import { UserSetupsListSkeleton } from "./components/UserSetupsListSkeleton"
const UserSetupsList = lazy(() => import("./components/UserSetupsList"))
import { getUserSetups, getSetupById } from './actions/save-setup'
import { UserSetup, RiskStrategy } from '@/app/types/user'
import { CardSkeleton } from "./components/CardSkeleton"
import { StrategyArea } from "./components/StrategyArea"
import { getUserRiskStrategy } from './actions/risk-management'

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
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [riskStrategies, setRiskStrategies] = useState<RiskStrategy[]>([])

  const handleRiskStrategiesChange = useCallback((newStrategies: RiskStrategy[]) => {
    setRiskStrategies(newStrategies)
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

  const handleStrategySelect = useCallback((strategy: Strategy | null) => {
    setSelectedStrategy(strategy)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      await updateUserSetups()
      try {
        const fetchedStrategies = await getUserRiskStrategy()
        if (fetchedStrategies) {
          setRiskStrategies(fetchedStrategies)
        }
      } catch (error) {
        console.error('Error fetching initial risk strategies:', error)
      }
      setIsLoading(false)
    }
    loadData()
  }, [updateUserSetups])

  return (
    <div className="flex flex-col h-screen">
      <div className="h-14 border-b w-full bg-white dark:bg-black flex items-center gap-4 z-1">
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
          <main className="">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
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

