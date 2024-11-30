'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Papa from 'papaparse'

export default function CSVUploader({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClientComponentClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
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
      const results = await new Promise<Papa.ParseResult<unknown>>((resolve, reject) => {
        Papa.parse(file, {
          complete: resolve,
          error: reject,
          header: true,
        })
      })

      if (results.data && Array.isArray(results.data)) {
        const tradingData = results.data.map((row: any) => ({
          user_id: userId,
          broker: "TradingView",
          symbol: row.Symbol,
          side: row.Side,
          type: row.Type,
          qty: parseFloat(row.Qty),
          price: parseFloat(row.Price),
          fill_price: row["Fill Price"] ? parseFloat(row["Fill Price"]) : null,
          status: row.Status,
          commission: row.Commission ? parseFloat(row.Commission) : null,
          placing_time: new Date(row["Placing Time"]),
          closing_time: row["Closing Time"] ? new Date(row["Closing Time"]) : null,
          order_id: row["Order ID"],
        }))

        const { error } = await supabase
          .from('trading_history')
          .insert(tradingData)

        if (error) throw error

        setSuccess(true)
      }
    } catch (error) {
      console.error('Error uploading trading data:', error)
      setError('Failed to upload trading data. Please ensure your CSV matches the required format.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Upload Trading History</h2>
        <p className="text-sm text-muted-foreground">
          Please select a CSV file with columns: Symbol, Side, Type, Qty, Price, Fill Price, Status, Commission, Placing Time, Closing Time, Order ID
        </p>
      </div>
      <Input 
        type="file" 
        accept=".csv" 
        onChange={handleFileChange} 
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
      />
      <Button 
        onClick={handleUpload} 
        disabled={!file || uploading}
        className="w-full"
      >
        {uploading ? 'Uploading Trading Data...' : 'Upload CSV'}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-500">Trading data uploaded successfully!</p>}
    </div>
  )
}
