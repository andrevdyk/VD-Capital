"use client"

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Strategy {
  id: string
  name: string
}

interface Setup {
  id: string
  name: string
  strategyId: string
}

interface StrategySelectorProps {
  onStrategyChange: (strategyId: string) => void
  onSetupChange: (setupId: string) => void
}

export function StrategySelector({ onStrategyChange, onSetupChange }: StrategySelectorProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [setups, setSetups] = useState<Setup[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)

  useEffect(() => {
    // Fetch strategies and setups from your API
    const fetchStrategiesAndSetups = async () => {
      // Replace these with actual API calls
      const strategiesResponse = await fetch('/api/strategies')
      const setupsResponse = await fetch('/api/setups')

      const strategiesData = await strategiesResponse.json()
      const setupsData = await setupsResponse.json()

      setStrategies(strategiesData)
      setSetups(setupsData)
    }

    fetchStrategiesAndSetups()
  }, [])

  const handleStrategyChange = (strategyId: string) => {
    setSelectedStrategy(strategyId)
    onStrategyChange(strategyId)
  }

  const filteredSetups = selectedStrategy
    ? setups.filter(setup => setup.strategyId === selectedStrategy)
    : []

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="strategy-select">Strategy</Label>
        <Select onValueChange={handleStrategyChange}>
          <SelectTrigger id="strategy-select" className="w-[200px]">
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            {strategies.map((strategy) => (
              <SelectItem key={strategy.id} value={strategy.id}>
                {strategy.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="setup-select">Setup</Label>
        <Select onValueChange={onSetupChange} disabled={!selectedStrategy}>
          <SelectTrigger id="setup-select" className="w-[200px]">
            <SelectValue placeholder="Select setup" />
          </SelectTrigger>
          <SelectContent>
            {filteredSetups.map((setup) => (
              <SelectItem key={setup.id} value={setup.id}>
                {setup.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

