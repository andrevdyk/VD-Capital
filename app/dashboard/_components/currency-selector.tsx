"use client"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
  } from "@/components/ui/command"
import { useState } from "react"

  
  export function CurrencySelector() {
        const [isInputFocused, setIsInputFocused] = useState(false)
        const [inputValue, setInputValue] = useState("")
      
        return (
          <Command className="rounded-lg border shadow-md md:min-w-[450px]">
            {/* Input for searching */}
            <CommandInput
              placeholder="Type or search a currency pair..."
              value={inputValue}
              onValueChange={(value) => setInputValue(value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => {
                if (!inputValue) {
                  setIsInputFocused(false)
                }
              }}
            />
            
            {/* Show the CommandList only when the input is focused or has a value */}
            {(isInputFocused || inputValue) && (
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
      
                {/* Major Pairs */}
                <CommandGroup heading="Major Pairs">
                  <CommandItem>EURUSD</CommandItem>
                  <CommandItem>GBPUSD</CommandItem>
                  <CommandItem>USDJPY</CommandItem>
                  <CommandItem>USDCHF</CommandItem>
                  <CommandItem>AUDUSD</CommandItem>
                  <CommandItem>USDCAD</CommandItem>
                  <CommandItem>NZDUSD</CommandItem>
                </CommandGroup>
      
                <CommandSeparator />
      
                {/* Minor Pairs */}
                <CommandGroup heading="Minor Pairs">
                  <CommandItem>EURGBP</CommandItem>
                  <CommandItem>EURJPY</CommandItem>
                  <CommandItem>GBPJPY</CommandItem>
                  <CommandItem>EURCHF</CommandItem>
                  <CommandItem>AUDJPY</CommandItem>
                  <CommandItem>NZDJPY</CommandItem>
                  <CommandItem>GBPAUD</CommandItem>
                </CommandGroup>
      
                <CommandSeparator />
      
                {/* Exotic Pairs */}
                <CommandGroup heading="Exotic Pairs">
                  <CommandItem>USDZAR</CommandItem>
                  <CommandItem>USDMXN</CommandItem>
                  <CommandItem>USDTRY</CommandItem>
                  <CommandItem>EURTRY</CommandItem>
                  <CommandItem>USDHKD</CommandItem>
                  <CommandItem>USDSGD</CommandItem>
                  <CommandItem>USDTHB</CommandItem>
                </CommandGroup>
              </CommandList>
            )}
          </Command>
        )
      }