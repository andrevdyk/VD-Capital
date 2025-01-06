"use client"

import { useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FilterOption {
  id: string
  label: string
}

interface ScrollableSelectionProps {
  title: string
  options: FilterOption[]
  onSelectionChange: (selectedIds: string[]) => void
}

export function ScrollableSelection({ title, options, onSelectionChange }: ScrollableSelectionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const handleCheckboxChange = (id: string) => {
    setSelectedOptions((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
      
      onSelectionChange(newSelection)
      return newSelection
    })
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2 mb-2">
            <Checkbox
              id={option.id}
              checked={selectedOptions.includes(option.id)}
              onCheckedChange={() => handleCheckboxChange(option.id)}
            />
            <Label htmlFor={option.id}>{option.label}</Label>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}

