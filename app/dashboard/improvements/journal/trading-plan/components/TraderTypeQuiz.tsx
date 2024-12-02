'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TraderTypeCard } from './TraderTypeCard'
import { MarketTypesCard } from './MarketTypesCard'
import { getUserTraderType } from '../actions/quiz'
import { getUserMarkets } from '../actions/market-quiz'

export function TraderTypeQuiz() {
  const [initialTraderType, setInitialTraderType] = useState<string | null>(null)
  const [initialMarkets, setInitialMarkets] = useState<string[] | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [traderType, marketsData] = await Promise.all([
          getUserTraderType(),
          getUserMarkets()
        ])
        setInitialTraderType(traderType)
        setInitialMarkets(marketsData?.markets || null)
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
    fetchData()
  }, [])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl">Trading Profile</CardTitle>
        <CardDescription className="text-lg">Determine your trading style and preferred markets.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TraderTypeCard initialTraderType={initialTraderType} onTraderTypeChange={() => {}} />
        <MarketTypesCard initialMarkets={initialMarkets} onMarketChange={() => {}} />
      </CardContent>
    </Card>
  )
}

