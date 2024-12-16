'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { X, Plus, Trash2 } from 'lucide-react'
import { submitRiskStrategy, getUserRiskStrategy } from '../actions/risk-management'
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

interface RiskRewardRatio {
  riskToReward: number;
  riskPercentage: number;
}

interface RiskStrategy {
  name: string;
  type: string;
  value: number;
  description: string;
  example: string;
  selected: boolean;
  additionalParams?: {
    [key: string]: number | string | boolean | RiskRewardRatio[];
  };
}

interface RiskStrategiesPanelProps {
  initialStrategies?: RiskStrategy[] | null;
  onStrategiesChange?: (strategies: RiskStrategy[]) => void;
  className?: string;
}

const predefinedStrategies: RiskStrategy[] = [
  {
    name: 'Fixed Risk Percentage',
    type: 'percentage',
    value: 1,
    description: 'A fixed percentage of the trading account is risked per trade, regardless of account size or performance.',
    example: 'If your account balance is $10,000 and you set a 1% risk, you would risk $100 per trade.',
    selected: false,
  },
  {
    name: 'Dynamic Risk Percentage',
    type: 'dynamic',
    value: 1,
    description: 'Adjusting the percentage of risk based on performance. Risk increases after wins and decreases after losses.',
    example: 'Starting with a 1% base risk, you might increase to 1.2% after a win or decrease to 0.8% after a loss.',
    selected: false,
    additionalParams: {
      baseRisk: 1,
      incrementRisk: 0.2,
    },
  },
  {
    name: 'Fixed Dollar Amount',
    type: 'fixed',
    value: 100,
    description: 'Risking a set dollar amount per trade instead of a percentage.',
    example: 'You risk $100 per trade, regardless of your account size or the specific trade setup.',
    selected: false,
  },
  {
    name: 'Volatility-Based Risk',
    type: 'volatility',
    value: 1,
    description: 'Risk is calculated based on the market\'s current volatility, using various indicators.',
    example: 'If using ATR with a multiplier of 1.5 and 1% risk, and the ATR is $2, you would risk 1% of your account or $3 per share, whichever is lower.',
    selected: false,
    additionalParams: {
      multiplier: 1.5,
      indicator: 'Average True Range',
    },
  },
  {
    name: 'Equity-Based Risk',
    type: 'percentage',
    value: 1,
    description: 'Risk is calculated based on the trader\'s account equity rather than balance (includes open P&L).',
    example: 'If your account balance is $10,000 but your equity (including open positions) is $11,000, you would risk 1% of $11,000, which is $110.',
    selected: false,
  },
  {
    name: 'Tiered Risk Percentage',
    type: 'tiered',
    value: 0,
    description: 'Using different risk percentages for different setups based on confidence levels.',
    example: 'You might risk 2% on high-confidence trades, 1% on medium-confidence trades, and 0.5% on low-confidence trades.',
    selected: false,
    additionalParams: {
      highConfidence: 2,
      mediumConfidence: 1,
      lowConfidence: 0.5,
    },
  },
  {
    name: 'Risk Reward-Based Adjustments',
    type: 'riskReward',
    value: 0,
    description: 'Adjusting the risk percentage based on the trade\'s risk-to-reward ratio.',
    example: 'For trades with a 3:1 reward-to-risk ratio, you might risk 2% of your account. For 2:1 trades, you might risk 1%.',
    selected: false,
    additionalParams: {
      ratios: [{ riskToReward: 3, riskPercentage: 2 }, { riskToReward: 2, riskPercentage: 1 }],
    },
  },
  {
    name: 'Time-Based Risk',
    type: 'timeBased',
    value: 0,
    description: 'Adjusting risk based on the trading timeframe or holding period.',
    example: 'You might risk 0.5% for scalp trades, 1% for intraday trades, and 2% for swing trades.',
    selected: false,
    additionalParams: {
      scalpRisk: 0.5,
      intradayRisk: 1,
      swingRisk: 2,
    },
  },
  {
    name: 'Maximum Daily or Weekly Risk',
    type: 'maxRisk',
    value: 5,
    description: 'Setting a cap on the total amount of risk or loss per day or week.',
    example: 'You set a maximum daily risk of 5% of your account. Once you\'ve reached this limit, you stop trading for the day.',
    selected: false,
    additionalParams: {
      period: 'Daily',
    },
  },
  {
    name: 'Scaling In/Out Risk',
    type: 'scaling',
    value: 0,
    description: 'Adjusting risk dynamically by scaling into or out of trades.',
    example: 'You initially risk 0.5% of your account. If the trade moves in your favor, you add another 0.5% risk at 50% trade completion, with a maximum total risk of 1.5%.',
    selected: false,
    additionalParams: {
      initialRisk: 0.5,
      scaleInTime: 50,
      maxTotalRisk: 1.5,
    },
  },
]

export function RiskStrategiesPanel({ initialStrategies, onStrategiesChange, className }: RiskStrategiesPanelProps) {
  const [riskStrategies, setRiskStrategies] = useState<RiskStrategy[]>(initialStrategies || [])
  const [selectedStrategy, setSelectedStrategy] = useState<RiskStrategy | null>(null)
  const [selectedStrategies, setSelectedStrategies] = useState<RiskStrategy[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRiskStrategies = async () => {
      try {
        const fetchedStrategies = await getUserRiskStrategy()
        console.log('Fetched strategies:', fetchedStrategies)
        if (fetchedStrategies && fetchedStrategies.length > 0) {
          const updatedStrategies = fetchedStrategies.map(strategy => ({
            ...strategy,
            selected: Boolean(strategy.selected)
          })) as RiskStrategy[];
          setRiskStrategies(updatedStrategies)
          setSelectedStrategies(updatedStrategies.filter(s => s.selected))
          onStrategiesChange && onStrategiesChange(updatedStrategies)
        } else {
          console.log('No strategies fetched, using predefined strategies')
          setRiskStrategies(predefinedStrategies)
        }
      } catch (error) {
        console.error('Error fetching user risk strategies:', error)
        setRiskStrategies(predefinedStrategies)
      } finally {
        setIsLoading(false)
      }
    }

    if (!initialStrategies || initialStrategies.length === 0) {
      fetchRiskStrategies()
    } else {
      const updatedStrategies = initialStrategies.map(strategy => ({
        ...strategy,
        selected: Boolean(strategy.selected)
      })) as RiskStrategy[];
      setRiskStrategies(updatedStrategies)
      setSelectedStrategies(updatedStrategies.filter(s => s.selected))
      setIsLoading(false)
    }
  }, [initialStrategies, onStrategiesChange])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await submitRiskStrategy(riskStrategies)
      setRiskStrategies(result)
      setSelectedStrategies(result.filter(s => s.selected))
      if (onStrategiesChange) {
        onStrategiesChange(result)
      }
      toast({
        title: "Risk Strategies updated",
        description: "Your risk strategies have been successfully updated.",
      })
      setIsDrawerOpen(false)
    } catch (error) {
      console.error('Error submitting risk strategies:', error)
      toast({
        title: "Failed to update Risk Strategies",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStrategyChange = (name: string, field: string, value: string | number | boolean) => {
    setRiskStrategies(prevStrategies =>
      prevStrategies.map(strategy =>
        strategy.name === name
          ? {
              ...strategy,
              [field]: field === 'selected'
                ? Boolean(value)
                : field === 'value'
                  ? typeof value === 'string' ? parseFloat(value) : value
                  : value,
              additionalParams: field.startsWith('additionalParams.')
                ? {
                    ...strategy.additionalParams,
                    [field.split('.')[1]]:
                      field === 'additionalParams.indicator' || field === 'additionalParams.period'
                        ? value
                        : typeof value === 'boolean'
                          ? value
                          : typeof value === 'string'
                            ? isNaN(parseFloat(value)) ? value : parseFloat(value)
                            : value
                  }
                : strategy.additionalParams
            }
          : strategy
      )
    )
    if (selectedStrategy?.name === name) {
      setSelectedStrategy(prevStrategy =>
        prevStrategy
          ? {
              ...prevStrategy,
              [field]: field === 'selected'
                ? Boolean(value)
                : field === 'value'
                  ? typeof value === 'string' ? parseFloat(value) : value
                  : value,
              additionalParams: field.startsWith('additionalParams.')
                ? {
                    ...prevStrategy.additionalParams,
                    [field.split('.')[1]]:
                      field === 'additionalParams.indicator' || field === 'additionalParams.period'
                        ? value
                        : typeof value === 'boolean'
                          ? value
                          : typeof value === 'string'
                            ? isNaN(parseFloat(value)) ? value : parseFloat(value)
                            : value
                  }
                : prevStrategy.additionalParams
            }
          : null
      )
    }
    
    // Update selectedStrategies when a strategy is selected or deselected
    if (field === 'selected') {
      setSelectedStrategies(prevSelected => {
        const strategy = riskStrategies.find(s => s.name === name)
        if (strategy) {
          if (value) {
            return [...prevSelected, { ...strategy, selected: true }]
          } else {
            return prevSelected.filter(s => s.name !== name)
          }
        }
        return prevSelected
      })
    }
  }

  const handleRiskRewardChange = (name: string, index: number, field: 'riskToReward' | 'riskPercentage', value: string) => {
    setRiskStrategies(prevStrategies =>
      prevStrategies.map(strategy =>
        strategy.name === name
          ? {
              ...strategy,
              additionalParams: {
                ...strategy.additionalParams,
                ratios: (strategy.additionalParams?.ratios as RiskRewardRatio[]).map((item, i) =>
                  i === index ? { ...item, [field]: parseFloat(value) || 0 } : item
                )
              }
            }
          : strategy
      )
    )
    if (selectedStrategy?.name === name) {
      setSelectedStrategy(prevStrategy =>
        prevStrategy
          ? {
              ...prevStrategy,
              additionalParams: {
                ...prevStrategy.additionalParams,
                ratios: (prevStrategy.additionalParams?.ratios as RiskRewardRatio[]).map((item, i) =>
                  i === index ? { ...item, [field]: parseFloat(value) || 0 } : item
                )
              }
            }
          : null
      )
    }
  }

  const addRiskRewardRatio = (name: string) => {
    setRiskStrategies(prevStrategies =>
      prevStrategies.map(strategy =>
        strategy.name === name
          ? {
              ...strategy,
              additionalParams: {
                ...strategy.additionalParams,
                ratios: [...(strategy.additionalParams?.ratios as RiskRewardRatio[]), { riskToReward: 2, riskPercentage: 1 }]
              }
            }
          : strategy
      )
    )
    if (selectedStrategy?.name === name) {
      setSelectedStrategy(prevStrategy =>
        prevStrategy
          ? {
              ...prevStrategy,
              additionalParams: {
                ...prevStrategy.additionalParams,
                ratios: [...(prevStrategy.additionalParams?.ratios as RiskRewardRatio[]), { riskToReward: 2, riskPercentage: 1 }]
              }
            }
          : null
      )
    }
  }

  const removeRiskRewardRatio = (name: string, index: number) => {
    setRiskStrategies(prevStrategies =>
      prevStrategies.map(strategy =>
        strategy.name === name
          ? {
              ...strategy,
              additionalParams: {
                ...strategy.additionalParams,
                ratios: (strategy.additionalParams?.ratios as RiskRewardRatio[]).filter((_, i) => i !== index)
              }
            }
          : strategy
      )
    )
    if (selectedStrategy?.name === name) {
      setSelectedStrategy(prevStrategy =>
        prevStrategy
          ? {
              ...prevStrategy,
              additionalParams: {
                ...prevStrategy.additionalParams,
                ratios: (prevStrategy.additionalParams?.ratios as RiskRewardRatio[]).filter((_, i) => i !== index)
              }
            }
          : null
      )
    }
  }

  const renderStrategyConfig = (strategy: RiskStrategy) => {
    switch (strategy.type) {
      case 'percentage':
      case 'fixed':
        return (
          <div className="flex items-center space-x-4">
            <Label htmlFor={`${strategy.name}-risk`} className="text-lg">Risk:</Label>
            <Input
              id={`${strategy.name}-risk`}
              type="number"
              value={strategy.value.toString()}
              onChange={(e) => handleStrategyChange(strategy.name, 'value', e.target.value)}
              className="w-24 text-lg"
            />
            <span className="text-lg">{strategy.type === 'percentage' ? '%' : 'USD'}</span>
          </div>
        )
      case 'dynamic':
        return (
          <>
            <div className="flex items-center space-x-4">
              <Label htmlFor={`${strategy.name}-base-risk`} className="text-lg">Base Risk:</Label>
              <Input
                id={`${strategy.name}-base-risk`}
                type="number"
                value={strategy.additionalParams?.baseRisk?.toString() || '0'}
                onChange={(e) => handleStrategyChange(strategy.name, 'additionalParams.baseRisk', e.target.value)}
                className="w-24 text-lg"
              />
              <span className="text-lg">%</span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <Label htmlFor={`${strategy.name}-increment-risk`} className="text-lg">Increment Risk:</Label>
              <Input
                id={`${strategy.name}-increment-risk`}
                type="number"
                value={strategy.additionalParams?.incrementRisk?.toString() || '0'}
                onChange={(e) => handleStrategyChange(strategy.name, 'additionalParams.incrementRisk', e.target.value)}
                className="w-24 text-lg"
              />
              <span className="text-lg">%</span>
            </div>
          </>
        )
      case 'volatility':
        return (
          <>
            <div className="flex items-center space-x-4">
              <Label htmlFor={`${strategy.name}-multiplier`} className="text-lg">Multiplier:</Label>
              <Input
                id={`${strategy.name}-multiplier`}
                type="number"
                value={strategy.additionalParams?.multiplier?.toString() || '0'}
                onChange={(e) => handleStrategyChange(strategy.name, 'additionalParams.multiplier', e.target.value)}
                className="w-24 text-lg"
              />
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <Label htmlFor={`${strategy.name}-risk`} className="text-lg">Risk:</Label>
              <Input
                id={`${strategy.name}-risk`}
                type="number"
                value={strategy.value.toString()}
                onChange={(e) => handleStrategyChange(strategy.name, 'value', e.target.value)}
                className="w-24 text-lg"
              />
              <span className="text-lg">%</span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <Label htmlFor={`${strategy.name}-indicator`} className="text-lg">Indicator:</Label>
              <Select
                value={strategy.additionalParams?.indicator as string}
                onValueChange={(value) => handleStrategyChange(strategy.name, 'additionalParams.indicator', value)}
              >
                <SelectTrigger className="w-auto min-w-[180px] h-auto text-lg">
                  <SelectValue placeholder="Select indicator" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="Average True Range" className="text-lg py-2">Average True Range</SelectItem>
                  <SelectItem value="Bollinger Band" className="text-lg py-2">Bollinger Band</SelectItem>
                  <SelectItem value="Standard Deviation" className="text-lg py-2">Standard Deviation</SelectItem>
                  <SelectItem value="Implied Volatility" className="text-lg py-2">Implied Volatility</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )
      case 'tiered':
        return (
          <>
            <div className="flex items-center space-x-4">
              <Label htmlFor={`${strategy.name}-high-confidence`} className="text-lg">High Confidence:</Label>
              <Input
                id={`${strategy.name}-high-confidence`}
                type="number"
                value={strategy.additionalParams?.highConfidence?.toString() || '0'}
                onChange={(e) => handleStrategyChange(strategy.name, 'additionalParams.highConfidence', e.target.value)}
                className="w-24 text-lg"
              />
              <span className="text-lg">%</span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <Label htmlFor={`${strategy.name}-medium-confidence`} className="text-lg">Medium Confidence:</Label>
              <Input
                id={`${strategy.name}-medium-confidence`}
                type="number"
                value={strategy.additionalParams?.mediumConfidence?.toString() || '0'}
                onChange={(e) => handleStrategyChange(strategy.name, 'additionalParams.mediumConfidence', e.target.value)}
                className="w-24 text-lg"
              />
              <span className="text-lg">%</span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <Label htmlFor={`${strategy.name}-low-confidence`} className="text-lg">Low Confidence:</Label>
              <Input
                id={`${strategy.name}-low-confidence`}
                type="number"
                value={strategy.additionalParams?.lowConfidence?.toString() || '0'}
                onChange={(e) => handleStrategyChange(strategy.name, 'additionalParams.lowConfidence', e.target.value)}
                className="w-24 text-lg"
              />
              <span className="text-lg">%</span>
            </div>
          </>
        )
      case 'riskReward':
        return (
          <>
            {(strategy.additionalParams?.ratios as RiskRewardRatio[])?.map((ratio, index) => (
              <div key={index} className="flex items-center space-x-4 mt-2">
                <Label htmlFor={`${strategy.name}-ratio-${index}`} className="text-lg">Risk to Reward:</Label>
                <span className="text-lg">1:</span>
                <Input
                  id={`${strategy.name}-ratio-${index}`}
                  type="number"
                  value={ratio.riskToReward.toString()}
                  onChange={(e) => handleRiskRewardChange(strategy.name, index, 'riskToReward', e.target.value)}
                  className="w-24 text-lg"
                />
                <span className="text-lg">RR at</span>
                <Input
                  id={`${strategy.name}-risk-${index}`}
                  type="number"
                  value={ratio.riskPercentage.toString()}
                  onChange={(e) => handleRiskRewardChange(strategy.name, index, 'riskPercentage', e.target.value)}
                  className="w-24 text-lg"
                />
                <span className="text-lg">%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRiskRewardRatio(strategy.name, index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRiskRewardRatio(strategy.name)}
              className="mt-2"
            >
              Add Risk to Reward Ratio
            </Button>
          </>
        )
      case 'timeBased':
        return (
          <>
            <div className="flex items-center space-x-4">
              <Label htmlFor={`${strategy.name}-scalp-risk`} className="text-lg">Scalp Risk:</Label>
              <Input
                id={`${strategy.name}-scalp-risk`}
                type="number"
                value={strategy.additionalParams?.scalpRisk?.toString() || '0'}
                onChange={(e) => handleStrategyChange(strategy.name, 'additionalParams.scalpRisk', e.target.value)}
                className="w-24 text-lg"
              />
              <span className="text-lg">%</span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <Label htmlFor={`${strategy.name}-intraday-risk`} className="text-lg">Intraday Risk:</Label>
              <Input
                id={`${strategy.name}-intraday-risk`}
                type="number"
                value={strategy.additionalParams?.intradayRisk?.toString() || '0'}
                onChange={(e) => handleStrategyChange(strategy.name, 'additionalParams.intradayRisk', e.target.value)}
                className="w-24 text-lg"
              />
              <span className="text-lg">%</span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <Label htmlFor={`${strategy.name}-swing-risk`} className="text-lg">Swing Risk:</Label>
              <Input
                id={`${strategy.name}-swing-risk`}
                type="number"
                value={strategy.additionalParams?.swingRisk?.toString() || '0'}
                onChange={(e) => handleStrategyChange(strategy.name, 'additionalParams.swingRisk', e.target.value)}
                className="w-24 text-lg"
              />
              <span className="text-lg">%</span>
            </div>
          </>
        )
      case 'maxRisk':
        return (
          <div className="flex items-center space-x-4">
            <Select
              value={strategy.additionalParams?.period as string}
              onValueChange={(value) => handleStrategyChange(strategy.name, 'additionalParams.period', value)}
            >
              <SelectTrigger className="w-auto min-w-[100px] h-auto text-lg">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily" className="text-lg py-2">Daily</SelectItem>
                <SelectItem value="Weekly" className="text-lg py-2">Weekly</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor={`${strategy.name}-risk`} className="text-lg">Risk:</Label>
            <Input
              id={`${strategy.name}-risk`}
              type="number"
              value={strategy.value.toString()}
              onChange={(e) => handleStrategyChange(strategy.name, 'value', e.target.value)}
              className="w-24 text-lg"
            />
            <span className="text-lg">%</span>
          </div>
        )
      case 'scaling':
        return (
          <>
            <div className="flex items-center space-x-4">
              <Label htmlFor={`${strategy.name}-initial-risk`} className="text-lg">Initial Risk:</Label>
              <Input
                id={`${strategy.name}-initial-risk`}
                type="number"
                value={strategy.additionalParams?.initialRisk?.toString() || '0'}
                onChange={(e) => handleStrategyChange(strategy.name, 'additionalParams.initialRisk', e.target.value)}
                className="w-24 text-lg"
              />
              <span className="text-lg">%</span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <Label htmlFor={`${strategy.name}-scale-in-time`} className="text-lg">Scale In Time:</Label>
              <Input
                id={`${strategy.name}-scale-in-time`}
                type="number"
                value={strategy.additionalParams?.scaleInTime?.toString() || '0'}
                onChange={(e) => handleStrategyChange(strategy.name, 'additionalParams.scaleInTime', e.target.value)}
                className="w-24 text-lg"
              />
              <span className="text-lg">% Trade Completion</span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <Label htmlFor={`${strategy.name}-max-total-risk`} className="text-lg">Maximum Total Risk:</Label>
              <Input
                id={`${strategy.name}-max-total-risk`}
                type="number"
                value={strategy.additionalParams?.maxTotalRisk?.toString() || '0'}
                onChange={(e) => handleStrategyChange(strategy.name, 'additionalParams.maxTotalRisk', e.target.value)}
                className="w-24 text-lg"
              />
              <span className="text-lg">%</span>
            </div>
          </>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return <Skeleton className="h-full w-64" />
  }

  return (
    <div className={`w-64 border-l ${className}`}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Risk Strategies</h2>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Strategy
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-screen max-h-screen">
            <div className="mx-auto w-full h-full flex flex-col">
              <DrawerHeader className="relative">
                <DrawerClose asChild>
                  <X
                    className="absolute top-2 right-2 cursor-pointer"
                    size={24}
                  />
                </DrawerClose>
                <DrawerTitle>
                  Set Risk Strategies
                </DrawerTitle>
                <DrawerDescription>
                  Choose or create your preferred risk strategies for trading
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-hidden">
                <div className="flex h-full">
                  <ScrollArea className="w-2/5 border-r p-4">
                    {riskStrategies.map((strategy) => (
                      <Card
                        key={strategy.name}
                        className={`mb-4 cursor-pointer ${selectedStrategy?.name === strategy.name ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => setSelectedStrategy(strategy)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{strategy.name}</h3>
                            <p className="text-sm">{strategy.description}</p>
                          </div>
                          <Checkbox
                            checked={strategy.selected}
                            onCheckedChange={(checked) => handleStrategyChange(strategy.name, 'selected', checked)}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </ScrollArea>
                  <div className="flex-1 p-4 overflow-y-auto">
                    {selectedStrategy && (
                      <div className="space-y-6">
                        <h2 className="text-3xl font-bold">{selectedStrategy.name}</h2>
                        <p className="text-lg">{selectedStrategy.description}</p>
                        <div>
                          <h3 className="text-2xl font-semibold mb-2">Example:</h3>
                          <p className="text-lg">{selectedStrategy.example}</p>
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold mb-4">Configuration:</h3>
                          <div className="space-y-4">
                            {renderStrategyConfig(selectedStrategy)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DrawerFooter className="py-6">
                <Button onClick={handleSubmit} disabled={isSubmitting} className="text-lg">
                  {isSubmitting ? 'Updating...' : 'Update Risk Strategies'}
                </Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="p-4 space-y-4">
          {selectedStrategies.map((strategy) => (
            <Card key={strategy.name}>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold">{strategy.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

