import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Upload, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { editTrade } from '../actions/editTrade'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { toast } from "@/components/ui/use-toast"

interface TradeNotesProps {
  trade: {
    id: string
    symbol: string
    net_profit: number
    notes?: string
    side: string
    qty: number
    entry_price: number
    exit_price: number | null
    placing_time: string
    closing_time: string | null
    mistakes?: string
    strategy_id?: string
    setup_id?: string
    screenshot_url?: string
  } | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onNotesUpdate: (updatedTrade: any) => void
}

interface NotesContent {
  preTrade: {
    text: string;
    mistakes: string[];
  };
  duringTrade: {
    text: string;
    mistakes: string[];
  };
  postTrade: {
    text: string;
    mistakes: string[];
  };
  improvement: {
    text: string;
    mistakes: string[];
  };
}

const mistakeOptions = {
  preTrade: [
    "Ignoring higher timeframes",
    "Overlooking key support/resistance levels",
    "Misinterpreting news or events",
    "Overcomplicating the analysis",
    "Using outdated or unreliable data",
    "Failing to define risk/reward ratio",
    "Trading without a clear plan",
    "Setting unrealistic profit targets",
    "Ignoring market conditions (trend/chop)",
    "Allowing bias to override facts"
  ],
  entry: [
    "Entering on impulse",
    "Trading during low liquidity periods",
    "Misjudging breakout strength",
    "Over-leveraging the position",
    "Entering too late after a move",
    "Forgetting to adjust for slippage",
    "Trading without confirmation",
    "Ignoring stop-loss placement",
    "Not double-checking trade size",
    "Relying solely on gut feeling"
  ],
  duringTrade: [
    "Overtrading the same setup",
    "Adding to a losing position",
    "Ignoring warning signals",
    "Letting emotions dictate actions",
    "Failing to re-evaluate conditions",
    "Holding during major news events",
    "Micromanaging every tick",
    "Letting profits turn into losses",
    "Hesitating to scale out",
    "Blindly trusting automation/tools"
  ],
  exit: [
    "Exiting without reason",
    "Moving stop loss against the trend",
    "Chasing extra pips unrealistically",
    "Exiting only due to time constraints",
    "Allowing greed to delay exits",
    "Missing planned exit levels",
    "Forgetting to secure partial profits",
    "Letting frustration cloud decisions",
    "Failing to re-enter after a valid pullback",
    "Closing manually despite valid trade"
  ],
  postTrade: [
    "Skipping journaling",
    "Ignoring emotional triggers",
    "Focusing only on profit/loss",
    "Not reviewing missed opportunities",
    "Neglecting to assess execution quality",
    "Avoiding feedback on bad trades",
    "Rationalizing mistakes without learning",
    "Overconfidence after a win",
    "Revenge trading after a loss",
    "Failing to adapt strategies"
  ]
}

export function TradeNotes({ trade, isOpen, onOpenChange, onNotesUpdate }: TradeNotesProps) {
  const [notes, setNotes] = useState<NotesContent>({
    preTrade: { text: '', mistakes: [] },
    duringTrade: { text: '', mistakes: [] },
    postTrade: { text: '', mistakes: [] },
    improvement: { text: '', mistakes: [] }
  })
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [newScreenshot, setNewScreenshot] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);

  useEffect(() => {
    if (trade && trade.notes) {
      try {
        const parsedNotes = JSON.parse(trade.notes) as NotesContent
        setNotes(parsedNotes)
      } catch (error) {
        console.error('Error parsing notes:', error)
        setNotes({
          preTrade: { text: trade.notes, mistakes: [] },
          duringTrade: { text: '', mistakes: [] },
          postTrade: { text: '', mistakes: [] },
          improvement: { text: '', mistakes: [] }
        })
      }
    } else {
      setNotes({
        preTrade: { text: '', mistakes: [] },
        duringTrade: { text: '', mistakes: [] },
        postTrade: { text: '', mistakes: [] },
        improvement: { text: '', mistakes: [] }
      })
    }
    setScreenshot(trade?.screenshot_url || null)
    setNewScreenshot(null)
  }, [trade])

  const handleSaveNotes = async () => {
    if (!trade) return

    setIsSaving(true)
    try {
      const updatedTrade = {
        ...trade,
        notes: JSON.stringify(notes),
        screenshot_url: shouldDeleteImage ? null : (screenshot || undefined),
        newScreenshot: newScreenshot || undefined,
        deleteScreenshot: shouldDeleteImage,
      };
      const result = await editTrade(updatedTrade)
      onNotesUpdate(result[0])
      onOpenChange(false)
      toast({
        title: "Notes saved successfully",
        description: "Your trade notes have been updated.",
      })
      setShouldDeleteImage(false);
    } catch (error) {
      console.error('Error saving notes:', error)
      toast({
        title: "Error saving notes",
        description: "There was a problem saving your notes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddMistake = (section: keyof NotesContent, mistake: string) => {
    if (mistake && !notes[section].mistakes.includes(mistake)) {
      setNotes(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          mistakes: [...prev[section].mistakes, mistake]
        }
      }))
    }
  }

  const handleRemoveMistake = (section: keyof NotesContent, mistake: string) => {
    setNotes(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        mistakes: prev[section].mistakes.filter(m => m !== mistake)
      }
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewScreenshot(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteImage = () => {
    setShouldDeleteImage(true);
    setScreenshot(null);
    setNewScreenshot(null);
    toast({
      title: "Image marked for deletion",
      description: "The screenshot will be removed when you save the notes.",
    });
  };

  const getPlaceholder = (section: keyof NotesContent) => {
    if (!trade) return ''

    const isWinningTrade = trade.net_profit > 0
    const tradeDate = format(new Date(trade.closing_time ?? ''), "dd MMM yyyy")
    const result = isWinningTrade ? `+${trade.net_profit.toFixed(2)}` : `-${Math.abs(trade.net_profit).toFixed(2)}`

    const winningPlaceholders = {
      preTrade: "Saw a clean bullish flag on the 1-hour chart with support from positive UK GDP data. Confident setup, but cautious about possible U.S. news later in the day.",
      duringTrade: "Price moved steadily in my favor. Slight nerves when it paused near 1.2640 resistance but stayed calm and followed the plan.",
      postTrade: "Strong technical breakout with volume confirmation.\nHeld my nerve and trusted the analysis.",
      improvement: "Could've added a second position on the retest to maximize profits."
    }

    const losingPlaceholders = {
      preTrade: "Identified a bearish engulfing candle near resistance on the 4-hour chart. Overlooked a conflicting bullish divergence on the RSI. Entered too quickly without waiting for confirmation.",
      duringTrade: "Felt uneasy as price moved against me. Adjusted my stop loss slightly, which led to a bigger loss. Emotionally pressured to make it work.",
      postTrade: "Ignored mixed signals in the technicals.\nReacted emotionally by moving my stop.",
      improvement: "Wait for clear confluence and confirmation before entering.\nNever move a stop loss unless it's to secure profits."
    }

    const placeholders = isWinningTrade ? winningPlaceholders : losingPlaceholders

    const header = `Date: ${tradeDate} | Instrument: ${trade.symbol} | Result: ${result}\n\n`

    return header + placeholders[section]
  }

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url; // For newly uploaded images
    return url; // Return the full signed URL as is
  }

  if (!trade) return null

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="w-full h-full max-w-full">
        <DrawerHeader className="p-4 border-b">
          <DrawerTitle className="text-xl">Trade Notes</DrawerTitle>
          <DrawerDescription className="">
            {format(new Date(trade.closing_time ?? ''), "dd/MM/yyyy HH:mm")} | {trade.symbol} | 
            <span className={trade.net_profit >= 0 ? 'text-[#03b198]' : 'text-[#ff004d]'}>
              {trade.net_profit >= 0 ? `Profit: $${trade.net_profit.toFixed(2)}` : `Loss: $${Math.abs(trade.net_profit).toFixed(2)}`}
            </span>
          </DrawerDescription>
        </DrawerHeader>
        <Separator/>
        <div className="flex gap-4">
          <div className="flex-grow">
            {[
              { key: 'preTrade', label: 'Pre Trade Thoughts', mistakes: mistakeOptions.preTrade },
              { key: 'duringTrade', label: 'During the Trade', mistakes: [...mistakeOptions.entry, ...mistakeOptions.duringTrade, ...mistakeOptions.exit] },
              { key: 'postTrade', label: 'Why It Worked/Why It Didn\'t Work', mistakes: mistakeOptions.postTrade },
              { key: 'improvement', label: 'Lesson to Improve', mistakes: [] }
            ].map(({ key, label, mistakes }) => (
              <div key={key} className="mb-4 pb-4 ml-4">
                <h3 className="text-lg font-semibold mb-2 mt-2">{label}</h3>
                <div className="flex gap-4">
                  <div className="flex-grow">
                    <Textarea
                      id={key}
                      placeholder={getPlaceholder(key as keyof NotesContent)}
                      value={notes[key as keyof NotesContent].text}
                      onChange={(e) => setNotes(prev => ({
                        ...prev,
                        [key]: { ...prev[key as keyof NotesContent], text: e.target.value }
                      }))}
                      className="h-[140px] resize-none"
                    />
                  </div>
                  <div className="w-1/3 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Mistakes</span>
                      <Select onValueChange={(value) => handleAddMistake(key as keyof NotesContent, value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Add Mistake" />
                        </SelectTrigger>
                        <SelectContent>
                          {mistakes.map((mistake) => (
                            <SelectItem key={mistake} value={mistake} className="text-base">
                              <div className="flex items-center">
                                <Checkbox className="mr-2" />
                                {mistake}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border rounded-md p-2 flex-grow overflow-y-auto flex flex-wrap content-start gap-2">
                      {notes[key as keyof NotesContent].mistakes.map((mistake, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {mistake}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-auto p-0 text-xs"
                            onClick={() => handleRemoveMistake(key as keyof NotesContent, mistake)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="w-1/3">
            <h3 className="text-lg font-semibold mb-2 mt-2">Trade Screenshot</h3>
            <div className="border rounded-md p-2 flex items-center justify-center h-[400px]">
              {newScreenshot || screenshot ? (
                <div className="relative w-full h-full">
                  <Image
                    src={getImageUrl(newScreenshot || screenshot || '')}
                    alt="Trade Screenshot"
                    fill
                    style={{ objectFit: 'contain' }}
                    onError={(e) => {
                      console.error('Image load error:', e);
                      toast({
                        title: "Error loading image",
                        description: "Failed to load image. Please try uploading again.",
                        variant: "destructive",
                      });
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleDeleteImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 mb-2">No screenshot uploaded</p>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => document.getElementById('screenshot-upload')?.click()}
                  >
                    <Upload size={16} />
                    Upload Screenshot
                  </Button>
                </div>
              )}
            </div>
            <Input
              id="screenshot-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>
        <DrawerFooter className=''>
          <Button onClick={handleSaveNotes} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Notes"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

