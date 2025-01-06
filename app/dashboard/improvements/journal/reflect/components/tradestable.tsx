'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Pencil, Trash, Check, MoreHorizontal, StickyNote, ArrowUpDown } from 'lucide-react'
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, addMinutes } from "date-fns"
import { getTradingHistory } from '../actions/getTradingHistory'
import { deleteTrade } from '../actions/deleteTrade'
import { addTrade } from '../actions/addTrade'
import { editTrade } from '../actions/editTrade'
import { getUserSetups } from '../actions/getUserSetups'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { DateRange } from 'react-day-picker'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import { TradeNotes } from './trade-notes'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Trade {
  id: string
  symbol: string
  side: string
  qty: number
  placing_time: string
  closing_time: string
  entry_price: number
  exit_price: number
  net_profit: number
  mistakes?: string
  strategy_id?: string
  setup_id?: string
  notes?: string;
}

interface TradeData {
  symbol: string;
  side: string;
  qty: number;
  placing_time: string;
  closing_time: string;
  entry_price: number;
  exit_price: number
  mistakes?: string;
  strategy_id?: string;
  setup_id?: string;
}

interface Strategy {
  strategy_id: string;
  strategy_name: string;
}

interface Setup {
  id: string;
  setup_name: string;
  strategy_id: string;
}

interface TradesTableProps {
  initialStrategies: Strategy[]
  initialSetups: Setup[]
}

export function TradesTable({ initialStrategies, initialSetups }: TradesTableProps) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [directionFilter, setDirectionFilter] = useState<string>('all')
  const [symbolFilter, setSymbolFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const tradesPerPage = 10
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTrade, setNewTrade] = useState<Partial<Trade> | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null); 
  const router = useRouter()
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    symbol: true,
    direction: true,
    size: true,
    openingTime: true,
    closingTime: true,
    duration: true,
    entryPrice: true,
    exitPrice: true,
    netProfit: true,
    status: true,
    mistakes: true,
    strategy: true,
    setup: true,
  })
  const [selectedTrades, setSelectedTrades] = useState<string[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies)
  const [setups, setSetups] = useState<Record<string, Setup[]>>(
    initialSetups.reduce((acc, setup) => {
      if (!acc[setup.strategy_id]) {
        acc[setup.strategy_id] = []
      }
      acc[setup.strategy_id].push(setup)
      return acc
    }, {} as Record<string, Setup[]>)
  )
  const [bulkStrategyId, setBulkStrategyId] = useState<string | null>(null)
  const [bulkSetupId, setBulkSetupId] = useState<string | null>(null)
  const [notesTrade, setNotesTrade] = useState<Trade | null>(null) 
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false)
  const [notesFilter, setNotesFilter] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [durationFilters, setDurationFilters] = useState({
    scalpTrades: 15,
    dayTrades: 24,
    swingTrades: 7,
    positionTrades: 4
  });
  const [selectedDurationFilter, setSelectedDurationFilter] = useState<string>('all');

  useEffect(() => {
    const fetchTrades = async () => {
      const tradingHistory = await getTradingHistory()
      if (tradingHistory) {
        setTrades(tradingHistory)
        setFilteredTrades(tradingHistory)
      }
    }

    fetchTrades()
  }, [])

  useEffect(() => {
    const filtered = trades.filter(trade => {
      const statusMatch = statusFilter === 'all' || getStatusText(trade.net_profit) === statusFilter
      const directionMatch = directionFilter === 'all' || trade.side === directionFilter
      const symbolMatch = symbolFilter === '' || trade.symbol.toLowerCase().includes(symbolFilter.toLowerCase())
      const dateMatch = !dateRange || !dateRange.from || !dateRange.to || 
        (new Date(trade.placing_time) >= startOfDay(dateRange.from) && 
         new Date(trade.placing_time) <= endOfDay(dateRange.to))
      const notesMatch = notesFilter === 'all' || 
        (notesFilter === 'completed' && trade.notes && trade.notes !== '') ||
        (notesFilter === 'incomplete' && (!trade.notes || trade.notes === ''))
      const durationMatch = selectedDurationFilter === 'all' || (() => {
        const durationMinutes = getDurationInMinutes(trade.placing_time, trade.closing_time)
        switch (selectedDurationFilter) {
          case 'scalpTrades': return durationMinutes >= 0 && durationMinutes <= durationFilters.scalpTrades;
          case 'dayTrades': return durationMinutes > durationFilters.scalpTrades && durationMinutes <= durationFilters.dayTrades * 60;
          case 'swingTrades': return durationMinutes > durationFilters.dayTrades * 60 && durationMinutes <= durationFilters.swingTrades * 24 * 60;
          case 'positionTrades': return durationMinutes > durationFilters.swingTrades * 24 * 60 && durationMinutes <= durationFilters.positionTrades * 7 * 24 * 60;
          default: return true
        }
      })()
      return statusMatch && directionMatch && symbolMatch && dateMatch && notesMatch && durationMatch
    })
    setFilteredTrades(filtered)
    setCurrentPage(1)
  }, [trades, statusFilter, directionFilter, symbolFilter, dateRange, notesFilter, selectedDurationFilter, durationFilters])

  const calculateDuration = (placingTime: string, closingTime: string) => {
    const durationMinutes = getDurationInMinutes(placingTime, closingTime)
    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60
    return `${hours}h ${minutes}m`
  }

  const getStatusStyle = (netProfit: number) => {
    if (netProfit > 0) return 'bg-[#03b198] text-white'
    if (netProfit < 0) return 'bg-[#ff004d] text-white'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = (netProfit: number) => {
    if (netProfit > 0) return 'Win'
    if (netProfit < 0) return 'Loss'
    return 'Breakeven'
  }

  const getNetProfitStyle = (netProfit: number) => {
    if (netProfit > 0) return 'text-[#03b198]'
    if (netProfit < 0) return 'text-[#ff004d]'
    return 'text-yellow-600'
  }

  const getDurationInMinutes = (placingTime: string, closingTime: string) => {
    const start = new Date(placingTime)
    const end = new Date(closingTime)
    return Math.round((end.getTime() - start.getTime()) / 60000)
  }

  const handleDelete = async (id: string) => {
    setDeleteConfirmation(id)
  }

  const confirmDelete = async (tradeIds: string[]) => {
    try {
      await Promise.all(tradeIds.map(id => deleteTrade(id)))
      const updatedTrades = trades.filter(trade => !tradeIds.includes(trade.id))
      setTrades(updatedTrades)
      setFilteredTrades(updatedTrades)
      setSelectedTrades([])
      router.refresh()
    } catch (error) {
      console.error('Error deleting trades:', error)
    }
    setDeleteConfirmation(null)
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
  }

  const handleSave = async (trade: Trade) => {
    try {
      const updatedTrade = {
        ...trade,
        net_profit: trade.side === 'Sell' 
          ? (trade.entry_price - trade.exit_price) * trade.qty
          : (trade.exit_price - trade.entry_price) * trade.qty
      };
      await editTrade(updatedTrade);
      setEditingId(null);
      const updatedTrades = trades.map(t => t.id === trade.id ? updatedTrade : t);
      setTrades(updatedTrades);
      setFilteredTrades(updatedTrades);
      router.refresh();
    } catch (error) {
      console.error('Error saving trade:', error);
    }
  };

  const handleAddTrade = () => { 
    setErrorMessage(null); 
    setNewTrade({
      symbol: '',
      side: 'Buy',
      qty: 0,
      entry_price: 0,
      exit_price: 0,
      placing_time: new Date().toISOString(),
      closing_time: new Date().toISOString(),
    })
  }

  const handleSaveNewTrade = async () => { 
    if (newTrade) {
      try {
        if (!newTrade.symbol || !newTrade.side || !newTrade.qty || !newTrade.entry_price || !newTrade.exit_price || !newTrade.placing_time || !newTrade.closing_time) {
          throw new Error('All fields except Mistakes are required');
        }

        const tradeData: TradeData = {
          symbol: newTrade.symbol,
          side: newTrade.side,
          qty: Number(newTrade.qty),
          entry_price: Number(newTrade.entry_price),
          exit_price: Number(newTrade.exit_price),
          placing_time: new Date(newTrade.placing_time).toISOString(),
          closing_time: new Date(newTrade.closing_time).toISOString(),
          mistakes: newTrade.mistakes || undefined,
          strategy_id: newTrade.strategy_id,
          setup_id: newTrade.setup_id,
        };

        if (tradeData.qty <= 0 || tradeData.entry_price <= 0 || tradeData.exit_price <= 0) {
          throw new Error('Quantity, Entry Price, and Exit Price must be greater than 0');
        }

        const addedTrade = await addTrade(tradeData);
        if (addedTrade && addedTrade[0]) {
          setNewTrade(null);
          const updatedTrades = [addedTrade[0], ...trades];
          setTrades(updatedTrades);
          setFilteredTrades(updatedTrades);
          router.refresh();
          setErrorMessage(null); 
        } else {
          throw new Error('No trade returned from server');
        }
      } catch (error) {
        console.error('Error adding new trade:', error);
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTrades(filteredTrades.map(trade => trade.id))
    } else {
      setSelectedTrades([])
    }
  }

  const handleSelectTrade = (tradeId: string, checked: boolean) => {
    if (checked) {
      setSelectedTrades(prev => [...prev, tradeId])
    } else {
      setSelectedTrades(prev => prev.filter(id => id !== tradeId))
    }
  }

  const handleDeleteAllSelected = () => {
    setDeleteConfirmation('all')
  }

  const handleStrategyChange = async (tradeId: string, strategyId: string) => {
    try {
      const updatedTrade = trades.find(t => t.id === tradeId);
      if (updatedTrade) {
        updatedTrade.strategy_id = strategyId;
        updatedTrade.setup_id = undefined; 
        await editTrade(updatedTrade);
        setTrades(trades.map(t => t.id === tradeId ? updatedTrade : t));
      }
    } catch (error) {
      console.error('Error updating strategy:', error);
    }
  }

  const handleSetupChange = async (tradeId: string, setupId: string) => {
    try {
      const updatedTrade = trades.find(t => t.id === tradeId);
      if (updatedTrade) {
        updatedTrade.setup_id = setupId;
        await editTrade(updatedTrade);
        setTrades(trades.map(t => t.id === tradeId ? updatedTrade : t));
      }
    } catch (error) {
      console.error('Error updating setup:', error);
    }
  }

  const handleBulkStrategyChange = async (strategyId: string) => {
    try {
      await Promise.all(selectedTrades.map(tradeId => handleStrategyChange(tradeId, strategyId)))
      setBulkStrategyId(null)
    } catch (error) {
      console.error('Error updating strategies:', error)
    }
  }

  const handleBulkSetupChange = async (setupId: string) => {
    try {
      await Promise.all(selectedTrades.map(tradeId => handleSetupChange(tradeId, setupId)))
      setBulkSetupId(null)
    } catch (error) {
      console.error('Error updating setups:', error)
    }
  }

  const indexOfLastTrade = currentPage * tradesPerPage
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage
  const currentTrades = filteredTrades.slice(indexOfFirstTrade, indexOfLastTrade)
  const totalPages = Math.ceil(filteredTrades.length / tradesPerPage)

  const datePresets = [
    { label: 'Last Week', value: { from: subDays(new Date(), 7), to: new Date() } },
    { label: 'Last Month', value: { from: subMonths(new Date(), 1), to: new Date() } },
    { label: 'Last 3 Months', value: { from: subMonths(new Date(), 3), to: new Date() } },
    { label: 'Last Year', value: { from: subYears(new Date(), 1), to: new Date() } },
    { label: 'All Time', value: undefined },
  ]

  const toggleColumn = (column: string) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }))
  }

  const handleOpenNotesDrawer = (trade: Trade) => { 
    setNotesTrade(trade)
    setIsNotesDrawerOpen(true)
  }

  const handleSaveNotes = async (notes: string) => {
    //This function is removed as per the update request
  }

  const clearAllFilters = () => {
    setStatusFilter('all')
    setDirectionFilter('all')
    setSymbolFilter('')
    setDateRange(undefined)
    setNotesFilter('all')
    setSelectedDurationFilter('all');
    setFilteredTrades(trades);
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleDurationFilterChange = (value: string) => {
    setSelectedDurationFilter(value);
    if (value !== 'all') {
      const updatedTrades = trades.filter(trade => {
        const durationMinutes = getDurationInMinutes(trade.placing_time, trade.closing_time);
        switch (value) {
          case 'scalpTrades':
            return durationMinutes >= 0 && durationMinutes <= durationFilters.scalpTrades;
          case 'dayTrades':
            return durationMinutes > durationFilters.scalpTrades && durationMinutes <= durationFilters.dayTrades * 60;
          case 'swingTrades':
            return durationMinutes > durationFilters.dayTrades * 60 && durationMinutes <= durationFilters.swingTrades * 24 * 60;
          case 'positionTrades':
            return durationMinutes > durationFilters.swingTrades * 24 * 60 && durationMinutes <= durationFilters.positionTrades * 7 * 24 * 60;
          default:
            return true;
        }
      });
      setFilteredTrades(updatedTrades);
    } else {
      setFilteredTrades(trades);
    }
  };

  const handleDurationInputChange = (category: keyof typeof durationFilters, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setDurationFilters(prev => ({ ...prev, [category]: numValue }));
    }
  };

  const handleDurationInputBlur = () => {
    handleDurationFilterChange(selectedDurationFilter);
  };

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    if (!sortColumn) return 0
    
    const aValue = a[sortColumn as keyof Trade]
    const bValue = b[sortColumn as keyof Trade]

    if (aValue === undefined || bValue === undefined) return 0

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
    }

    return 0
  })

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex flex-wrap items-center space-x-2">
          <Input
            placeholder="Filter by Symbol"
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value)}
            className="w-[180px] h-10 text-sm"
          />
          <Select onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-10 text-sm">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Win">Win</SelectItem>
              <SelectItem value="Loss">Loss</SelectItem>
              <SelectItem value="Breakeven">Breakeven</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setDirectionFilter}>
            <SelectTrigger className="w-[180px] h-10 text-sm">
              <SelectValue placeholder="Filter by Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Buy">Buy</SelectItem>
              <SelectItem value="Sell">Sell</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setNotesFilter}>
            <SelectTrigger className="w-[180px] h-10 text-sm">
              <SelectValue placeholder="Filter by Notes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trades</SelectItem>
              <SelectItem value="completed">Completed Notes</SelectItem>
              <SelectItem value="incomplete">Incomplete Notes</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={handleDurationFilterChange} value={selectedDurationFilter}>
            <SelectTrigger className="w-[200px] h-10 text-sm">
              <SelectValue placeholder="Filter by Duration">
                {selectedDurationFilter === 'all' ? 'All Durations' :
                 selectedDurationFilter === 'scalpTrades' ? 'Scalp Trades' :
                 selectedDurationFilter === 'dayTrades' ? 'Day Trades' :
                 selectedDurationFilter === 'swingTrades' ? 'Swing Trades' :
                 selectedDurationFilter === 'positionTrades' ? 'Position Trades' : 'Filter by Duration'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Durations</SelectItem>
              <SelectItem value="scalpTrades">
                Scalp Trades
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm">0 mins to</span>
                  <Input
                    type="number"
                    className="w-16 h-8 text-sm"
                    value={durationFilters.scalpTrades}
                    onChange={(e) => handleDurationInputChange('scalpTrades', e.target.value)}
                    onBlur={handleDurationInputBlur}
                  />
                  <span className="text-sm">mins</span>
                </div>
              </SelectItem>
              <SelectItem value="dayTrades">
                Day Trades
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm">{durationFilters.scalpTrades} mins to</span>
                  <Input
                    type="number"
                    className="w-16 h-8 text-sm"
                    value={durationFilters.dayTrades}
                    onChange={(e) => handleDurationInputChange('dayTrades', e.target.value)}
                    onBlur={handleDurationInputBlur}
                  />
                  <span className="text-sm">hours</span>
                </div>
              </SelectItem>
              <SelectItem value="swingTrades">
                Swing Trades
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm">{durationFilters.dayTrades} hours to</span>
                  <Input
                    type="number"
                    className="w-16 h-8 text-sm"
                    value={durationFilters.swingTrades}
                    onChange={(e) => handleDurationInputChange('swingTrades', e.target.value)}
                    onBlur={handleDurationInputBlur}
                  />
                  <span className="text-sm">days</span>
                </div>
              </SelectItem>
              <SelectItem value="positionTrades">
                Position Trades
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm">{durationFilters.swingTrades} days to</span>
                  <Input
                    type="number"
                    className="w-16 h-8 text-sm"
                    value={durationFilters.positionTrades}
                    onChange={(e) => handleDurationInputChange('positionTrades', e.target.value)}
                    onBlur={handleDurationInputBlur}
                  />
                  <span className="text-sm">weeks</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[300px] h-10 justify-start text-left text-sm font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
              <div className="grid grid-cols-2 gap-2 p-2">
                {datePresets.map((preset) => (
                  <Button
                    key={preset.label}
                    onClick={() => setDateRange(preset.value)}
                    variant="outline"
                    className="w-full text-sm"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 text-sm">
                Columns <MoreHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(visibleColumns).map(([key, value]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  className="capitalize"
                  checked={value}
                  onCheckedChange={() => toggleColumn(key)}
                >
                  {key}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {selectedTrades.length > 0 && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 text-sm">
                    Add Strategy
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {strategies.map(strategy => (
                    <DropdownMenuItem key={strategy.strategy_id} onSelect={() => handleBulkStrategyChange(strategy.strategy_id)}>
                      {strategy.strategy_name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 text-sm">
                    Add Setup
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.values(setups).flat().map(setup => (
                    <DropdownMenuItem key={setup.id} onSelect={() => handleBulkSetupChange(setup.id)}>
                      {setup.setup_name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={handleDeleteAllSelected} className="h-10 text-sm hover:bg-destructive hover:text-destructive-foreground">
                Delete All Trades
              </Button>
            </>
          )}
          <Button variant="outline" onClick={clearAllFilters} className="h-10 text-sm">
            Clear All Filters
          </Button>
        </div>
        <Button variant="outline" onClick={handleAddTrade} className="h-10 text-sm">Add Trade</Button>
      </div>
      {errorMessage && ( 
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedTrades.length === filteredTrades.length}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              />
            </TableHead>
            {visibleColumns.symbol && (
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('symbol')} className="h-8 text-xs font-medium">
                  Symbol
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            )}
            {visibleColumns.direction && (
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('side')} className="h-8 text-xs font-medium">
                  Direction
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            )}
            {visibleColumns.size && (
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('qty')} className="h-8 text-xs font-medium">
                  Size
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            )}
            {visibleColumns.openingTime && (
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('placing_time')} className="h-8 text-xs font-medium">
                  Opening Time
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            )}
            {visibleColumns.closingTime && (
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('closing_time')} className="h-8 text-xs font-medium">
                  Closing Time
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            )}
            {visibleColumns.duration && <TableHead>Duration</TableHead>}
            {visibleColumns.entryPrice && (
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('entry_price')} className="h-8 text-xs font-medium">
                  Entry Price
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            )}
            {visibleColumns.exitPrice && (
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('exit_price')} className="h-8 text-xs font-medium">
                  Exit Price
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            )}
            {visibleColumns.netProfit && (
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('net_profit')} className="h-8 text-xs font-medium">
                  Net Profit
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            )}
            {visibleColumns.status && <TableHead>Status</TableHead>}
            {visibleColumns.strategy && <TableHead>Strategy</TableHead>}
            {visibleColumns.setup && <TableHead>Setup</TableHead>}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {newTrade && (
            <TableRow>
              <TableCell><Checkbox disabled /></TableCell>
              {visibleColumns.symbol && <TableCell><Input value={newTrade.symbol || ''} onChange={e => setNewTrade({...newTrade, symbol: e.target.value})} required /></TableCell>}
              {visibleColumns.direction && (
                <TableCell>
                  <Select value={newTrade.side || 'Buy'} onValueChange={value => setNewTrade({...newTrade, side: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Buy">Buy</SelectItem>
                      <SelectItem value="Sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              )}
              {visibleColumns.size && <TableCell><Input type="number" value={newTrade.qty || ''} onChange={e => setNewTrade({...newTrade, qty: Number(e.target.value)})} required /></TableCell>}
              {visibleColumns.openingTime && <TableCell><Input type="datetime-local" value={newTrade.placing_time?.slice(0, 16) || ''} onChange={e => setNewTrade({...newTrade, placing_time: e.target.value})} required /></TableCell>}
              {visibleColumns.closingTime && <TableCell><Input type="datetime-local" value={newTrade.closing_time?.slice(0, 16) || ''} onChange={e => setNewTrade({...newTrade, closing_time: e.target.value})} required /></TableCell>}
              {visibleColumns.duration && <TableCell>-</TableCell>}
              {visibleColumns.entryPrice && <TableCell><Input type="number" value={newTrade.entry_price || ''} onChange={e => setNewTrade({...newTrade, entry_price: Number(e.target.value)})} required /></TableCell>}
              {visibleColumns.exitPrice && <TableCell><Input type="number" value={newTrade.exit_price || ''} onChange={e => setNewTrade({...newTrade, exit_price: Number(e.target.value)})} required /></TableCell>}
              {visibleColumns.netProfit && <TableCell>-</TableCell>}
              {visibleColumns.status && <TableCell>-</TableCell>}
              {visibleColumns.strategy && (
                <TableCell>
                  <Select value={newTrade.strategy_id || ''} onValueChange={value => setNewTrade({...newTrade, strategy_id: value, setup_id: undefined})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map(strategy => (
                        <SelectItem key={strategy.strategy_id} value={strategy.strategy_id}>{strategy.strategy_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              )}
              {visibleColumns.setup && (
                <TableCell>
                  <Select value={newTrade.setup_id || ''} onValueChange={value => setNewTrade({...newTrade, setup_id: value})} disabled={!newTrade.strategy_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Setup" />
                    </SelectTrigger>
                    <SelectContent>
                      {newTrade.strategy_id && setups[newTrade.strategy_id]?.map(setup => (
                        <SelectItem key={setup.id} value={setup.id}>{setup.setup_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              )}
              <TableCell>
                <Button variant="outline" onClick={handleSaveNewTrade}>Save</Button>
              </TableCell>
            </TableRow>
          )}
          {sortedTrades.slice(indexOfFirstTrade, indexOfLastTrade).map((trade) => (
            <TableRow key={trade.id} className="h-12">
              <TableCell>
                <Checkbox
                  checked={selectedTrades.includes(trade.id)}
                  onCheckedChange={(checked) => handleSelectTrade(trade.id, checked as boolean)}
                />
              </TableCell>
              {visibleColumns.symbol && <TableCell>{editingId === trade.id ? <Input value={trade.symbol} onChange={e => setTrades(trades.map(t => t.id === trade.id ? {...t, symbol: e.target.value} : t))} /> : trade.symbol}</TableCell>}
              {visibleColumns.direction && (
                <TableCell>{editingId === trade.id ? 
                  <Select value={trade.side} onValueChange={value => setTrades(trades.map(t => t.id === trade.id ? {...t, side: value} : t))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Buy">Buy</SelectItem>
                      <SelectItem value="Sell">Sell</SelectItem>
                    </SelectContent>
                  </Select> 
                  : trade.side}
                </TableCell>
              )}
              {visibleColumns.size && <TableCell>{editingId === trade.id ? <Input type="number" value={trade.qty} onChange={e => setTrades(trades.map(t => t.id === trade.id ? {...t, qty: Number(e.target.value)} : t))} /> : trade.qty}</TableCell>}
              {visibleColumns.openingTime && <TableCell>{editingId === trade.id ? <Input type="datetime-local" value={trade.placing_time.slice(0, 16)} onChange={e => setTrades(trades.map(t => t.id === trade.id ? {...t, placing_time: e.target.value} : t))} /> : new Date(trade.placing_time).toLocaleString()}</TableCell>}
              {visibleColumns.closingTime && <TableCell>{editingId === trade.id ? <Input type="datetime-local" value={trade.closing_time.slice(0, 16)} onChange={e => setTrades(trades.map(t => t.id === trade.id ? {...t, closing_time: e.target.value} : t))} /> : new Date(trade.closing_time).toLocaleString()}</TableCell>}
              {visibleColumns.duration && <TableCell>{calculateDuration(trade.placing_time, trade.closing_time)}</TableCell>}
              {visibleColumns.entryPrice && <TableCell>{editingId === trade.id ? <Input type="number" value={trade.entry_price} onChange={e => setTrades(trades.map(t => t.id === trade.id ? {...t, entry_price: Number(e.target.value)} : t))} /> : trade.entry_price.toFixed(5)}</TableCell>}
              {visibleColumns.exitPrice && <TableCell>{editingId === trade.id ? <Input type="number" value={trade.exit_price} onChange={e => setTrades(trades.map(t => t.id === trade.id ? {...t, exit_price: Number(e.target.value)} : t))} /> : trade.exit_price.toFixed(5)}</TableCell>}
              {visibleColumns.netProfit && (
                <TableCell className={getNetProfitStyle(trade.net_profit)}>
                  {trade.net_profit >= 0 ? `$${trade.net_profit.toFixed(2)}` : `-$${Math.abs(trade.net_profit).toFixed(2)}`}
                </TableCell>
              )}
              {visibleColumns.status && (
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(trade.net_profit)}`}>
                    {getStatusText(trade.net_profit)}
                  </span>
                </TableCell>
              )}
              {visibleColumns.strategy && (
                <TableCell>
                  <Select 
                    value={trade.strategy_id || ''} 
                    onValueChange={(value) => handleStrategyChange(trade.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map(strategy => (
                        <SelectItem key={strategy.strategy_id} value={strategy.strategy_id}>{strategy.strategy_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              )}
              {visibleColumns.setup && (
                <TableCell>
                  <Select 
                    value={trade.setup_id || ''} 
                    onValueChange={(value) => handleSetupChange(trade.id, value)}
                    disabled={!trade.strategy_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Setup" />
                    </SelectTrigger>
                    <SelectContent>
                      {trade.strategy_id && setups[trade.strategy_id]?.map(setup => (
                        <SelectItem key={setup.id} value={setup.id}>{setup.setup_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              )}
              <TableCell>
                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {editingId === trade.id ? (
                          <Button variant="outline" size="icon" onClick={() => handleSave(trade)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="icon" onClick={() => handleEdit(trade.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Trade</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => handleOpenNotesDrawer(trade)} className="relative">
                          <StickyNote className="h-4 w-4" />
                          {trade.notes && (
                            <div className="absolute -top-1 -right-1 bg-[#03b198] rounded-full p-0.5">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add Trade Notes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Dialog open={deleteConfirmation === trade.id} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmation(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="hover:bg-destructive hover:text-destructive-foreground" size="icon" onClick={() => handleDelete(trade.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this trade? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>Cancel</Button>
                              <Button variant="destructive" onClick={() => confirmDelete([trade.id])}>Delete</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Trade</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <div>
          Showing {indexOfFirstTrade + 1} to {Math.min(indexOfLastTrade, sortedTrades.length)} of {sortedTrades.length} trades
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(sortedTrades.length / tradesPerPage)))}
            disabled={currentPage === Math.ceil(sortedTrades.length / tradesPerPage)}
          >
            Next
          </Button>
        </div>
      </div>
      <Dialog open={deleteConfirmation === 'all'} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all selected trades? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>Cancel</Button>
            <Button variant="destructive"onClick={() => confirmDelete(selectedTrades)}>Delete All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TradeNotes
        trade={notesTrade} 
        isOpen={isNotesDrawerOpen}
        onOpenChange={setIsNotesDrawerOpen}
        onNotesUpdate={(updatedTrade) => {
          setTrades(trades.map(t => t.id === updatedTrade.id? updatedTrade : t))
        }}
      />
    </div>
  )
}

