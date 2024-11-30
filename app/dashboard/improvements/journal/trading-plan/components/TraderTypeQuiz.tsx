'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { submitQuiz, getUserTraderType } from '../actions/quiz'
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TraderTypeCard } from './TraderTypeCard'

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

export function TraderTypeQuiz() {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [isCurrentCategoryComplete, setIsCurrentCategoryComplete] = useState(false)
  const [showQuiz, setShowQuiz] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTraderType = async () => {
      try {
        const traderType = await getUserTraderType()
        if (traderType) {
          setResult(traderType)
          setShowQuiz(false)
        }
      } catch (error) {
        console.error('Error fetching user trader type:', error)
      }
    }
    fetchTraderType()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await submitQuiz(answers)
      setResult(result)
      setShowQuiz(false)
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
    setResult(null)
    setCurrentCategoryIndex(0)
    setShowQuiz(true)
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

  return (
    <div className="w-full max-w-3xl mx-auto">
      {showQuiz ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
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
          </CardContent>
          <CardFooter className="flex justify-between">
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
          </CardFooter>
        </form>
      ) : (
        <CardContent className="space-y-6">
          <TraderTypeCard traderType={result || ''} onRedoQuiz={handleRedoQuiz} />
        </CardContent>
      )}
    </div>
  )
}

