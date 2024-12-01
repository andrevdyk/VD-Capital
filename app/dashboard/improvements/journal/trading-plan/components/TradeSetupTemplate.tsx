import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { ChevronDown, Bold, Italic, Underline } from 'lucide-react'
import { Input } from "@/components/ui/input"

interface TradeSetupTemplateProps {
  traderType: string
}

interface DropdownItem {
  category: string;
  items: string[];
}

const dropdownItems: DropdownItem[] = [
  {
    category: 'Indicators',
    items: ['Moving Average', 'RSI', 'MACD', 'Bollinger Bands', 'Stochastic Oscillator'],
  },
  {
    category: 'Patterns',
    items: ['Head and Shoulders', 'Double Top', 'Double Bottom', 'Triangle', 'Flag'],
  },
  {
    category: 'Profiles',
    items: ['Volume Profile', 'Market Profile', 'Order Flow'],
  },
  {
    category: 'Fundamentals',
    items: ['Economic Calendar', 'Interest Rates', 'GDP', 'Unemployment Rate', 'Inflation'],
  },
]

const getTagColor = (tag: string): string => {
  if (dropdownItems[0].items.includes(tag)) return 'bg-blue-500'
  if (dropdownItems[1].items.includes(tag)) return 'bg-green-500'
  if (dropdownItems[2].items.includes(tag)) return 'bg-red-500'
  if (dropdownItems[3].items.includes(tag)) return 'bg-purple-500'
  return 'bg-primary'
}

const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px']
const fontOptions = [
  { value: 'font-sans', label: 'Sans Serif' },
  { value: 'font-serif', label: 'Serif' },
  { value: 'font-mono', label: 'Monospace' },
]

export function TradeSetupTemplate({ traderType }: TradeSetupTemplateProps) {
  const [setupName, setSetupName] = useState('')
  const [setupText, setSetupText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [fontSize, setFontSize] = useState('16px')
  const [fontFamily, setFontFamily] = useState('font-sans')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const textareaRef = useRef<HTMLDivElement>(null)

  const templates = {
    'Scalper': `Trade Setup for Scalper:

1. Indicators:
 - Example: 1-minute chart with 5 and 10 period EMAs
 - [Your indicators here]

2. Fundamentals:
 - Example: Monitor economic calendar for high-impact news
 - [Your fundamental analysis approach]

3. Entry Rules:
 - Example: Enter long when price crosses above 10 EMA with increasing volume
 - [Your entry rules]

4. Exit Rules:
 - Example: Exit when price touches 5 EMA or 1:1 risk-reward ratio is reached
 - [Your exit rules]

5. Patterns:
 - Example: Look for bullish engulfing patterns on 1-minute chart
 - [Patterns you look for]

Example Trade:
Currency Pair: EUR/USD
Entry: Buy at 1.1850 when price crosses above 10 EMA with increased volume
Stop Loss: 1.1845 (5 pips)
Take Profit: 1.1855 (5 pips, 1:1 risk-reward)
Result: Price moved to 1.1855, take profit hit for 5 pip gain`,

    'Day Trader': `Trade Setup for Day Trader:

1. Indicators:
 - Example: 15-minute chart with 20 and 50 period SMAs, RSI
 - [Your indicators here]

2. Fundamentals:
 - Example: Review pre-market movers and sector news
 - [Your fundamental analysis approach]

3. Entry Rules:
 - Example: Enter long when price breaks above previous day's high with RSI above 50
 - [Your entry rules]

4. Exit Rules:
 - Example: Exit half position at 1:1 risk-reward, move stop to breakeven
 - [Your exit rules]

5. Patterns:
 - Example: Look for bull flag patterns on 15-minute chart
 - [Patterns you look for]

Example Trade:
Stock: AAPL
Entry: Buy at $150.50 on breakout above previous day's high
Stop Loss: $149.50 (1% risk)
Take Profit: Partial at $151.50, rest at end of day
Result: Price moved to $152.00, exited for 1% gain`,

    'Swing Trader': `Trade Setup for Swing Trader:

1. Indicators:
 - Example: Daily chart with 50 and 200 day EMAs, MACD
 - [Your indicators here]

2. Fundamentals:
 - Example: Analyze quarterly earnings reports and industry trends
 - [Your fundamental analysis approach]

3. Entry Rules:
 - Example: Enter long when price is above 200 EMA and MACD crosses above signal line
 - [Your entry rules]

4. Exit Rules:
 - Example: Exit when price closes below 50 EMA or target is reached
 - [Your exit rules]

5. Patterns:
 - Example: Look for cup and handle patterns on daily chart
 - [Patterns you look for]

Example Trade:
Stock: TSLA
Entry: Buy at $700 when MACD crosses above signal line
Stop Loss: $665 (5% risk)
Take Profit: $770 (10% gain, 1:2 risk-reward)
Result: Price reached $770 after 2 weeks, exited for 10% gain`,

    'Position Trader/Investor': `Trade Setup for Position Trader/Investor:

1. Indicators:
 - Example: Weekly chart with 50 and 200 week EMAs, Relative Strength Index (RSI)
 - [Your indicators here]

2. Fundamentals:
 - Example: Analyze company financials, competitive advantage, and long-term industry trends
 - [Your fundamental analysis approach]

3. Entry Rules:
 - Example: Enter when stock is undervalued based on P/E ratio and has strong growth prospects
 - [Your entry rules]

4. Exit Rules:
 - Example: Exit when investment thesis is no longer valid or better opportunities arise
 - [Your exit rules]

5. Patterns:
 - Example: Look for long-term trend reversals or breakouts from multi-year consolidation
 - [Patterns you look for]

Example Trade:
Stock: AMZN
Entry: Buy at $3000 based on strong e-commerce growth and cloud computing dominance
Stop Loss: No hard stop, reevaluate if drops below 200 week EMA
Take Profit: Hold for long-term growth, reassess annually
Result: After 2 years, price reached $3600, continuing to hold based on strong fundamentals`
  }

  useEffect(() => {
    if (textareaRef.current) {
      const selection = window.getSelection();
      let range = selection?.rangeCount ? selection.getRangeAt(0) : null;

      if (textareaRef.current.innerHTML !== setupText) {
        textareaRef.current.innerHTML = setupText;

        if (selection && range) {
          try {
            range = document.createRange();
            range.selectNodeContents(textareaRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (error) {
            console.error('Error setting selection:', error);
          }
        }
      }
    }
  }, [setupText]);

  const handleItemClick = (item: string) => {
    if (textareaRef.current) {
      const selection = window.getSelection()
      const range = selection?.getRangeAt(0)
      if (range) {
        const tagColor = getTagColor(item)
        const span = document.createElement('span')
        span.className = `${tagColor} text-white px-1 rounded inline-block cursor-pointer`
        span.textContent = item
        span.contentEditable = 'false'
        span.addEventListener('click', () => removeTag(item))
        range.deleteContents()
        range.insertNode(span)
        range.collapse(false)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
      setTags([...tags, item])
      setSetupText(textareaRef.current.innerHTML)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
    if (textareaRef.current) {
      const spans = textareaRef.current.getElementsByTagName('span')
      for (let i = spans.length - 1; i >= 0; i--) {
        if (spans[i].textContent === tagToRemove) {
          spans[i].remove()
        }
      }
      setSetupText(textareaRef.current.innerHTML)
    }
  }

  const applyTextFormatting = useCallback((format: 'bold' | 'italic' | 'underline') => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      document.execCommand(format, false, undefined)
      setSetupText(textareaRef.current.innerHTML)
    }

    switch (format) {
      case 'bold':
        setIsBold(prev => !prev)
        break
      case 'italic':
        setIsItalic(prev => !prev)
        break
      case 'underline':
        setIsUnderline(prev => !prev)
        break
    }
  }, [])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    setSetupText(content);
    e.currentTarget.className = e.currentTarget.className.replace(/font-(sans|serif|mono)/g, fontFamily);
  };

  const applyActiveFormatting = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range && range.collapsed) {
        const span = document.createElement('span');
        if (isBold) span.style.fontWeight = 'bold';
        if (isItalic) span.style.fontStyle = 'italic';
        if (isUnderline) span.style.textDecoration = 'underline';
        span.appendChild(document.createTextNode('\u200B')); // Zero-width space
        range.insertNode(span);
        range.setStart(span.firstChild!, 1);
        range.setEnd(span.firstChild!, 1);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      const applyActiveFormatting = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (range && range.collapsed) {
            const span = document.createElement('span');
            if (isBold) span.style.fontWeight = 'bold';
            if (isItalic) span.style.fontStyle = 'italic';
            if (isUnderline) span.style.textDecoration = 'underline';
            span.appendChild(document.createTextNode('\u200B')); // Zero-width space
            range.insertNode(span);
            range.setStart(span.firstChild!, 1);
            range.setEnd(span.firstChild!, 1);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      };

      textareaRef.current.addEventListener('focus', applyActiveFormatting)
      return () => {
        textareaRef.current?.removeEventListener('focus', applyActiveFormatting)
      }
    }
  }, [isBold, isItalic, isUnderline])

  return (
    <Card className="w-half ml-auto">
      <CardHeader>
        <Input
          type="text"
          placeholder="Setup name..."
          value={setupName}
          onChange={(e) => setSetupName(e.target.value)}
          className="text-2xl font-bold"
        />
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          {dropdownItems.map((dropdown) => (
            <DropdownMenu key={dropdown.category}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {dropdown.category} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {dropdown.items.map((item) => (
                  <DropdownMenuItem key={item} onSelect={() => handleItemClick(item)}>
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <ToggleGroup type="multiple" variant="outline">
            <ToggleGroupItem 
              value="bold" 
              aria-label="Toggle bold" 
              onClick={() => applyTextFormatting('bold')}
              data-state={isBold ? "on" : "off"}
            >
              <Bold className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="italic" 
              aria-label="Toggle italic" 
              onClick={() => applyTextFormatting('italic')}
              data-state={isItalic ? "on" : "off"}
            >
              <Italic className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="underline" 
              aria-label="Toggle underline" 
              onClick={() => applyTextFormatting('underline')}
              data-state={isUnderline ? "on" : "off"}
            >
              <Underline className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={fontFamily} onValueChange={(value) => {
            setFontFamily(value);
            if (textareaRef.current) {
              textareaRef.current.className = textareaRef.current.className.replace(/font-(sans|serif|mono)/g, value);
            }
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Font size" />
            </SelectTrigger>
            <SelectContent>
              {fontSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <div
            ref={textareaRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className={`min-h-[500px] text-sm pt-10 p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-white whitespace-pre-wrap [&_span]:user-select-none ${fontFamily}`}
            style={{ fontSize }}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => {
              setSetupText(templates[traderType as keyof typeof templates])
              setTags([])
            }}
          >
            Reset to Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

