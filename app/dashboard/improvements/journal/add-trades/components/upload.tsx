'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Papa from 'papaparse'

export default function CSVUploader({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])

  const supabase = createClientComponentClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setPreviewData([])
      setError(null)
      setSuccess(false)
    }
  }

  const parseCSV = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && Array.isArray(results.data)) {
            resolve(results.data as any[])
          } else {
            reject(new Error('Failed to parse CSV file or no data found'))
          }
        },
        error: reject,
        header: true,
      })
    })
  }

  const processTrades = (parsedData: any[]): any[] => {
    const trades: Record<string, any[]> = {}
    parsedData.forEach((row: any) => {
      if (row.Symbol && row.Status === 'Filled') {
        const symbol = row.Symbol
        if (!trades[symbol]) trades[symbol] = []
        trades[symbol].push(row)
      }
    })

    const tradingData = []

    for (const symbol in trades) {
      const tradeRows = trades[symbol]
      let i = 0

      while (i < tradeRows.length) {
        const entryRow = tradeRows[i]
        if (
          !entryRow ||
          (entryRow.Side !== 'Buy' && entryRow.Side !== 'Sell') ||
          !entryRow['Fill Price']
        ) {
          i++
          continue
        }

        const exitRow = tradeRows.find(
          (row, idx) =>
            idx > i &&
            row.Side !== entryRow.Side &&
            row.Symbol === entryRow.Symbol &&
            row.Status === 'Filled' &&
            row['Fill Price']
        )

        if (exitRow) {
          const qty = parseFloat(entryRow.Qty)
          const entryPrice = parseFloat(entryRow['Fill Price'])
          const exitPrice = parseFloat(exitRow['Fill Price'])
          const commissionEntry = entryRow.Commission ? parseFloat(entryRow.Commission) : 0
          const commissionExit = exitRow.Commission ? parseFloat(exitRow.Commission) : 0

          if (!qty || !entryPrice || !exitPrice) {
            console.warn('Skipping row due to missing required data:', { entryRow, exitRow })
            i++
            continue
          }

          const multiplier = entryRow.Side === 'Buy' ? 1 : -1
          const netProfit = ((exitPrice - entryPrice) * multiplier * qty) - (commissionEntry + commissionExit)

          tradingData.push({
            user_id: userId,
            broker: "TradingView",
            symbol: entryRow.Symbol,
            side: entryRow.Side,
            entry_type: entryRow.Type,
            exit_type: exitRow.Type,
            qty,
            entry_price: entryPrice,
            exit_price: exitPrice,
            status: exitRow.Status,
            commission: commissionEntry + commissionExit,
            placing_time: new Date(entryRow['Placing Time']),
            closing_time: new Date(exitRow['Closing Time']),
            order_id: entryRow['Order ID'],
            net_profit: netProfit,
          })

          tradeRows.splice(tradeRows.indexOf(exitRow), 1)
        }

        i++
      }
    }

    return tradingData
  }

  const handlePreview = async () => {
    if (!file) {
      setError('Please select a CSV file')
      return
    }

    try {
      const parsedData = await parseCSV(file)
      const processedData = processTrades(parsedData)
      setPreviewData(processedData.slice(0, 5)) // Show first 5 trades as preview
    } catch (error: any) {
      console.error('Error parsing CSV:', error)
      setError(error.message || 'An error occurred while parsing the CSV file')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const parsedData = await parseCSV(file)
      const tradingData = processTrades(parsedData)

      if (tradingData.length === 0) {
        throw new Error('No valid trade data found')
      }

      // Insert data into the database in batches
      const BATCH_SIZE = 100
      for (let i = 0; i < tradingData.length; i += BATCH_SIZE) {
        const batch = tradingData.slice(i, i + BATCH_SIZE)
        const { error } = await supabase.from('trading_history').insert(batch)
        if (error) throw error
      }
      setSuccess(true)
    } catch (error: any) {
      console.error('Error uploading trading data:', error)
      setError(error.message || 'An unknown error occurred while uploading data')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Upload Trading History</h2>
        <p className="text-sm text-muted-foreground">
          Please select a CSV file with columns: Symbol, Side, Type, Qty, Fill Price, Status, Commission, Placing Time, Closing Time, Order ID
        </p>
      </div>
      <Input 
        type="file" 
        accept=".csv" 
        onChange={handleFileChange} 
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
      />
      <div className="flex space-x-2">
        <Button 
          onClick={handlePreview} 
          disabled={!file}
          className="flex-1"
        >
          Preview
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="flex-1"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-500">Trading data uploaded successfully!</p>}
      {previewData.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Preview (First 5 Trades)</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Entry Price</TableHead>
                  <TableHead>Exit Price</TableHead>
                  <TableHead>Net Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((trade, index) => (
                  <TableRow key={index}>
                    <TableCell>{trade.symbol}</TableCell>
                    <TableCell>{trade.side}</TableCell>
                    <TableCell>{trade.qty}</TableCell>
                    <TableCell>{trade.entry_price.toFixed(5)}</TableCell>
                    <TableCell>{trade.exit_price.toFixed(5)}</TableCell>
                    <TableCell>{trade.net_profit.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}

