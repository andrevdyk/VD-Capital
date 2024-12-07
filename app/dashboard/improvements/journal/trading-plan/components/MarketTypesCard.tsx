'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { submitMarketQuiz, getUserMarkets } from '../actions/market-quiz'
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { TimezoneSelect } from './TimezoneSelect'

type Question = {
  question: string;
  type: 'timezone' | 'checkbox' | 'radio';
  options?: string[];
};

type Category = {
  category: string;
  questions: Question[];
};

interface MarketInfo {
  name: string;
  description: string;
  tradingHours: string;
  keyCharacteristics: string[];
}

const marketInfo: Record<string, MarketInfo> = {
  'Forex': {
    name: 'Forex',
    description: 'The foreign exchange market where currencies are traded.',
    tradingHours: '24 hours a day, 5 days a week',
    keyCharacteristics: [
      'High liquidity',
      'Low transaction costs',
      'Leverage available',
      'Decentralized market',
    ],
  },
  'Stocks': {
    name: 'Stocks',
    description: 'Equity markets where shares of publicly traded companies are bought and sold.',
    tradingHours: 'Varies by exchange, typically business hours',
    keyCharacteristics: [
      'Ownership in companies',
      'Dividends possible',
      'Affected by company performance',
      'Regulated exchanges',
    ],
  },
  'Cryptocurrencies': {
    name: 'Cryptocurrencies',
    description: 'Digital or virtual currencies secured by cryptography.',
    tradingHours: '24/7 trading',
    keyCharacteristics: [
      'High volatility',
      'Decentralized',
      'Blockchain technology',
      'Emerging market',
    ],
  },
  'Commodities': {
    name: 'Commodities',
    description: 'Markets for raw materials or primary agricultural products.',
    tradingHours: 'Varies by commodity and exchange',
    keyCharacteristics: [
      'Tangible assets',
      'Affected by supply and demand',
      'Hedge against inflation',
      'Futures contracts common',
    ],
  },
  'Indices': {
    name: 'Indices',
    description: 'Stock market indices that measure the performance of a group of stocks.',
    tradingHours: 'Varies by index, typically follows stock market hours',
    keyCharacteristics: [
      'Represent overall market performance',
      'Can be traded through futures or ETFs',
      'Affected by economic indicators',
      'Popular for diversification',
    ],
  },
}

const questions: Category[] = [
  {
    category: 'Trading Availability',
    questions: [
      {
        question: 'What is your timezone?',
        type: 'timezone',
      },
      {
        question: 'What times of day are you typically available for trading?',
        options: ['Early morning', 'Daytime', 'Evening', 'Late night', 'Flexible/Any time'],
        type: 'checkbox',
      },
      {
        question: 'Which days of the week can you dedicate to trading?',
        options: ['Weekdays', 'Weekends', 'Any day'],
        type: 'checkbox',
      },
    ],
  },
  {
    category: 'Market Interests',
    questions: [
      {
        question: 'Which markets are you most interested in trading?',
        options: ['Forex', 'Stocks', 'Cryptocurrencies', 'Commodities', 'Indices'],
        type: 'checkbox',
      },
    ],
  },
]

interface MarketTypesCardProps {
  initialMarkets?: string[] | null;
  onMarketChange: (markets: string[] | null) => void;
}

export function MarketTypesCard({ initialMarkets, onMarketChange }: MarketTypesCardProps) {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(initialMarkets || [])
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [isCurrentCategoryComplete, setIsCurrentCategoryComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [timezoneSuggestions, setTimezoneSuggestions] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false) // Added state for drawer
  const [showQuiz, setShowQuiz] = useState(!selectedMarkets.length) // Added state variable
  const { toast } = useToast()

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const fetchedMarkets = await getUserMarkets()
        const markets = Array.isArray(fetchedMarkets?.markets) ? Array.from(new Set(fetchedMarkets.markets)) : []
        setSelectedMarkets(markets)
        onMarketChange(markets)
      } catch (error) {
        console.error('Error fetching user markets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!initialMarkets) {
      fetchMarkets()
    } else {
      const markets = Array.isArray(initialMarkets) ? Array.from(new Set(initialMarkets)) : []
      setSelectedMarkets(markets)
      onMarketChange(markets)
      setIsLoading(false)
    }
  }, [initialMarkets, onMarketChange])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const selectedMarkets = answers['Which markets are you most interested in trading?'] || []
      const timezone = answers['What is your timezone?']?.[0] || 'GMT'
      const result = await submitMarketQuiz({ selectedMarkets, timezone })
      setSelectedMarkets(result.markets)
      onMarketChange(result.markets)
      toast({
        title: "Quiz submitted successfully!",
        description: "Your preferred markets have been determined.",
      })
      displayTimezoneSuggestions(result.timezone, result.markets)
      setShowQuiz(false) // Set showQuiz to false after successful submission
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast({
        title: "Failed to submit quiz",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentCategoryIndex < questions.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1)
    }
  }

  const handleRedoQuiz = () => {
    setAnswers({})
    setSelectedMarkets([])
    setCurrentCategoryIndex(0)
    onMarketChange(null)
    setTimezoneSuggestions(null)
    setShowQuiz(true) // Added to show the quiz after retaking
  }

  useEffect(() => {
    const currentCategory = questions[currentCategoryIndex]
    const isComplete = currentCategory.questions.every((q) => 
      answers[q.question] && answers[q.question].length > 0
    )
    setIsCurrentCategoryComplete(isComplete)
  }, [answers, currentCategoryIndex])

  const isQuizComplete = Object.keys(answers).length === questions.reduce((sum, category) => sum + category.questions.length, 0)

  const currentCategory = questions[currentCategoryIndex]

  const displayTimezoneSuggestions = (timezone: string, markets: string[]) => {
    let suggestion = `Based on your timezone (${timezone}), here are some suggestions for optimal trading hours:\n\n`

    if (markets.includes('Forex') || markets.includes('Indices')) {
      switch (timezone) {
        case 'GMT':
        case 'EST':
          suggestion += "- You're well-positioned for the London and New York market openings. Consider trading during 8:00-11:00 GMT for maximum movement in European markets, and 13:30-16:30 GMT for US markets.\n"
          break
        case 'CST':
        case 'PST':
          suggestion += "- You may want to focus on the New York market opening and the Asian market. Consider trading during 8:30-11:30 CST for US markets, and 19:00-22:00 CST for Asian market openings.\n"
          break
        case 'AEST':
        case 'JST':
          suggestion += "- You're ideally positioned for the Asian and early European market hours. Consider trading during 9:00-12:00 JST for maximum movement in Asian markets, and 16:00-19:00 JST for European market openings.\n"
          break
        default:
          suggestion += "- Consider aligning your trading hours with major market openings: London (8:00 GMT), New York (13:30 GMT), Tokyo (0:00 GMT), and Sydney (22:00 GMT).\n"
      }
    }

    if (markets.includes('Cryptocurrencies')) {
      suggestion += "- Cryptocurrency markets are open 24/7, but you may observe higher volatility during US and European waking hours.\n"
    }

    if (markets.includes('Commodities')) {
      suggestion += "- For commodities, consider aligning your trading with the opening of major exchanges like the Chicago Mercantile Exchange (CME) or the London Metal Exchange (LME).\n"
    }

    setTimezoneSuggestions(suggestion)
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
    <Card className="w-full min-w-fit max-w-[300px] overflow-hidden cursor-default">
      <CardContent className="p-2">
        <div className="text-muted-foreground pl-4">
          {selectedMarkets.length > 0 ? "Your Markets" : "Market Types Quiz"}
        </div>
        <div className="text-3xl font-semibold text-left pl-4 pt-1 pr-4">
          {selectedMarkets.length > 0 ? Array.from(new Set(selectedMarkets)).join(', ') : "Start Quiz"}
        </div>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}> {/* Updated Drawer component */}
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              className="text-muted-foreground text-left pl-4"
              onClick={() => { setIsDrawerOpen(true); setShowQuiz(!selectedMarkets.length); }}
            >
              {selectedMarkets.length > 0 ? (showQuiz ? "View Markets" : "Learn More") : "Take Quiz"}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-full">
            <div className="mx-auto w-full max-w-4xl h-full flex flex-col">
              <DrawerHeader className="relative">
                <DrawerClose asChild>
                  <X
                    className="absolute top-2 right-2 cursor-pointer"
                    size={24}
                  />
                </DrawerClose>
                <DrawerTitle>
                  {selectedMarkets.length > 0 ? `Understanding Your Markets` : "Market Types Quiz"}
                </DrawerTitle>
                <DrawerDescription>
                  {selectedMarkets.length > 0 ? "Detailed information about your selected markets" : "Determine which markets suit your trading style and availability"}
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto p-4">
                {showQuiz ? (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-2xl">{currentCategory.category}</h3>
                        {currentCategory.questions.map((q) => (
                          <div key={q.question} className="space-y-2">
                            <Label className="text-xl">{q.question}</Label>
                            <div className="space-y-2">
                              {q.type === 'timezone' ? (
                                <TimezoneSelect
                                  value={answers[q.question]?.[0]}
                                  onChange={(value) => {
                                    setAnswers(prev => ({
                                      ...prev,
                                      [q.question]: [value]
                                    }))
                                  }}
                                />
                              ) : q.type === 'checkbox' && q.options ? (
                                <div className="space-y-2">
                                  {q.options.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${q.question}-${option}`}
                                        checked={answers[q.question]?.includes(option)}
                                        onCheckedChange={(checked) => {
                                          setAnswers(prev => {
                                            const newAnswers = { ...prev }
                                            if (!newAnswers[q.question]) {
                                              newAnswers[q.question] = []
                                            }
                                            if (checked) {
                                              newAnswers[q.question].push(option)
                                            } else {
                                              newAnswers[q.question] = newAnswers[q.question].filter(item => item !== option)
                                            }
                                            return newAnswers
                                          })
                                        }}
                                      />
                                      <Label htmlFor={`${q.question}-${option}`} className="text-lg">{option}</Label>
                                    </div>
                                  ))}
                                </div>
                              ) : q.options ? (
                                <RadioGroup
                                  onValueChange={(value) => {
                                    setAnswers(prev => ({
                                      ...prev,
                                      [q.question]: [value]
                                    }))
                                  }}
                                  value={answers[q.question]?.[0]}
                                >
                                  {q.options.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option} id={`${q.question}-${option}`} />
                                      <Label htmlFor={`${q.question}-${option}`} className="text-lg">{option}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between mt-6">
                      <Button type="button" onClick={handlePrevious} disabled={currentCategoryIndex === 0}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                      </Button>
                      {currentCategoryIndex === questions.length - 1 ? (
                        <Button type="submit" disabled={isSubmitting || !isQuizComplete}>
                          {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                      ) : (
                        <Button type="button" onClick={handleNext} disabled={!isCurrentCategoryComplete}>
                          Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="prose dark:prose-invert">
                    {selectedMarkets.map((market) => {
                      const info = marketInfo[market as keyof typeof marketInfo]
                      return (
                        <div key={market} className="mb-8">
                          <h2 className="text-4xl font-bold mb-2">{info.name}</h2>
                          <p className="mb-4 text-2xl text-foreground">{info.description}</p>
                          <h3 className="text-3xl font-bold mb-2">Trading Hours</h3>
                          <p className="mb-4 text-xl text-foreground">{info.tradingHours}</p>
                          <h3 className="text-3xl font-bold mb-2">Key Characteristics</h3>
                          <ul className="mb-4 text-xl text-foreground">
                            {info.keyCharacteristics.map((char, index) => (
                              <li key={index}>{char}</li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <DrawerFooter>
                {selectedMarkets.length > 0 && (
                  <Button onClick={() => { handleRedoQuiz(); setShowQuiz(true); }} className="w-full">Retake Quiz</Button>
                )}
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
        {timezoneSuggestions && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Trading Hour Suggestions</h3>
            <p className="whitespace-pre-line">{timezoneSuggestions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

