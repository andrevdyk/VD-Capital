import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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

interface TraderTypeBlockProps {
  traderType: string;
}

export function TraderTypeBlock({ traderType }: TraderTypeBlockProps) {
  const info = traderTypeInfo[traderType]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Your Trader Type: {info.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Description</h3>
          <p>{info.description}</p>
        </div>
        <Separator />
        <div>
          <h3 className="text-lg font-semibold">Characteristics</h3>
          <ul className="list-disc pl-5 space-y-1">
            {info.characteristics.map((char, index) => (
              <li key={index}>{char}</li>
            ))}
          </ul>
        </div>
        <Separator />
        <div>
          <h3 className="text-lg font-semibold">Common Strategies</h3>
          <ul className="list-disc pl-5 space-y-1">
            {info.strategies.map((strategy, index) => (
              <li key={index}>{strategy}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
