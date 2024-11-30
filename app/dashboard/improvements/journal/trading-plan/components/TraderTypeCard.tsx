import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
    title: 'Position Trader',
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

interface TraderTypeCardProps {
  traderType: string;
  onRedoQuiz: () => void;
}

export function TraderTypeCard({ traderType, onRedoQuiz }: TraderTypeCardProps) {
  const info = traderTypeInfo[traderType]

  return (
    <Card className="w-full min-w-fit max-w-[300px] overflow-hidden">
      <CardContent className="p-2">
        <div className="text-muted-foreground pl-4">You are a</div>
        <div className="text-3xl font-semibold text-left pl-4 pt-1 pr-4">{info.title}</div>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" className=" text-muted-foreground text-left pl-4">
              Learn More
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
                <DrawerTitle>{`Understanding ${info.title} Trading`}</DrawerTitle>
                <DrawerDescription>
                  Detailed information about your trading style
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="prose dark:prose-invert">
                  <h2 className="text-4xl font-bold mb-2">Description</h2>
                  <p className= "mb-4 text-2xl text-foreground">{info.description}</p>

                  <h2 className="text-4xl font-bold mb-2">Characteristics</h2>
                  <ul className= "mb-4 text-2xl text-foreground">
                    {info.characteristics.map((char, index) => (
                      <li key={index}>{char}</li>
                    ))}
                  </ul>

                  <h2 className="text-4xl font-bold mb-4">Common Strategies</h2>
                  <ul className= "mb-4 text-2xl text-foreground">
                    {info.strategies.map((strategy, index) => (
                      <li key={index}>{strategy}</li>
                    ))}
                  </ul>

                  <h2 className="text-4xl font-bold mb-4">Things to Look Out For</h2>
                  <ul className= "mb-4 text-2xl text-foreground">
                    {info.lookoutFor.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>

                  <h2 className="text-4xl font-bold mb-4">Benefits</h2>
                  <ul className= "mb-4 text-2xl text-foreground">
                    {info.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>

                  <h2 className="text-4xl font-bold mb-4">Fundamental News Focus</h2>
                  <ul className= "mb-4 text-2xl text-foreground">
                    {info.fundamentalFocus.map((focus, index) => (
                      <li key={index}>{focus}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <DrawerFooter>
                <Button onClick={onRedoQuiz} className="w-full">Retake Quiz</Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>
  )
}

