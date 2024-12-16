'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
import { X } from 'lucide-react'
import { submitRiskStrategy, getUserRiskStrategy } from '../actions/risk-management'
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface RiskRewardStrategy {
  name: string;
  type: string;
  description: string;
  example: string;
  ratio?: number;
  additionalParams?: Record<string, number>;
  selected?: boolean; // Added to handle selected strategy from backend
}

interface RiskRewardCardProps {
  initialStrategy?: RiskRewardStrategy | null;
  onStrategyChange: (strategy: RiskRewardStrategy | null) => void;
  className?: string;
}

const predefinedStrategies: RiskRewardStrategy[] = [
  {
    name: 'Fixed R:R Ratio',
    type: 'fixed',
    description: 'The trader always uses a predetermined, fixed R:R ratio, such as 1:1, 1:2, or 1:3. This ensures consistency and simplicity in trade management.',
    example: 'A trader risks $100 on every trade (stop-loss) and targets $200 (reward) for a fixed R:R of 1:2.',
    ratio: 2,
  },
  {
    name: 'Dynamic R:R Ratio',
    type: 'dynamic',
    description: 'The R:R ratio is adjusted based on performance, market conditions, or confidence in the trade.',
    example: 'A trader risks 1% of their capital with an R:R of 1:2, but after three consecutive wins, increases the target to an R:R of 1:3.',
    ratio: 2,
    additionalParams: {
      baseRatio: 2,
      increasedRatio: 3,
      riskPercentage: 1,
    },
  },
  {
    name: 'Indicator-Based R:R Ratio',
    type: 'indicator',
    description: 'The R:R ratio is determined by indicators, such as moving averages, Bollinger Bands, or ATR (Average True Range). The indicators define stop-loss and target levels.',
    example: 'Stop-loss is placed at the lower Bollinger Band, and the target is the upper Bollinger Band. The distance between these points determines the R:R ratio dynamically.',
    additionalParams: {
      atrMultiplier: 2,
    },
  },
  {
    name: 'Market Structure-Based R:R Ratio',
    type: 'marketStructure',
    description: 'The R:R is defined by key levels in the market, such as support, resistance, or trendlines. The strategy focuses on logical placement of stop-losses and profit targets.',
    example: 'Stop-loss is placed below a major support level, and the target is set just below the next resistance level, resulting in an R:R of 1:3.',
    ratio: 3,
  },
  {
    name: 'Scalable R:R Ratio',
    type: 'scalable',
    description: 'The trader uses a tiered approach, taking partial profits at different levels to lock in gains while leaving the rest to run for larger targets.',
    example: 'Risking $100: Take 50% of profits at an R:R of 1:1. Move the stop-loss to breakeven and aim for 1:3 with the remaining position.',
    additionalParams: {
      firstTarget: 1,
      secondTarget: 3,
    },
  },
  {
    name: 'Trend-Following R:R Ratio',
    type: 'trendFollowing',
    description: 'The R:R ratio is based on the strength of the trend. Traders may target higher R:R ratios in strong trends.',
    example: 'In an uptrend, a trader risks $50 (stop-loss below a swing low) and sets the target at $300 (swing high or a Fibonacci extension), giving an R:R of 1:6.',
    ratio: 6,
  },
  {
    name: 'Volatility-Based R:R Ratio',
    type: 'volatility',
    description: 'The R:R ratio is adjusted based on market volatility, often using ATR or similar metrics. Wider stops are used in volatile markets, and targets are adjusted accordingly.',
    example: 'If the ATR is 50 pips, the stop-loss is set at 50 pips, and the target is set at 150 pips (R:R of 1:3).',
    ratio: 3,
    additionalParams: {
      atrMultiplier: 3,
    },
  },
  {
    name: 'Time-Based R:R Ratio',
    type: 'timeBased',
    description: 'The R:R is linked to the time horizon of the trade. Short-term trades often have smaller R:R ratios (e.g., 1:1), while longer-term trades aim for higher R:R (e.g., 1:5).',
    example: 'A day trader risks $100 with a target of $100 (1:1), while a swing trader risks $100 with a target of $500 (1:5).',
    additionalParams: {
      shortTerm: 1,
      longTerm: 5,
    },
  },
  {
    name: 'Breakout-Based R:R Ratio',
    type: 'breakout',
    description: 'R:R is based on breakout patterns, with the stop-loss placed just below the breakout level and the target set based on the measured move of the breakout.',
    example: 'Stop-loss is 20 pips below a breakout level, and the target is based on the size of the consolidation, resulting in an R:R of 1:4.',
    ratio: 4,
  },
  {
    name: 'Risk-Based R:R Ratio',
    type: 'riskBased',
    description: 'The R:R is based on how much capital the trader is willing to risk relative to potential gains.',
    example: 'A trader risks 1% of their account on every trade and aims for a 3% gain, resulting in an R:R of 1:3.',
    ratio: 3,
  },
  {
    name: 'Pivot Point-Based R:R Ratio',
    type: 'pivotPoint',
    description: 'Stop-loss and target are based on pivot points or support/resistance levels derived from them.',
    example: 'Stop-loss is below the S1 pivot level, and the target is set at R2, resulting in an R:R of 1:2.',
    ratio: 2,
  },
  {
    name: 'News-Based R:R Ratio',
    type: 'newsBased',
    description: 'R:R is adjusted based on the impact of upcoming news events. Larger rewards are sought to compensate for higher risk during volatile news periods.',
    example: 'A trader risks $200 ahead of a major news event, targeting $800 for an R:R of 1:4.',
    ratio: 4,
  },
  {
    name: 'Fixed Target, Dynamic Stop R:R Ratio',
    type: 'fixedTargetDynamicStop',
    description: 'The target is fixed, but the stop-loss is adjusted dynamically as the trade develops, often using a trailing stop.',
    example: 'The target is $300, but the stop-loss is tightened as the price moves in favor, resulting in varying R:R.',
    additionalParams: {
      initialRatio: 3,
      trailingStopPercentage: 10,
    },
  },
  {
    name: 'Reversal-Based R:R Ratio',
    type: 'reversal',
    description: 'Stop-loss and target are placed around anticipated reversal points, such as Fibonacci retracements or double bottoms/tops.',
    example: 'Stop-loss is set at a 38.2% Fibonacci retracement, and the target is placed at the 100% extension, yielding an R:R of 1:3.',
    ratio: 3,
  },
  {
    name: 'Scaling-Based R:R Ratio',
    type: 'scaling',
    description: 'Traders increase or decrease position size during the trade, dynamically affecting the R:R.',
    example: 'A trader risks $100 initially but adds to the position after confirmation, increasing potential reward to $500, making the R:R 1:5.',
    ratio: 5,
    additionalParams: {
      initialRisk: 100,
      scaledRisk: 500,
    },
  },
  {
    name: 'Rebalancing R:R Ratio',
    type: 'rebalancing',
    description: 'R:R is adjusted based on overall portfolio performance, balancing risk and reward across multiple trades.',
    example: 'If a portfolio has multiple trades with 1:2 R:R, the trader may take a single trade with 1:5 R:R to offset potential losses.',
    additionalParams: {
      standardRatio: 2,
      offsetRatio: 5,
    },
  },
  {
    name: 'Grid-Based R:R Ratio',
    type: 'gridBased',
    description: 'Used in grid trading, where multiple trades are placed at incremental levels, with dynamic R:R depending on the grid spacing.',
    example: 'Risking $100 per level and targeting $300 at each level, resulting in a grid-based R:R of 1:3.',
    ratio: 3,
    additionalParams: {
      gridLevels: 5,
    },
  },
  {
    name: 'Psychology-Based R:R Ratio',
    type: 'psychologyBased',
    description: 'R:R is influenced by a trader\'s emotional state or confidence in a trade.',
    example: 'A trader may use 1:1 during a losing streak to regain confidence and switch to 1:3 after regaining momentum.',
    additionalParams: {
      lowConfidenceRatio: 1,
      highConfidenceRatio: 3,
    },
  },
  {
    name: 'Algorithm-Based R:R Ratio',
    type: 'algorithmBased',
    description: 'R:R is determined by an algorithm or trading bot, dynamically adapting to conditions.',
    example: 'An algorithm calculates optimal stop-loss and target levels based on historical volatility, yielding an R:R of 1:4.',
    ratio: 4,
    additionalParams: {
      volatilityPeriod: 20,
    },
  },
]

const calculateScenarioResults = (strategy: RiskRewardStrategy, wins: number) => {
  const results = [];
  let cumulativeRisk = 0;
  let cumulativeReward = 0;

  for (let i = 1; i <= wins; i++) {
    const risk = strategy.type === 'fixed' ? 1 : (strategy.additionalParams?.riskPercentage || 1) / 100;
    let reward = risk * (strategy.ratio || 1);

    if (strategy.type === 'dynamic') {
      reward = risk * (i % 3 === 0 ? (strategy.additionalParams?.increasedRatio || 3) : (strategy.additionalParams?.baseRatio || 2));
    }

    cumulativeRisk += risk;
    cumulativeReward += reward;

    results.push({
      trade: i,
      risk,
      reward,
      cumulativeRisk,
      cumulativeReward,
    });
  }

  return results;
};

export function RiskRewardCard({ initialStrategy, onStrategyChange, className }: RiskRewardCardProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<RiskRewardStrategy | null>(initialStrategy || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRiskRewardStrategy = async () => {
      try {
        const fetchedStrategies = await getUserRiskStrategy()
        if (fetchedStrategies && fetchedStrategies.length > 0) {
          const selectedStrategy = fetchedStrategies.find(strategy => strategy.selected) || fetchedStrategies[0]
          setSelectedStrategy(selectedStrategy)
          onStrategyChange(selectedStrategy)
        }
      } catch (error) {
        console.error('Error fetching user risk-reward strategy:', error)
        toast({
          title: "Failed to fetch Risk-Reward Strategy",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (!initialStrategy) {
      fetchRiskRewardStrategy()
    } else {
      setSelectedStrategy(initialStrategy)
      setIsLoading(false)
    }
  }, [initialStrategy, onStrategyChange])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (selectedStrategy) {
        const result = await submitRiskStrategy([selectedStrategy])
        setSelectedStrategy(result[0])
        onStrategyChange(result[0])
        toast({
          title: "Risk-Reward Strategy updated",
          description: "Your risk-reward strategy has been successfully updated.",
        })
        setIsDrawerOpen(false)
      }
    } catch (error) {
      console.error('Error submitting risk-reward strategy:', error)
      toast({
        title: "Failed to update Risk-Reward Strategy",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStrategyChange = (name: string, field: string, value: string | number) => {
    setSelectedStrategy(prevStrategy => {
      if (!prevStrategy) return null
      if (field.startsWith('additionalParams.')) {
        const paramName = field.split('.')[1]
        return {
          ...prevStrategy,
          additionalParams: {
            ...prevStrategy.additionalParams,
            [paramName]: Number(value)
          }
        }
      }
      return {
        ...prevStrategy,
        [field]: field === 'ratio' ? Number(value) : value
      }
    })
  }

  if (isLoading) {
    return (
      <Card className="w-full min-w-fit max-w-[300px] overflow-hidden">
        <CardContent className="p-2">
          <div className="pl-4">
            <Skeleton className="h-4 w-24 mb-2" />
          </div>
          <div className="pl-4 pt-1 pr-4">
            <Skeleton className="h-8 w-40 mb-2" />
          </div>
          <div className="pl-4">
            <Skeleton className="h-8 w-28" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full min-w-fit max-w-[300px] overflow-hidden", className)}>
      <CardContent className="p-2">
        <div className="text-muted-foreground pl-4">
          Risk-Reward Strategy
        </div>
        <div className="text-3xl font-semibold text-left pl-4 pt-1 pr-4">
          {selectedStrategy ? selectedStrategy.name : "Not Set"}
        </div>
        {selectedStrategy?.ratio && (
          <div className="text-sm text-muted-foreground pl-4">
            R:R Ratio: 1:{selectedStrategy.ratio}
          </div>
        )}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              className="text-muted-foreground text-left pl-4"
              aria-label={selectedStrategy ? "Update Risk-Reward Strategy" : "Set Risk-Reward Strategy"}
            >
              {selectedStrategy ? "Update" : "Set Strategy"}
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
                  Set Risk-Reward Strategy
                </DrawerTitle>
                <DrawerDescription>
                  Choose or create your preferred risk-reward strategy for trading
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-hidden">
                <div className="flex h-full">
                  <ScrollArea className="flex-1 p-4 h-[calc(100vh-200px)]">
                    {predefinedStrategies.map((strategy) => (
                      <Card
                        key={strategy.name}
                        className={`mb-4 cursor-pointer ${selectedStrategy?.name === strategy.name ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => setSelectedStrategy(strategy)}
                      >
                        <CardContent className="p-4">
                          <h3 className="text-xl font-semibold mb-2">{strategy.name}</h3>
                          <p className="text-sm">{strategy.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                    {selectedStrategy && (
                      <div className="mt-6">
                        <h3 className="text-2xl font-semibold mb-4">Scenario Analysis</h3>
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-xl font-semibold mb-2">After 10 Wins</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Trade</TableHead>
                                  <TableHead>Risk</TableHead>
                                  <TableHead>Reward</TableHead>
                                  <TableHead>Cumulative Risk</TableHead>
                                  <TableHead>Cumulative Reward</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {calculateScenarioResults(selectedStrategy, 10).map((result) => (
                                  <TableRow key={`win-${result.trade}`}>
                                    <TableCell>{result.trade}</TableCell>
                                    <TableCell>{result.risk.toFixed(2)}</TableCell>
                                    <TableCell>{result.reward.toFixed(2)}</TableCell>
                                    <TableCell>{result.cumulativeRisk.toFixed(2)}</TableCell>
                                    <TableCell>{result.cumulativeReward.toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold mb-2">After 10 Losses</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Trade</TableHead>
                                  <TableHead>Risk</TableHead>
                                  <TableHead>Reward</TableHead>
                                  <TableHead>Cumulative Risk</TableHead>
                                  <TableHead>Cumulative Reward</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {calculateScenarioResults(selectedStrategy, 10).map((result) => (
                                  <TableRow key={`loss-${result.trade}`}>
                                    <TableCell>{result.trade}</TableCell>
                                    <TableCell>{result.risk.toFixed(2)}</TableCell>
                                    <TableCell>0.00</TableCell>
                                    <TableCell>{result.cumulativeRisk.toFixed(2)}</TableCell>
                                    <TableCell>0.00</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    )}
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
                            {selectedStrategy.ratio !== undefined && (
                              <div className="flex items-center space-x-4">
                                <Label htmlFor={`${selectedStrategy.name}-ratio`} className="text-lg">R:R Ratio:</Label>
                                <Input
                                  id={`${selectedStrategy.name}-ratio`}
                                  type="number"
                                  value={selectedStrategy.ratio}
                                  onChange={(e) => handleStrategyChange(selectedStrategy.name, 'ratio', e.target.value)}
                                  className="w-24 text-lg"
                                />
                              </div>
                            )}
                            {selectedStrategy.additionalParams && Object.entries(selectedStrategy.additionalParams).map(([key, value]) => (
                              <div key={key} className="flex items-center space-x-4">
                                <Label htmlFor={`${selectedStrategy.name}-${key}`} className="text-lg">{key}:</Label>
                                <Input
                                  id={`${selectedStrategy.name}-${key}`}
                                  type="number"
                                  value={value}
                                  onChange={(e) => handleStrategyChange(selectedStrategy.name, `additionalParams.${key}`, e.target.value)}
                                  className="w-24 text-lg"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DrawerFooter className="py-6">
                <Button onClick={handleSubmit} disabled={isSubmitting} className="text-lg">
                  {isSubmitting ? 'Updating...' : 'Update Risk-Reward Strategy'}
                </Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>
  )
}

