import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
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
import { ChevronDown, Bold, Italic, Underline, Plus, Save } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { tradeSetupTemplates } from '../utils/tradeSetupTemplates';
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { saveSetup } from '../actions/save-setup'
import { useToast } from "@/components/ui/use-toast"
import { UserSetup } from '@/types/user';


interface DropdownItem {
  category: string;
  items: { [key: string]: string[] };
}

interface TradeSetupTemplateProps {
  onSetupSaved: () => void;
  setupToEdit: UserSetup | null;
}

const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px']
const fontOptions = [
  { value: 'font-sans', label: 'Sans Serif' },
  { value: 'font-serif', label: 'Serif' },
  { value: 'font-mono', label: 'Monospace' },
]


export default function TradeSetupTemplate({ onSetupSaved, setupToEdit }: TradeSetupTemplateProps) {
  const [setupName, setSetupName] = useState('')
  const [setupText, setSetupText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [fontSize, setFontSize] = useState('16px')
  const [fontFamily, setFontFamily] = useState('font-sans')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const textareaRef = useRef<HTMLDivElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIndicatorCategory, setNewIndicatorCategory] = useState('');
  const [newIndicatorSubCategory, setNewIndicatorSubCategory] = useState('');
  const [newIndicatorName, setNewIndicatorName] = useState('');
  const [dropdownItems, setDropdownItems] = useState<DropdownItem[]>([
    {
      category: 'Indicators',
      items: {
        'Trend Indicators': [
          'Moving Averages (SMA, EMA, WMA)', 'Parabolic SAR', 'Average Directional Index (ADX)', 
          'Ichimoku Cloud', 'Moving Average Convergence Divergence (MACD)', 'Aroon Indicator', 'Trendlines'
        ],
        'Momentum Indicators': [
          'Relative Strength Index (RSI)', 'Stochastic Oscillator', 'Rate of Change (ROC)', 
          'Williams %R', 'Momentum Indicator', 'Commodity Channel Index (CCI)'
        ],
        'Volatility Indicators': [
          'Bollinger Bands', 'Average True Range (ATR)', 'Keltner Channels', 
          'Donchian Channels', 'Chaikin Volatility'
        ],
        'Volume Indicators': [
          'On-Balance Volume (OBV)', 'Chaikin Money Flow (CMF)', 'Accumulation/Distribution Line (A/D Line)', 
          'Money Flow Index (MFI)', 'Volume Weighted Average Price (VWAP)', 'Volume Oscillator'
        ],
        'Price Oscillators': [
          'MACD Histogram', 'Percentage Price Oscillator (PPO)', 'Detrended Price Oscillator (DPO)'
        ],
        'Support and Resistance Tools': [
          'Fibonacci Retracement', 'Pivot Points', 'Gann Levels', 'Horizontal Support/Resistance Lines'
        ],
        'Custom and Advanced Indicators': [
          'Relative Vigor Index (RVI)', 'Elder\'s Force Index', 'Trix Indicator', 
          'Connors RSI', 'Chande Momentum Oscillator', 'Ultimate Oscillator'
        ],
        'Composite Indicators': [
          'Vortex Indicator', 'True Strength Index (TSI)', 'Klinger Oscillator', 'Balance of Power (BOP)'
        ],
      },
    },
    {
      category: 'Fundamentals',
      items: {
        'Economic Indicators': [
          'Economic Calendar', 'Interest Rates', 'GDP', 'Unemployment Rate', 'Inflation'
        ],
        'Company-Specific': [
          'Company Earnings', 'Financial Statements', 'Dividend Yield', 'P/E Ratio', 'Market Cap'
        ],
        'Market Sentiment': [
          'Market Sentiment Indicators', 'Analyst Ratings', 'Insider Trading', 'Short Interest'
        ],
        'Global Factors': [
          'Geopolitical Events', 'Sector Analysis', 'Supply and Demand', 'Commodity Prices'
        ],
      },
    },
    {
      category: 'Profiles',
      items: {
        'Market Structure': [
          'Volume Profile', 'Market Profile', 'Order Flow', 'Footprint Charts', 'Delta Volume', 'Time and Sales'
        ],
      },
    },
    {
      category: 'Patterns',
      items: {
        'Reversal Patterns': [
          'Bullish Reversal Patterns',
          'Head and Shoulders (Inverted)',
          'Double Bottom',
          'Triple Bottom',
          'Falling Wedge',
          'Bullish Engulfing Pattern',
          'Piercing Line',
          'Morning Star',
          'Bearish Reversal Patterns',
          'Head and Shoulders',
          'Double Top',
          'Triple Top',
          'Rising Wedge',
          'Bearish Engulfing Pattern',
          'Dark Cloud Cover',
          'Evening Star',
        ],
        'Continuation Patterns': [
          'Bullish Continuation Patterns',
          'Bullish Flag',
          'Bullish Pennant',
          'Ascending Triangle',
          'Bearish Continuation Patterns',
          'Bearish Flag',
          'Bearish Pennant',
          'Descending Triangle',
        ],
        'Neutral Patterns': [
          'Symmetrical Triangle',
          'Rectangle',
          'Diamond',
        ],
        'Candlestick Patterns': [
          'Single Candlestick Patterns',
          'Hammer (Bullish)',
          'Hanging Man (Bearish)',
          'Doji',
          'Spinning Top',
          'Marubozu',
          'Multiple Candlestick Patterns',
          'Bullish/Bearish Engulfing',
          'Morning/Evening Star',
          'Harami (Bullish/Bearish)',
          'Three White Soldiers (Bullish)',
          'Three Black Crows (Bearish)',
          'Rising/Falling Three Methods',
        ],
        'Exotic Patterns': [
          'Broadening Wedges',
          'Cup and Handle (Bullish)',
          'Inverse Cup and Handle (Bearish)',
          'Diamond Top/Bottom',
          'Bump and Run Reversal',
          'Rounded Bottom (Saucer)',
        ],
      },
    },
    {
      category: 'Other',
      items: {
        'Advanced Concepts': [
          'Accumulation, Manipulation, and Distribution',
          'Buy Side Imbalance, Sell Side Inefficiency',
          'Sell Side Imbalance, Buy Side Inefficiency',
          'Balanced Price Range',
          'Buy Side Liquidity',
          'Sell Side Liquidity',
          'Break-Even',
          'Break of Structure',
          'Consequent Encroachment',
          'Fair Value Gap',
          'Inversion Fair Value Gap',
          'Higher Time Frame',
          'Lower Time Frame',
          'Interbank Price Delivery Algorithm',
          'Short-Term High',
          'Intermediate-Term High',
          'Long-Term High',
          'Short-Term Low',
          'Intermediate-Term Low',
          'Long-Term Low',
          'Market Structure Shift',
          'Mean Threshold',
          'Order Block',
          'Optimal Trade Entry',
          'Previous Day Low',
          'Previous Day High',
          'Power of Three',
          'External Range Liquidity',
          'Internal Range Liquidity',
          'Premium & Discount Arrangement',
          'Breaker Block',
          'Mitigation Block',
          'New Week Opening Gap',
          'Liquidity Pool'
        ],
      },
    },
    {
      category: 'Entry and Exit Rules',
      items: {
        'Clear Entry Criteria': [
          'Moving Average Crossover',
          'RSI Oversold/Overbought',
          'Key Support/Resistance Touch',
          'Chart Pattern Completion',
          'Breakout Candle Close',
        ],
        'Timeframe Alignment': [
          '1H, 4H, Daily Signal Match',
          '5M Entry with Daily Trend',
          '15M Exit Signals',
          'Weekly Trend Confirmation',
        ],
        'Risk-to-Reward Ratio': [
          'Minimum 1:2 Ratio',
          'Reject Poor Risk Profiles',
        ],
        'Confirmation': [
          'Engulfing Candle',
          'Volume Spike',
          'MACD Cross',
        ],
        'Breakout Rules': [
          'Candle Close Beyond Breakout',
          'Volume Spike Confirmation',
          'Stop Below Breakout Level',
        ],
        'Reversal Rules': [
          'Fibonacci Retracement Entry',
          'RSI Divergence',
          'Hammer/Shooting Star',
        ],
        'Stop-Loss Placement': [
          '1-2 ATR Below/Above Structure',
          'Last 3 Candles\' High/Low',
        ],
        'Profit Targeting': [
          'Previous High/Low',
          'Fixed % Target',
          'Fibonacci Extensions',
        ],
        'Time-Based Exits': [
          'Close After 4 Hours Unprofitability',
          'Exit at Day\'s End',
        ],
        'Partial Profit-Taking': [
          '50% Off at Halfway Point',
          'Trail Remaining Position',
        ],
        'Market Conditions': [
          'Low Liquidity',
          'High Volatility',
          'Trending Up',
          'Trending Down',
        ],
      },
    },
  ])

  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<string[]>([]);

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState<boolean>(false);
  const { toast } = useToast()

  const handleAddTemplate = (traderType: string, templateIndex: number) => {
    const template = tradeSetupTemplates[traderType as keyof typeof tradeSetupTemplates][templateIndex];
    const newTags: string[] = [];

    // Create a map of abbreviations to full names
    const abbreviationMap = new Map(template.tags.map(tag => {
      const fullName = Object.values(dropdownItems)
        .flatMap(item => Object.values(item.items).flat())
        .find(item => item.includes(tag));
      return [tag, fullName || tag];
    }));

    const contentWithTags = template.content.replace(/^- (.+)$/gm, (match, p1) => {
      return '- ' + p1.split(/\s+/).map((word: string) => {
        const fullName = abbreviationMap.get(word);
        if (fullName) {
          const tagColor = getTagColor(fullName);
          newTags.push(fullName);
          return `<span class="${tagColor} text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">${fullName}</span>`;
        }
        return word;
      }).join(' ');
    });

    setSetupText(contentWithTags);
    setTags(prevTags => {
      const allTags = [...prevTags, ...newTags];
      return Array.from(new Set(allTags));
    });
    setIsTemplateDialogOpen(false);
  };

  const getTagColor = useMemo(() => (tag: string): string => {
  if (dropdownItems[0].items['Trend Indicators'].includes(tag)) return 'bg-blue-500'
  if (dropdownItems[0].items['Momentum Indicators'].includes(tag)) return 'bg-green-500'
  if (dropdownItems[0].items['Volatility Indicators'].includes(tag)) return 'bg-red-500'
  if (dropdownItems[0].items['Volume Indicators'].includes(tag)) return 'bg-purple-500'
  if (dropdownItems[0].items['Custom and Advanced Indicators'].includes(tag)) return 'bg-pink-800'
  if (dropdownItems[0].items['Composite Indicators'].includes(tag)) return 'bg-[#611C35]'
  if (dropdownItems[1].items['Economic Indicators'].includes(tag)) return 'bg-yellow-500'
  if (dropdownItems[1].items['Company-Specific'].includes(tag)) return 'bg-orange-500'
  if (dropdownItems[2].items['Market Structure'].includes(tag)) return 'bg-pink-500'
  if (dropdownItems[3].items['Reversal Patterns'].includes(tag)) return 'bg-teal-500'
  if (dropdownItems[3].items['Continuation Patterns'].includes(tag)) return 'bg-indigo-500'
  if (dropdownItems[3].items['Exotic Patterns'].includes(tag)) return 'bg-violet-500'
  if (dropdownItems[3].items['Candlestick Patterns'].includes(tag)) return 'bg-cyan-500'
  if (dropdownItems[4].items['Advanced Concepts'].includes(tag)) return 'bg-green-500'
  if (dropdownItems[5].items['Clear Entry Criteria'].includes(tag) ||
      dropdownItems[5].items['Timeframe Alignment'].includes(tag) ||
      dropdownItems[5].items['Risk-to-Reward Ratio'].includes(tag) ||
      dropdownItems[5].items['Confirmation'].includes(tag) ||
      dropdownItems[5].items['Breakout Rules'].includes(tag) ||
      dropdownItems[5].items['Reversal Rules'].includes(tag) ||
      dropdownItems[5].items['Stop-Loss Placement'].includes(tag) ||
      dropdownItems[5].items['Profit Targeting'].includes(tag) ||
      dropdownItems[5].items['Time-Based Exits'].includes(tag) ||
      dropdownItems[5].items['Partial Profit-Taking'].includes(tag) ||
      dropdownItems[5].items['Market Conditions'].includes(tag)) return 'bg-amber-500'
  return 'bg-primary'
}, [dropdownItems]);

  useEffect(() => {
    console.log('TradeSetupTemplate rendered');
    if (textareaRef.current) {
      const selection = window.getSelection();
      let range = selection?.rangeCount ? selection.getRangeAt(0) : null;

      if (textareaRef.current.innerHTML !== setupText) {
        textareaRef.current.innerHTML = setupText;
        // Add event listeners to the newly created spans
        textareaRef.current.querySelectorAll('span[contenteditable="false"]').forEach(span => {
          span.addEventListener('click', () => removeTag(span.textContent || ''));
        });

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

  const handleItemClick = useCallback((item: string) => {
    if (textareaRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        const tagColor = getTagColor(item);
        const span = document.createElement('span');
        span.className = `${tagColor} text-white px-1 rounded inline-block cursor-pointer`;
        span.textContent = item;
        span.contentEditable = 'false';
        span.addEventListener('click', () => removeTag(item));

        range.insertNode(span);
        range.collapse(false);

        selection.removeAllRanges();
        selection.addRange(range);

        setTags(prevTags => [...prevTags, item]);
        setSetupText(textareaRef.current.innerHTML);

        // Ensure focus is set back to the textarea
        textareaRef.current.focus();
      }
    }
  }, [getTagColor]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove))
    if (textareaRef.current) {
      const spans = textareaRef.current.getElementsByTagName('span')
      for (let i = spans.length - 1; i >= 0; i--) {
        if (spans[i].textContent === tagToRemove) {
          spans[i].remove()
        }
      }
      setSetupText(textareaRef.current.innerHTML)
    }
  }, []);

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
  }, []);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    setSetupText(content);
    e.currentTarget.className = e.currentTarget.className.replace(/font-(sans|serif|mono)/g, fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    console.log('TradeSetupTemplate rendered');
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

  useEffect(() => {
    console.log('TradeSetupTemplate rendered');
    setCategoryOptions(dropdownItems.map(item => item.category));
  }, [dropdownItems]);

  useEffect(() => {
    console.log('TradeSetupTemplate rendered');
    if (newIndicatorCategory) {
      const category = dropdownItems.find(item => item.category === newIndicatorCategory);
      if (category) {
        setSubcategoryOptions(Object.keys(category.items));
      }
    } else {
      setSubcategoryOptions([]);
    }
  }, [newIndicatorCategory, dropdownItems]);

  const handleAddCustomIndicator = useCallback(() => {
    if (newIndicatorCategory && newIndicatorSubCategory && newIndicatorName) {
      setDropdownItems(prevItems => {
        const newItems = [...prevItems];
        const categoryIndex = newItems.findIndex(item => item.category === newIndicatorCategory);
        if (categoryIndex !== -1) {
          if (newItems[categoryIndex].items[newIndicatorSubCategory]) {
            if (!newItems[categoryIndex].items[newIndicatorSubCategory].includes(newIndicatorName)) {
              newItems[categoryIndex].items[newIndicatorSubCategory].push(newIndicatorName);
            }
          } else {
            newItems[categoryIndex].items[newIndicatorSubCategory] = [newIndicatorName];
          }
        }
        return newItems;
      });
      setNewIndicatorCategory('');
      setNewIndicatorSubCategory('');
      setNewIndicatorName('');
      setIsDialogOpen(false);
    }
  }, [newIndicatorCategory, newIndicatorSubCategory, newIndicatorName]);

  useEffect(() => {
    if (setupToEdit) {
      setSetupName(setupToEdit.setup_name);
      setSetupText(setupToEdit.setup_description || '');
      setTags(setupToEdit.tags);
    }
  }, [setupToEdit]);

  const handleSaveSetup = async () => {
    if (!setupName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a setup name before saving.",
        variant: "destructive",
      })
      return
    }

    // Extract tags from the setupText
    const extractedTags = setupText.match(/<span[^>]*>(.*?)<\/span>/g)?.map(span => {
      const match = span.match(/>([^<]+)</);
      return match ? match[1] : null;
    }).filter((tag): tag is string => tag !== null) || [];

    // Combine extracted tags with manually added tags
    const allTags = Array.from(new Set([...tags, ...extractedTags]));

    const setupData = {
      id: setupToEdit?.id,
      setup_name: setupName,
      setup_description: setupText,
      tags: allTags,
    }

    try {
      const result = await saveSetup(setupData)
      toast({
        title: "Success",
        description: result.message,
      })
      onSetupSaved()
      // Clear the form after successful save
      setSetupName('')
      setSetupText('')
      setTags([])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save the trade setup. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <Input
          type="text"
          placeholder="Setup name..."
          value={setupName}
          onChange={(e) => setSetupName(e.target.value)}
          className="text-2xl font-bold cursor-default"
        />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {dropdownItems.map((dropdown) => (
            <DropdownMenu key={dropdown.category}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {dropdown.category} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 h-[50vh] overflow-y-auto ">
                {Object.entries(dropdown.items).map(([subCategory, items], index) => (
                  <React.Fragment key={subCategory}>
                    {index > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel>{subCategory}</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      {items.map((item) => (
                        <DropdownMenuItem key={item} onSelect={() => handleItemClick(item)}>
                          {item}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="ml-2">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Indicator</DialogTitle>
                <DialogDescription>Enter the details for your custom indicator.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={newIndicatorCategory}
                    onValueChange={setNewIndicatorCategory}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subcategory" className="text-right">
                    Subcategory
                  </Label>
                  <Select
                    value={newIndicatorSubCategory}
                    onValueChange={setNewIndicatorSubCategory}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoryOptions.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Indicator Name
                  </Label>
                  <Input
                    id="name"
                    value={newIndicatorName}
                    onChange={(e) => setNewIndicatorName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddCustomIndicator}>Add Indicator</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            className={`cursor-default min-h-[500px] text-sm pt-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 whitespace-pre-wrap [&>span]:user-select-none ${fontFamily}`}
            style={{ fontSize }}
          />
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <Button
            onClick={() => {
              setSetupText('');
              setTags([]);
            }}
          >
            Reset Template
          </Button>
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Add Template</DialogTitle>
                <DialogDescription>Choose a template to add to your trade setup</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[60vh] pr-4">
                {Object.entries(tradeSetupTemplates).map(([traderType, templates]) => (
                  <div key={traderType} className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">{traderType} Templates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templates.map((template, index) => (
                        <Card key={`${traderType}-${index}`} className="p-4">
                          <h4 className="font-medium mb-2">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            {template.description}
                          </p>
                          <Button onClick={() => handleAddTemplate(traderType, index)}>
                            Use Template
                          </Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSaveSetup}>
            <Save className="mr-2 h-4 w-4" />
            Save Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

