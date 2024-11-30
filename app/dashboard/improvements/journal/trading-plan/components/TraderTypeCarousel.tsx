'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TraderTypeInfo {
  title: string;
  description: string;
  characteristics: string[];
  strategies: string[];
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
  },
}

interface TraderTypeCarouselProps {
  traderType: string;
}

export function TraderTypeCarousel({ traderType }: TraderTypeCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const info = traderTypeInfo[traderType]

  const slides = [
    {content: (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">{info.title}</h3>
        <p className="text-lg">{info.description}</p>
      </div>
    )},
    { title: 'Characteristics', content: (
      <ul className="list-disc pl-6 space-y-2">
        {info.characteristics.map((char, index) => (
          <li key={index} className="text-lg">{char}</li>
        ))}
      </ul>
    )},
    { title: 'Common Strategies', content: (
      <ul className="list-disc pl-6 space-y-2">
        {info.strategies.map((strategy, index) => (
          <li key={index} className="text-lg">{strategy}</li>
        ))}
      </ul>
    )},
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">{slides[currentSlide].title}</h2>
        <div className="min-h-[200px]">
          {slides[currentSlide].content}
        </div>
        <div className="flex justify-between mt-6">
          <Button onClick={prevSlide} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={nextSlide} variant="outline">
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

