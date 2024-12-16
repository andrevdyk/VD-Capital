'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { saveStrategy, getUserStrategies, deleteStrategy } from '../actions/save-setup'
import { useToast } from "@/components/ui/use-toast"
import { Edit, Trash2, Search } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StrategyAreaSkeleton } from './StrategyAreaSkeleton'

interface Strategy {
  id: string
  name: string
  description: string
  created_at: string
}

interface StrategyAreaProps {
  onStrategySelect?: (strategy: Strategy | null) => void;
}

export function StrategyArea({ onStrategySelect }: StrategyAreaProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [newStrategy, setNewStrategy] = useState({ name: '', description: '' })
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStrategies();
  }, [])

  const fetchStrategies = async (showLoading: boolean = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
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
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
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
      await fetchStrategies(false)
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

  const handleEditStrategy = (strategy: Strategy) => {
    setEditingStrategy(strategy)
    setNewStrategy({ name: strategy.name, description: strategy.description })
    setIsDrawerOpen(true)
  }

  const handleUpdateStrategy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStrategy) return

    try {
      await saveStrategy({
        strategy_id: editingStrategy.id,
        strategy_name: newStrategy.name,
        strategy_description: newStrategy.description
      })
      setNewStrategy({ name: '', description: '' })
      setIsDrawerOpen(false)
      setEditingStrategy(null)
      await fetchStrategies()
      toast({
        title: "Strategy updated",
        description: "Your strategy has been successfully updated.",
      })
    } catch (error) {
      console.error('Error updating strategy:', error)
      toast({
        title: "Failed to update strategy",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteStrategy = async (strategyId: string) => {
    try {
      await deleteStrategy(strategyId)
      await fetchStrategies()
      if (selectedStrategy?.id === strategyId) {
        setSelectedStrategy(null)
        if (onStrategySelect) {
          onStrategySelect(null)
        }
      }
      toast({
        title: "Strategy deleted",
        description: "Your strategy and related setups have been successfully deleted.",
      })
    } catch (error) {
      console.error('Error deleting strategy:', error)
      toast({
        title: "Failed to delete strategy",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredStrategies = useMemo(() => {
    return strategies.filter(strategy =>
      strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      strategy.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [strategies, searchTerm])

  if (isLoading) {
    return <StrategyAreaSkeleton />
  }

  return (
    <div className="w-full md:w-1/4 lg:w-1/5 border-r flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="p-4 flex-shrink-0">
        <h2 className="text-2xl font-semibold mb-4">Strategies</h2>
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search strategies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full">Create Strategy</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{editingStrategy ? 'Edit Strategy' : 'Create New Strategy'}</DrawerTitle>
              <DrawerDescription>
                {editingStrategy ? 'Update your existing strategy.' : 'Add a new trading strategy to your list.'}
              </DrawerDescription>
            </DrawerHeader>
            <form onSubmit={editingStrategy ? handleUpdateStrategy : handleCreateStrategy} className="p-4">
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
                <Button type="submit">{editingStrategy ? 'Update Strategy' : 'Save Strategy'}</Button>
                <DrawerClose asChild>
                  <Button variant="outline" onClick={() => {
                    setNewStrategy({ name: '', description: '' })
                    setEditingStrategy(null)
                  }}>
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="flex-grow overflow-hidden">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-4 pb-4 space-y-4">
            {filteredStrategies.map((strategy) => (
              <Card 
                key={strategy.id} 
                className={`cursor-pointer ${
                  selectedStrategy?.id === strategy.id 
                    ? 'hover:bg-accent bg-accent dark:text-zinc-50' 
                    : ''
                }`}
                onClick={() => handleSelectStrategy(strategy)}
              >
                <CardContent className="p-4 flex justify-between items-start">
                  <div>
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
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditStrategy(strategy)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your strategy and all related setups.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteStrategy(strategy.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

