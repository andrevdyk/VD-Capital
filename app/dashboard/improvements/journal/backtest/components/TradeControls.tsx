"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TradeControlsProps {
  onPlaceTrade: (tradeDetails: any) => void
}

export function TradeControls({ onPlaceTrade }: TradeControlsProps) {
  const [quantity, setQuantity] = useState<number>(1)
  const [stopLoss, setStopLoss] = useState<number | null>(null)
  const [takeProfit, setTakeProfit] = useState<number | null>(null)

  const handlePlaceBuy = () => {
    onPlaceTrade({ type: 'buy', quantity, stopLoss, takeProfit })
  }

  const handlePlaceSell = () => {
    onPlaceTrade({ type: 'sell', quantity, stopLoss, takeProfit })
  }

  return (
    <div className="flex space-x-4 items-end">
      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min={1}
        />
      </div>
      <div>
        <Label htmlFor="stopLoss">Stop Loss</Label>
        <Input
          id="stopLoss"
          type="number"
          value={stopLoss || ''}
          onChange={(e) => setStopLoss(e.target.value ? Number(e.target.value) : null)}
        />
      </div>
      <div>
        <Label htmlFor="takeProfit">Take Profit</Label>
        <Input
          id="takeProfit"
          type="number"
          value={takeProfit || ''}
          onChange={(e) => setTakeProfit(e.target.value ? Number(e.target.value) : null)}
        />
      </div>
      <Button onClick={handlePlaceBuy}>Buy</Button>
      <Button onClick={handlePlaceSell} variant="destructive">Sell</Button>
    </div>
  )
}

