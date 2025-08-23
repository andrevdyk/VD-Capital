"use client"

import { useState } from "react"
import { ArrowUpDown, Check, ChevronsUpDown, Search } from "lucide-react"
import type { Stock } from "../types/stock"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StockTableProps {
  stocks: Stock[]
}

export default function StockTable({ stocks }: StockTableProps) {
  const [filters, setFilters] = useState({
    search: "",
    marketCapMin: "",
    marketCapMax: "",
    sector: "all",
    industry: "all",
    betaMin: "",
    betaMax: "",
    priceMin: "",
    priceMax: "",
    dividendMin: "",
    dividendMax: "",
    volumeMin: "",
    volumeMax: "",
    exchange: "all",
    country: "all",
    isEtf: "all",
    isFund: "all",
    isActivelyTrading: "all",
  })

  // Add sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Stock | null
    direction: "ascending" | "descending"
  }>({
    key: null,
    direction: "ascending",
  })

  // Open state for comboboxes
  const [openSector, setOpenSector] = useState(false)
  const [openIndustry, setOpenIndustry] = useState(false)
  const [openExchange, setOpenExchange] = useState(false)
  const [openCountry, setOpenCountry] = useState(false)

  // Get unique values for dropdowns
  const sectors = Array.from(new Set(stocks.map((stock) => stock.sector).filter(Boolean)))
  const industries = Array.from(new Set(stocks.map((stock) => stock.industry).filter(Boolean)))
  const exchanges = Array.from(new Set(stocks.map((stock) => stock.exchange).filter(Boolean)))
  const countries = Array.from(new Set(stocks.map((stock) => stock.country).filter(Boolean)))

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Add sorting function
  const requestSort = (key: keyof Stock) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  // Apply filters including search
  const filteredStocks = [
    ...stocks.filter((stock) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSymbol = stock.symbol.toLowerCase().includes(searchTerm)
        const matchesName = stock.companyName.toLowerCase().includes(searchTerm)
        if (!matchesSymbol && !matchesName) return false
      }

      // Market Cap filters
      if (filters.marketCapMin && stock.marketCap < Number.parseFloat(filters.marketCapMin)) return false
      if (filters.marketCapMax && stock.marketCap > Number.parseFloat(filters.marketCapMax)) return false

      // Sector filter
      if (filters.sector && filters.sector !== "all" && stock.sector !== filters.sector) return false

      // Industry filter
      if (filters.industry && filters.industry !== "all" && stock.industry !== filters.industry) return false

      // Beta filters
      if (filters.betaMin && stock.beta < Number.parseFloat(filters.betaMin)) return false
      if (filters.betaMax && stock.beta > Number.parseFloat(filters.betaMax)) return false

      // Price filters
      if (filters.priceMin && stock.price < Number.parseFloat(filters.priceMin)) return false
      if (filters.priceMax && stock.price > Number.parseFloat(filters.priceMax)) return false

      // Dividend filters
      if (filters.dividendMin && stock.lastAnnualDividend < Number.parseFloat(filters.dividendMin)) return false
      if (filters.dividendMax && stock.lastAnnualDividend > Number.parseFloat(filters.dividendMax)) return false

      // Volume filters
      if (filters.volumeMin && stock.volume < Number.parseFloat(filters.volumeMin)) return false
      if (filters.volumeMax && stock.volume > Number.parseFloat(filters.volumeMax)) return false

      // Exchange filter
      if (filters.exchange && filters.exchange !== "all" && stock.exchange !== filters.exchange) return false

      // Country filter
      if (filters.country && filters.country !== "all" && stock.country !== filters.country) return false

      // Boolean filters
      if (filters.isEtf !== "all" && stock.isEtf !== (filters.isEtf === "true")) return false
      if (filters.isFund !== "all" && stock.isFund !== (filters.isFund === "true")) return false
      if (filters.isActivelyTrading !== "all" && stock.isActivelyTrading !== (filters.isActivelyTrading === "true"))
        return false

      return true
    }),
  ].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue === bValue) return 0

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    // Compare based on direction
    if (sortConfig.direction === "ascending") {
      return aValue < bValue ? -1 : 1
    } else {
      return aValue > bValue ? -1 : 1
    }
  })

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
    return num.toString()
  }

  return (
    <div className="space-y-4">
      {/* Search bar for stocks */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks by symbol or name..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium">Market Cap Range</label>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Min"
              value={filters.marketCapMin}
              onChange={(e) => handleFilterChange("marketCapMin", e.target.value)}
            />
            <Input
              placeholder="Max"
              value={filters.marketCapMax}
              onChange={(e) => handleFilterChange("marketCapMax", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Sector</label>
          <Popover open={openSector} onOpenChange={setOpenSector}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openSector}
                className="w-full justify-between mt-1"
              >
                {filters.sector === "all" ? "All Sectors" : filters.sector}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search sector..." />
                <CommandList>
                  <CommandEmpty>No sector found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    <CommandItem
                      onSelect={() => {
                        handleFilterChange("sector", "all")
                        setOpenSector(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", filters.sector === "all" ? "opacity-100" : "opacity-0")} />
                      All Sectors
                    </CommandItem>
                    {sectors.map((sector) => (
                      <CommandItem
                        key={sector}
                        onSelect={() => {
                          handleFilterChange("sector", sector)
                          setOpenSector(false)
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", filters.sector === sector ? "opacity-100" : "opacity-0")}
                        />
                        {sector}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="text-sm font-medium">Industry</label>
          <Popover open={openIndustry} onOpenChange={setOpenIndustry}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openIndustry}
                className="w-full justify-between mt-1"
              >
                {filters.industry === "all" ? "All Industries" : filters.industry}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search industry..." />
                <CommandList>
                  <CommandEmpty>No industry found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    <CommandItem
                      onSelect={() => {
                        handleFilterChange("industry", "all")
                        setOpenIndustry(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", filters.industry === "all" ? "opacity-100" : "opacity-0")} />
                      All Industries
                    </CommandItem>
                    {industries.map((industry) => (
                      <CommandItem
                        key={industry}
                        onSelect={() => {
                          handleFilterChange("industry", industry)
                          setOpenIndustry(false)
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", filters.industry === industry ? "opacity-100" : "opacity-0")}
                        />
                        {industry}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="text-sm font-medium">Beta Range</label>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Min"
              value={filters.betaMin}
              onChange={(e) => handleFilterChange("betaMin", e.target.value)}
            />
            <Input
              placeholder="Max"
              value={filters.betaMax}
              onChange={(e) => handleFilterChange("betaMax", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Price Range</label>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange("priceMin", e.target.value)}
            />
            <Input
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange("priceMax", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Exchange</label>
          <Popover open={openExchange} onOpenChange={setOpenExchange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openExchange}
                className="w-full justify-between mt-1"
              >
                {filters.exchange === "all" ? "All Exchanges" : filters.exchange}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search exchange..." />
                <CommandList>
                  <CommandEmpty>No exchange found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    <CommandItem
                      onSelect={() => {
                        handleFilterChange("exchange", "all")
                        setOpenExchange(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", filters.exchange === "all" ? "opacity-100" : "opacity-0")} />
                      All Exchanges
                    </CommandItem>
                    {exchanges.map((exchange) => (
                      <CommandItem
                        key={exchange}
                        onSelect={() => {
                          handleFilterChange("exchange", exchange)
                          setOpenExchange(false)
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", filters.exchange === exchange ? "opacity-100" : "opacity-0")}
                        />
                        {exchange}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="text-sm font-medium">Country</label>
          <Popover open={openCountry} onOpenChange={setOpenCountry}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCountry}
                className="w-full justify-between mt-1"
              >
                {filters.country === "all" ? "All Countries" : filters.country}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    <CommandItem
                      onSelect={() => {
                        handleFilterChange("country", "all")
                        setOpenCountry(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", filters.country === "all" ? "opacity-100" : "opacity-0")} />
                      All Countries
                    </CommandItem>
                    {countries.map((country) => (
                      <CommandItem
                        key={country}
                        onSelect={() => {
                          handleFilterChange("country", country)
                          setOpenCountry(false)
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", filters.country === country ? "opacity-100" : "opacity-0")}
                        />
                        {country}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="text-sm font-medium">Is ETF</label>
          <Select value={filters.isEtf} onValueChange={(value) => handleFilterChange("isEtf", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border max-h-[600px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-12 whitespace-nowrap py-4 text-base font-semibold">#</TableHead>
              <TableHead
                className="whitespace-nowrap cursor-pointer py-4 text-base font-semibold"
                onClick={() => requestSort("symbol")}
              >
                Symbol <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                className="whitespace-nowrap cursor-pointer py-4 text-base font-semibold"
                onClick={() => requestSort("companyName")}
              >
                Company Name <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                className="whitespace-nowrap cursor-pointer py-4 text-base font-semibold"
                onClick={() => requestSort("marketCap")}
              >
                Market Cap <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                className="whitespace-nowrap cursor-pointer py-4 text-base font-semibold"
                onClick={() => requestSort("sector")}
              >
                Sector <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                className="whitespace-nowrap cursor-pointer py-4 text-base font-semibold"
                onClick={() => requestSort("industry")}
              >
                Industry <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                className="whitespace-nowrap cursor-pointer py-4 text-base font-semibold"
                onClick={() => requestSort("beta")}
              >
                Beta <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                className="whitespace-nowrap cursor-pointer py-4 text-base font-semibold"
                onClick={() => requestSort("price")}
              >
                Price <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                className="whitespace-nowrap cursor-pointer py-4 text-base font-semibold"
                onClick={() => requestSort("changePercent")}
              >
                Change % <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock, index) => (
                <TableRow key={stock.symbol}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell>{stock.companyName}</TableCell>
                  <TableCell>{formatNumber(stock.marketCap)}</TableCell>
                  <TableCell>{stock.sector || "-"}</TableCell>
                  <TableCell>{stock.industry || "-"}</TableCell>
                  <TableCell>{stock.beta?.toFixed(2) || "-"}</TableCell>
                  <TableCell>${stock.price?.toFixed(2) || "-"}</TableCell>
                  <TableCell className={Number(stock.changePercent) >= 0 ? "text-[#03b198]" : "text-[#ff2f67]"}>
                    {Number(stock.changePercent) >= 0 ? "+" : ""}
                    {stock.changePercent}%
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No stocks match the current filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

