"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface TimeControlsProps {
  currentDate: Date
  onDateChange: (newDate: Date) => void
  speed: number
  onSpeedChange: (newSpeed: number) => void
  isRunning: boolean
  onFastForward: () => void
  onPause: () => void
}

export function TimeControls({
  currentDate,
  onDateChange,
  speed,
  onSpeedChange,
  isRunning,
  onFastForward,
  onPause,
}: TimeControlsProps) {
  return (
    <div className="flex space-x-4 items-end">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={currentDate.toISOString().split('T')[0]}
          onChange={(e) => onDateChange(new Date(e.target.value))}
        />
      </div>
      <div className="flex-1">
        <Label>Speed</Label>
        <Slider
          value={[speed]}
          onValueChange={(value) => onSpeedChange(value[0])}
          min={1}
          max={10}
          step={1}
        />
      </div>
      <Button onClick={isRunning ? onPause : onFastForward}>
        {isRunning ? 'Pause' : 'Fast Forward'}
      </Button>
    </div>
  )
}

