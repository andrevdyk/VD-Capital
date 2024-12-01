'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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
import { submitQuiz, getUserTraderType } from '../actions/quiz'
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
// import { TradeSetupTemplate } from './TradeSetupTemplate'

interface TraderTypeInfo {
  title: string;
  description: string;
  characteristics: string[];
  strategies: string[];
  lookoutFor: string[];
  benefits: string[];
  fundamentalFocus: string[];
}

const traderTypeInfo: Record<string, TraderTypeInfo> = {
  'Scalper': {
    title: 'Scalper',
    description: 'Scalpers aim to profit from small price changes, making many trades within a single day.',
    characteristics: [
      'Very short-term trading style',
      'Requires high concentration and quick decision-making',
      'Often uses high leverage',
      'Typically closes all positions by the end of the day',
    ],
    strategies: [
      'Market making',
      'High-frequency trading',
      'News-based scalping',
      'Order flow trading',
    ],
    lookoutFor: [
      'High transaction costs due to frequent trading',
      'Emotional stress from constant market monitoring',
      'Technology failures or latency issues',
    ],
    benefits: [
      'Potential for consistent small profits',
      'Limited exposure to overnight risk',
      'Opportunity to capitalize on small market inefficiencies',
    ],
    fundamentalFocus: [
      'Economic data releases',
      'Breaking news events',
      'Market sentiment indicators',
    ],
  },
  'Day Trader': {
    title: 'Day Trader',
    description: 'Day traders open and close positions within a single trading day, avoiding overnight risk.',
    characteristics: [
      'Short-term trading style',
      'Requires dedication of full trading days',
      'Uses intraday charts and technical analysis',
      'Manages risk by not holding positions overnight',
    ],
    strategies: [
      'Trend following',
      'Breakout trading',
      'Reversal trading',
      'Gap trading',
    ],
    lookoutFor: [
      'Overtrading and increased transaction costs',
      'Emotional stress from daily profit/loss swings',
      'Missing longer-term trends',
    ],
    benefits: [
      'No overnight risk',
      'Ability to capitalize on short-term market movements',
      'Clear daily profit/loss results',
    ],
    fundamentalFocus: [
      'Company earnings reports',
      'Intraday economic data releases',
      'Sector-specific news',
    ],
  },
  'Swing Trader': {
    title: 'Swing Trader',
    description: 'Swing traders hold positions for several days to weeks, aiming to profit from expected price moves.',
    characteristics: [
      'Medium-term trading style',
      'Can be done part-time',
      'Uses a combination of technical and fundamental analysis',
      'Holds positions overnight and through weekends',
    ],
    strategies: [
      'Trend-following',
      'Counter-trend trading',
      'Breakout trading',
      'Mean reversion',
    ],
    lookoutFor: [
      'Overnight and weekend risk',
      'Sudden market reversals',
      'Missing short-term opportunities',
    ],
    benefits: [
      'Less time-intensive than day trading',
      'Potential for larger profits per trade',
      'Ability to capture longer-term trends',
    ],
    fundamentalFocus: [
      'Quarterly earnings reports',
      'Industry trends',
      'Macroeconomic indicators',
    ],
  },
  'Position Trader/Investor': {
    title: 'Position Trader/Investor',
    description: 'Position traders and investors hold positions for months to years, focusing on long-term value and trends.',
    characteristics: [
      'Long-term trading style',
      'Requires patience and strong conviction',
      'Uses fundamental analysis and long-term charts',
      'Less affected by short-term market noise',
    ],
    strategies: [
      'Value investing',
      'Growth investing',
      'Dividend investing',
      'Buy-and-hold strategy',
    ],
    lookoutFor: [
      'Opportunity cost of capital',
      'Long-term market shifts or economic changes',
      'Company-specific risks over time',
    ],
    benefits: [
      'Lower transaction costs',
      'Potential for significant long-term gains',
      'Less time-intensive monitoring required',
    ],
    fundamentalFocus: [
      'Company financial statements',
      'Long-term economic trends',
      'Geopolitical events',
    ],
  },
}

const questions = [
  {
    category: 'Time Availability',
    questions: [
      {
        question: 'How many hours per week can you dedicate to trading and market research?',
        options: ['Less than 5 hours', '5–10 hours', '10–20 hours', 'More than 20 hours'],
      },
      {
        question: 'What is the longest uninterrupted time you can spend looking at charts or researching in a day?',
        options: ['Less than 1 hour', '1–2 hours', '2–4 hours', 'More than 4 hours'],
      },
    ],
  },
  {
    category: 'Work and Life Commitments',
    questions: [
      {
        question: 'Do you have a full-time job or other time-intensive commitments?',
        options: ['Yes, I have a full-time job.', 'No, I\'m flexible.', 'I work part-time or have other moderate responsibilities.'],
      },
      {
        question: 'Do you have kids or other caregiving responsibilities?',
        options: ['Yes, significant caregiving duties.', 'Yes, but minimal responsibilities.', 'No, I\'m relatively free.'],
      },
    ],
  },
  {
    category: 'Risk Tolerance',
    questions: [
      {
        question: 'How do you feel about holding trades overnight or over the weekend?',
        options: ['I\'m uncomfortable with overnight positions.', 'I\'m okay with overnight trades but not over weekends.', 'I\'m fine holding positions for days or weeks.'],
      },
      {
        question: 'How would you react to a 10% loss on your trading account?',
        options: ['I\'d be very upset and cautious.', 'I\'d accept it but adjust my strategy.', 'I\'d analyze and continue without much concern.'],
      },
    ],
  },
  {
    category: 'Trading Knowledge and Experience',
    questions: [
      {
        question: 'How familiar are you with technical and fundamental analysis?',
        options: ['Beginner: I know little or nothing.', 'Intermediate: I understand the basics.', 'Advanced: I can analyze markets confidently.'],
      },
      {
        question: 'Have you traded live or with a demo account before?',
        options: ['No, I\'m completely new.', 'Yes, I\'ve used a demo account.', 'Yes, I\'ve traded live.'],
      },
    ],
  },
  {
    category: 'Trading Goals',
    questions: [
      {
        question: 'What is your primary goal in trading?',
        options: ['To earn extra income.', 'To build long-term wealth.', 'To make a living trading full-time.', 'To gain market knowledge and experience.'],
      },
    ],
  },
  {
    category: 'Stress Management and Decision Making',
    questions: [
      {
        question: 'How do you handle stress in fast-paced situations?',
        options: ['I find it very difficult.', 'I manage okay with some stress.', 'I thrive in high-pressure environments.'],
      },
      {
        question: 'Do you prefer making decisions quickly or taking time to analyze?',
        options: ['Quick decisions.', 'Balanced approach.', 'Thorough analysis before acting.'],
      },
    ],
  },
]

interface TraderTypeCardProps {
  initialTraderType: string | null;
  onTraderTypeChange: (traderType: string | null) => void;
}

export function TraderTypeCard({ initialTraderType, onTraderTypeChange }: TraderTypeCardProps) {
  const [traderType, setTraderType] = useState<string | null>(initialTraderType)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [isCurrentCategoryComplete, setIsCurrentCategoryComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTraderType = async () => {
      try {
        const fetchedTraderType = await getUserTraderType()
        setTraderType(fetchedTraderType)
        onTraderTypeChange(fetchedTraderType)
      } catch (error) {
        console.error('Error fetching user trader type:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!initialTraderType) {
      fetchTraderType()
    } else {
      setIsLoading(false)
    }
  }, [initialTraderType, onTraderTypeChange])

  const info = traderType ? traderTypeInfo[traderType] : null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await submitQuiz(answers)
      setTraderType(result)
      onTraderTypeChange(result)
      toast({
        title: "Quiz submitted successfully!",
        description: "Your trader type has been determined.",
      })
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
    setTraderType(null)
    onTraderTypeChange(null)
    setCurrentCategoryIndex(0)
  }

  useEffect(() => {
    const currentCategory = questions[currentCategoryIndex]
    const isComplete = currentCategory.questions.every((_, index) => 
      answers[`${currentCategoryIndex}-${index}`] !== undefined
    )
    setIsCurrentCategoryComplete(isComplete)
  }, [answers, currentCategoryIndex])

  const isQuizComplete = Object.keys(answers).length === questions.reduce((sum, category) => sum + category.questions.length, 0)

  const currentCategory = questions[currentCategoryIndex]

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
    <Card className="w-full min-w-fit max-w-[300px] overflow-hidden">
      <CardContent className="p-2">
        <div className="text-muted-foreground pl-4">
          {traderType ? "You are a" : "Trader Type Quiz"}
        </div>
        <div className="text-3xl font-semibold text-left pl-4 pt-1 pr-4">
          {traderType ? info?.title : "Start Quiz"}
        </div>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" className="text-muted-foreground text-left pl-4">
              {traderType ? "Learn More" : "Take Quiz"}
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
                  {traderType ? `Understanding ${info?.title} Trading` : "Trader Type Quiz"}
                </DrawerTitle>
                <DrawerDescription>
                  {traderType ? "Detailed information about your trading style" : "Determine your trading style and get personalized strategies"}
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto p-4">
                {traderType ? (
                  <div className="prose dark:prose-invert">
                    <h2 className="text-4xl font-bold mb-2">Description</h2>
                    <p className="mb-4 text-2xl text-foreground">{info?.description}</p>

                    <h2 className="text-4xl font-bold mb-2">Characteristics</h2>
                    <ul className="mb-4 text-2xl text-foreground">
                      {info?.characteristics.map((char, index) => (
                        <li key={index}>{char}</li>
                      ))}
                    </ul>

                    <h2 className="text-4xl font-bold mb-4">Common Strategies</h2>
                    <ul className="mb-4 text-2xl text-foreground">
                      {info?.strategies.map((strategy, index) => (
                        <li key={index}>{strategy}</li>
                      ))}
                    </ul>

                    <h2 className="text-4xl font-bold mb-4">Things to Look Out For</h2>
                    <ul className="mb-4 text-2xl text-foreground">
                      {info?.lookoutFor.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>

                    <h2 className="text-4xl font-bold mb-4">Benefits</h2>
                    <ul className="mb-4 text-2xl text-foreground">
                      {info?.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>

                    <h2 className="text-4xl font-bold mb-4">Fundamental News Focus</h2>
                    <ul className="mb-4 text-2xl text-foreground">
                      {info?.fundamentalFocus.map((focus, index) => (
                        <li key={index}>{focus}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-2xl">{currentCategory.category}</h3>
                        {currentCategory.questions.map((q, qIndex) => (
                          <div key={q.question} className="space-y-2">
                            <Label htmlFor={`${currentCategoryIndex}-${qIndex}`} className="text-xl">{q.question}</Label>
                            <RadioGroup
                              onValueChange={(value) => setAnswers(prev => ({ ...prev, [`${currentCategoryIndex}-${qIndex}`]: parseInt(value) }))}
                              value={answers[`${currentCategoryIndex}-${qIndex}`]?.toString()}
                              className="flex flex-col space-y-1"
                            >
                              {q.options.map((option, index) => (
                                <div key={option} className="flex items-center space-x-2">
                                  <RadioGroupItem value={index.toString()} id={`${currentCategoryIndex}-${qIndex}-${index}`} />
                                  <Label htmlFor={`${currentCategoryIndex}-${qIndex}-${index}`} className="text-lg">{option}</Label>
                                </div>
                              ))}
                            </RadioGroup>
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
                )}
              </div>
              <DrawerFooter>
                {traderType && (
                  <Button onClick={handleRedoQuiz} className="w-full">Retake Quiz</Button>
                )}
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>
  )
}

