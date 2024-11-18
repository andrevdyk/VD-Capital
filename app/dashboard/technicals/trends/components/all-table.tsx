import React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

const marketTrends = [
  { asset: "AAPL (Stock)", currentValue: "$156.25", ytdChange: "15.32%", quarterChange: "7.65%", weekChange: "2.1%", dayChange: "0.5%", hourlyChange: "0.12%", status: "Bullish" },
  { asset: "Gold (Commodity)", currentValue: "$1,845.30", ytdChange: "1.75%", quarterChange: "3.21%", weekChange: "-0.8%", dayChange: "-0.3%", hourlyChange: "0.05%", status: "Neutral" },
  { asset: "EUR/USD (Currency Pair)", currentValue: "1.1856", ytdChange: "-2.95%", quarterChange: "-1.23%", weekChange: "0.45%", dayChange: "0.1%", hourlyChange: "-0.02%", status: "Bearish" },
  { asset: "BTC (Crypto)", currentValue: "$34,250.00", ytdChange: "18.50%", quarterChange: "25.30%", weekChange: "-5.2%", dayChange: "1.8%", hourlyChange: "0.75%", status: "Very Bullish" },
  { asset: "Crude Oil (Commodity)", currentValue: "$68.72", ytdChange: "41.63%", quarterChange: "12.45%", weekChange: "3.7%", dayChange: "-0.9%", hourlyChange: "-0.15%", status: "Bullish" },
  { asset: "MSFT (Stock)", currentValue: "$305.52", ytdChange: "22.15%", quarterChange: "5.32%", weekChange: "1.8%", dayChange: "0.3%", hourlyChange: "0.08%", status: "Very Bullish" },
  { asset: "Silver (Commodity)", currentValue: "$24.17", ytdChange: "-8.52%", quarterChange: "-2.15%", weekChange: "-1.2%", dayChange: "-0.5%", hourlyChange: "0.02%", status: "Bearish" },
  { asset: "GBP/JPY (Currency Pair)", currentValue: "152.68", ytdChange: "5.23%", quarterChange: "2.15%", weekChange: "0.75%", dayChange: "0.2%", hourlyChange: "0.03%", status: "Bullish" },
  { asset: "ETH (Crypto)", currentValue: "$2,245.80", ytdChange: "205.32%", quarterChange: "35.25%", weekChange: "-8.5%", dayChange: "2.5%", hourlyChange: "1.02%", status: "Very Bullish" },
  { asset: "Natural Gas (Commodity)", currentValue: "$3.12", ytdChange: "22.83%", quarterChange: "15.23%", weekChange: "-2.5%", dayChange: "1.2%", hourlyChange: "0.35%", status: "Bullish" },
  { asset: "GOOGL (Stock)", currentValue: "$2,430.20", ytdChange: "38.52%", quarterChange: "18.35%", weekChange: "3.2%", dayChange: "0.8%", hourlyChange: "0.15%", status: "Very Bullish" },
  { asset: "Copper (Commodity)", currentValue: "$4.28", ytdChange: "21.59%", quarterChange: "8.75%", weekChange: "-1.5%", dayChange: "-0.7%", hourlyChange: "-0.12%", status: "Neutral" },
  { asset: "USD/CAD (Currency Pair)", currentValue: "1.2463", ytdChange: "-2.15%", quarterChange: "-1.85%", weekChange: "0.35%", dayChange: "-0.1%", hourlyChange: "-0.01%", status: "Bearish" },
  { asset: "XRP (Crypto)", currentValue: "$0.8523", ytdChange: "285.32%", quarterChange: "-15.25%", weekChange: "-12.5%", dayChange: "-3.5%", hourlyChange: "-0.85%", status: "Neutral" },
  { asset: "Wheat (Commodity)", currentValue: "$680.25", ytdChange: "6.32%", quarterChange: "12.85%", weekChange: "2.3%", dayChange: "0.5%", hourlyChange: "0.08%", status: "Bullish" },
  { asset: "AMZN (Stock)", currentValue: "$3,510.98", ytdChange: "7.69%", quarterChange: "11.25%", weekChange: "-1.2%", dayChange: "-0.3%", hourlyChange: "-0.05%", status: "Bullish" },
  { asset: "Platinum (Commodity)", currentValue: "$1,128.60", ytdChange: "5.23%", quarterChange: "-2.35%", weekChange: "-3.5%", dayChange: "-1.2%", hourlyChange: "-0.25%", status: "Bearish" },
  { asset: "AUD/USD (Currency Pair)", currentValue: "0.7523", ytdChange: "-2.35%", quarterChange: "-1.25%", weekChange: "0.85%", dayChange: "0.3%", hourlyChange: "0.05%", status: "Neutral" },
  { asset: "DOGE (Crypto)", currentValue: "$0.2231", ytdChange: "4521.35%", quarterChange: "-25.35%", weekChange: "-18.5%", dayChange: "-5.2%", hourlyChange: "-1.35%", status: "Very Bearish" },
  { asset: "Coffee (Commodity)", currentValue: "$156.55", ytdChange: "22.35%", quarterChange: "15.25%", weekChange: "3.5%", dayChange: "1.2%", hourlyChange: "0.35%", status: "Very Bullish" },
  { asset: "FB (Stock)", currentValue: "$336.58", ytdChange: "23.15%", quarterChange: "9.85%", weekChange: "2.5%", dayChange: "0.7%", hourlyChange: "0.18%", status: "Bullish" },
  { asset: "Palladium (Commodity)", currentValue: "$2,725.50", ytdChange: "11.52%", quarterChange: "-8.35%", weekChange: "-2.5%", dayChange: "-1.5%", hourlyChange: "-0.35%", status: "Neutral" },
  { asset: "USD/JPY (Currency Pair)", currentValue: "110.23", ytdChange: "6.75%", quarterChange: "2.35%", weekChange: "0.65%", dayChange: "0.2%", hourlyChange: "0.03%", status: "Bullish" },
  { asset: "ADA (Crypto)", currentValue: "$1.3256", ytdChange: "691.23%", quarterChange: "15.35%", weekChange: "-10.5%", dayChange: "-2.5%", hourlyChange: "-0.75%", status: "Bullish" },
  { asset: "Corn (Commodity)", currentValue: "$558.50", ytdChange: "15.32%", quarterChange: "8.75%", weekChange: "1.5%", dayChange: "0.3%", hourlyChange: "0.05%", status: "Bullish" },
  { asset: "TSLA (Stock)", currentValue: "$650.60", ytdChange: "-7.85%", quarterChange: "-15.25%", weekChange: "-3.5%", dayChange: "-1.2%", hourlyChange: "-0.35%", status: "Bearish" },
  { asset: "Aluminum (Commodity)", currentValue: "$2,452.25", ytdChange: "23.58%", quarterChange: "12.35%", weekChange: "2.5%", dayChange: "0.8%", hourlyChange: "0.15%", status: "Very Bullish" },
  { asset: "EUR/GBP (Currency Pair)", currentValue: "0.8568", ytdChange: "-4.25%", quarterChange: "-1.85%", weekChange: "-0.35%", dayChange: "-0.1%", hourlyChange: "-0.02%", status: "Bearish" },
  { asset: "DOT (Crypto)", currentValue: "$15.23", ytdChange: "212.35%", quarterChange: "-18.75%", weekChange: "-15.5%", dayChange: "-3.8%", hourlyChange: "-1.05%", status: "Neutral" },
  { asset: "Soybeans (Commodity)", currentValue: "$1,385.25", ytdChange: "5.32%", quarterChange: "12.35%", weekChange: "2.8%", dayChange: "0.7%", hourlyChange: "0.12%", status: "Bullish" },
  { asset: "NVDA (Stock)", currentValue: "$745.55", ytdChange: "42.35%", quarterChange: "25.75%", weekChange: "5.2%", dayChange: "1.5%", hourlyChange: "0.45%", status: "Very Bullish" },
  { asset: "Cotton (Commodity)", currentValue: "$87.23", ytdChange: "11.52%", quarterChange: "8.35%", weekChange: "1.5%", dayChange: "0.3%", hourlyChange: "0.05%", status: "Bullish" },
  { asset: "USD/CHF (Currency Pair)", currentValue: "0.9185", ytdChange: "3.75%", quarterChange: "1.25%", weekChange: "0.45%", dayChange: "0.1%", hourlyChange: "0.02%", status: "Neutral" },
  { asset: "LINK (Crypto)", currentValue: "$18.56", ytdChange: "65.32%", quarterChange: "-22.35%", weekChange: "-18.5%", dayChange: "-5.2%", hourlyChange: "-1.35%", status: "Bearish" },
  { asset: "Sugar (Commodity)", currentValue: "$17.85", ytdChange: "15.23%", quarterChange: "8.75%", weekChange: "1.8%", dayChange: "0.5%", hourlyChange: "0.08%", status: "Bullish" },
  { asset: "JPM (Stock)", currentValue: "$155.48", ytdChange: "22.35%", quarterChange: "5.75%", weekChange: "1.5%", dayChange: "0.3%", hourlyChange: "0.05%", status: "Bullish" },
  { asset: "Nickel (Commodity)", currentValue: "$18,125.00", ytdChange: "9.52%", quarterChange: "12.35%", weekChange: "2.5%", dayChange: "0.8%", hourlyChange: "0.15%", status: "Bullish" },
  { asset: "GBP/USD (Currency Pair)", currentValue: "1.3856", ytdChange: "1.45%", quarterChange: "0.85%", weekChange: "0.25%", dayChange: "0.05%", hourlyChange: "0.01%", status: "Neutral" },
  { asset: "UNI (Crypto)", currentValue: "$21.23", ytdChange: "352.35%", quarterChange: "-28.75%", weekChange: "-22.5%", dayChange: "-6.8%", hourlyChange: "-2.05%", status: "Very Bearish" },
  { asset: "Cocoa (Commodity)", currentValue: "$2,425.00", ytdChange: "-5.32%", quarterChange: "-2.35%", weekChange: "-1.8%", dayChange: "-0.5%", hourlyChange: "-0.08%", status: "Bearish" },
  { asset: "V (Stock)", currentValue: "$238.65", ytdChange: "9.35%", quarterChange: "5.75%", weekChange: "1.2%", dayChange: "0.3%", hourlyChange: "0.05%", status: "Bullish" },
  { asset: "Zinc (Commodity)", currentValue: "$2,985.75", ytdChange: "8.52%", quarterChange: "5.35%", weekChange: "1.5%", dayChange: "0.3%", hourlyChange: "0.05%", status: "Bullish" },
  { asset: "AUD/JPY (Currency Pair)", currentValue: "82.95", ytdChange: "4.25%", quarterChange: "1.85%", weekChange: "0.65%", dayChange: "0.2%", hourlyChange: "0.03%", status: "Bullish" },
  { asset: "SOL (Crypto)", currentValue: "$37.85", ytdChange: "1985.32%", quarterChange: "125.35%", weekChange: "-25.5%", dayChange: "-8.2%", hourlyChange: "-2.35%", status: "Neutral" },
  { asset: "Orange Juice (Commodity)", currentValue: "$112.15", ytdChange: "-8.32%", quarterChange: "-5.35%", weekChange: "-2.8%", dayChange: "-0.7%", hourlyChange: "-0.12%", status: "Bearish" },
  { asset: "BA (Stock)", currentValue: "$239.59", ytdChange: "12.35%", quarterChange: "8.75%", weekChange: "2.5%", dayChange: "0.8%", hourlyChange: "0.15%", status: "Bullish" },
  { asset: "Lead (Commodity)", currentValue: "$2,185.50", ytdChange: "10.52%", quarterChange: "5.35%", weekChange: "1.5%", dayChange: "0.3%", hourlyChange: "0.05%", status: "Bullish" },
  { asset: "NZD/USD (Currency Pair)", currentValue: "0.7023", ytdChange: "-2.25%", quarterChange: "-1.35%", weekChange: "0.45%", dayChange: "0.1%", hourlyChange: "0.02%", status: "Neutral" },
  { asset: "MATIC (Crypto)", currentValue: "$1.12", ytdChange: "7825.32%", quarterChange: "85.35%", weekChange: "-18.5%", dayChange: "-5.2%", hourlyChange: "-1.35%", status: "Bullish" },
  { asset: "Lean Hogs (Commodity)", currentValue: "$82.35", ytdChange: "18.32%", quarterChange: "12.35%", weekChange: "2.8%", dayChange: "0.7%", hourlyChange: "0.12%", status: "Very Bullish" },
  { asset: "DIS (Stock)", currentValue: "$178.35", ytdChange: "-1.65%", quarterChange: "-5.25%", weekChange: "-2.5%", dayChange: "-0.8%", hourlyChange: "-0.15%", status: "Bearish" },
  { asset: "Tin (Commodity)", currentValue: "$31,745.00", ytdChange: "52.35%", quarterChange: "18.75%", weekChange: "3.5%", dayChange: "1.2%", hourlyChange: "0.25%", status: "Very Bullish" }
]

export default function MarketTrendsAllTable() {
  return (
    <Card className="flex flex-col w-fit h-[535px]">
      <CardHeader className="flex items-center  space-y-0 border-b py-2 sm:flex-row ">
        <div className="grid flex-1 text-left text-sm">
          <span>Trend Overview</span>
        </div>
      </CardHeader>
      <CardContent className=" w-fit overflow-y-scroll">
      <div className="border-b">     
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-fit">Asset</TableHead>
              <TableHead>Ask</TableHead>
              <TableHead>YTD</TableHead>
              <TableHead>Quarter</TableHead>
              <TableHead>Week</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Hourly</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketTrends.map((trend) => (
              <TableRow key={trend.asset}>
                <TableCell className="font-medium">{trend.asset}</TableCell>
                <TableCell>{trend.currentValue}</TableCell>
                <TableCell className={getChangeClass(trend.ytdChange)}>{trend.ytdChange}</TableCell>
                <TableCell className={getChangeClass(trend.quarterChange)}>{trend.quarterChange}</TableCell>
                <TableCell className={getChangeClass(trend.weekChange)}>{trend.weekChange}</TableCell>
                <TableCell className={getChangeClass(trend.dayChange)}>{trend.dayChange}</TableCell>
                <TableCell className={getChangeClass(trend.hourlyChange)}>{trend.hourlyChange}</TableCell>
                <TableCell className={getStatusClass(trend.status)}>{trend.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </CardContent>
      </Card>
  )
}

function getChangeClass(change: string) {
  const value = parseFloat(change)
  return value > 0 ? 'text-[#03b198]' : value < 0 ? 'text-[#ff2f67]' : ''
}

function getStatusClass(status: string) {
  switch (status) {
    case 'Very Bullish':
      return 'text-[#03b198]'
    case 'Bullish':
      return 'text-[#03b198]'
    case 'Neutral':
      return 'text-gray-300'
    case 'Bearish':
      return 'text-[#ff2f67]'
    case 'Very Bearish':
      return 'text-[#ff2f67]'
    default:
      return ''
  }
}