'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveStrategy, getUserStrategies } from '../actions/save-setup'
import { useToast } from "@/components/ui/use-toast"

interface Strategy {
  id: string
  name: string
  description: string
  created_at: string
}

interface StrategyAreaProps {
  onStrategySelect?: (strategy: Strategy) => void;
}

export function StrategyArea({ onStrategySelect }: StrategyAreaProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [newStrategy, setNewStrategy] = useState({ name: '', description: '' })
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchStrategies()
  }, [])

  const fetchStrategies = async () => {
    try {
      const fetchedStrategies = await getUserStrategies()
      if (fetchedStrategies) {
        setStrategies(fetchedStrategies.map(s => ({
          id: s.strategy_id,
          name: s.strategy_name,
          description: s.strategy_description,
          created_at: s.strategy_created
        })))
      }
    } catch (error) {
      console.error('Error fetching strategies:', error)
      toast({
        title: "Failed to fetch strategies",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateStrategy = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await saveStrategy({
        strategy_name: newStrategy.name,
        strategy_description: newStrategy.description
      })
      setNewStrategy({ name: '', description: '' })
      setIsDrawerOpen(false)
      await fetchStrategies()
      toast({
        title: "Strategy created",
        description: "Your new strategy has been successfully created.",
      })
    } catch (error) {
      console.error('Error creating strategy:', error)
      toast({
        title: "Failed to create strategy",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSelectStrategy = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    if (onStrategySelect) {
      onStrategySelect(strategy);
    }
  }

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 border-r">
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Strategies</h2>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full">Create Strategy</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Create New Strategy</DrawerTitle>
              <DrawerDescription>Add a new trading strategy to your list.</DrawerDescription>
            </DrawerHeader>
            <form onSubmit={handleCreateStrategy} className="p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="strategy-name">Strategy Name</Label>
                  <Input
                    id="strategy-name"
                    value={newStrategy.name}
                    onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                    placeholder="Enter strategy name"
                  />
                </div>
                <div>
                  <Label htmlFor="strategy-description">Strategy Description</Label>
                  <Textarea
                    id="strategy-description"
                    value={newStrategy.description}
                    onChange={(e) => setNewStrategy({ ...newStrategy, description: e.target.value })}
                    placeholder="Describe your strategy"
                  />
                </div>
              </div>
              <DrawerFooter>
                <Button type="submit">Save Strategy</Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      </div>
      <Separator className="my-4" />
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4 space-y-4">
          {strategies.map((strategy) => (
            <Card 
              key={strategy.id} 
              className={`cursor-pointer ${
                selectedStrategy?.id === strategy.id 
                  ? 'dark:bg-zinc-900 dark:text-zinc-50 bg-zinc-50' 
                  : ''
              }`}
              onClick={() => handleSelectStrategy(strategy)}
            >
              <CardContent className={`p-4 ${
                selectedStrategy?.id === strategy.id 
                  ? 'dark:text-zinc-50' 
                  : ''
              }`}>
                <h3 className="font-semibold">{strategy.name}</h3>
                <p className={`text-sm ${
                  selectedStrategy?.id === strategy.id 
                    ? 'dark:text-zinc-300' 
                    : 'text-muted-foreground'
                } mt-1`}>
                  {strategy.description}
                </p>
                <p className={`text-xs ${
                  selectedStrategy?.id === strategy.id 
                    ? 'dark:text-zinc-400' 
                    : 'text-muted-foreground'
                } mt-2`}>
                  Created: {new Date(strategy.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

