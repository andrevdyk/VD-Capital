"use client"

import { useState, useEffect } from "react"
import type { Stock, IndustrySummary } from "../types/stock"
import SummaryCards from "./summary-cards"
import StockTable from "./stock-table"

export default function StockDashboard() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Summary data
  const [topGainer, setTopGainer] = useState<Stock | null>(null)
  const [topLoser, setTopLoser] = useState<Stock | null>(null)
  const [topIndustry, setTopIndustry] = useState<IndustrySummary | null>(null)
  const [worstIndustry, setWorstIndustry] = useState<IndustrySummary | null>(null)

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/stocks")

        if (!response.ok) {
          throw new Error("Failed to fetch stock data")
        }

        const data = await response.json()

        // For demo purposes, let's add a random change percent to each stock
        // In a real app, you would get this from the API
        const stocksWithChange = data.map((stock: Stock) => ({
          ...stock,
          changePercent: (Math.random() * 10 - 5).toFixed(2), // Random value between -5% and +5%
        }))

        setStocks(stocksWithChange)

        // Calculate summary data
        calculateSummaryData(stocksWithChange)
      } catch (err) {
        setError("Failed to load stock data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStocks()
  }, [])

  const calculateSummaryData = (stocks: Stock[]) => {
    // Find top gainer and loser
    const sortedByChange = [...stocks].sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))

    setTopGainer(sortedByChange[0] || null)
    setTopLoser(sortedByChange[sortedByChange.length - 1] || null)

    // Calculate industry performance
    const industryPerformance = stocks.reduce((acc: Record<string, { totalChange: number; count: number }>, stock) => {
      if (!stock.industry) return acc

      if (!acc[stock.industry]) {
        acc[stock.industry] = { totalChange: 0, count: 0 }
      }

      acc[stock.industry].totalChange += stock.changePercent || 0
      acc[stock.industry].count += 1

      return acc
    }, {})

    // Convert to array and calculate average
    const industryArray = Object.entries(industryPerformance).map(([name, data]) => ({
      name,
      averageChange: data.totalChange / data.count,
      stockCount: data.count,
    }))

    // Sort by average change
    const sortedIndustries = industryArray.sort((a, b) => b.averageChange - a.averageChange)

    // Only consider industries with at least 2 stocks
    const validIndustries = sortedIndustries.filter((ind) => ind.stockCount >= 2)

    setTopIndustry(validIndustries[0] || null)
    setWorstIndustry(validIndustries[validIndustries.length - 1] || null)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading stock data...</div>
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>
  }

  return (
    <div className="space-y-8">
      <SummaryCards topGainer={topGainer} topLoser={topLoser} topIndustry={topIndustry} worstIndustry={worstIndustry} />
      <StockTable stocks={stocks} />
    </div>
  )
}

