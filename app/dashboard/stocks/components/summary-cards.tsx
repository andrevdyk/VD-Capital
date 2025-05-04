import type { Stock, IndustrySummary } from "../types/stock"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Building2, Factory } from "lucide-react"

interface SummaryCardsProps {
  topGainer: Stock | null
  topLoser: Stock | null
  topIndustry: IndustrySummary | null
  worstIndustry: IndustrySummary | null
}

export default function SummaryCards({ topGainer, topLoser, topIndustry, worstIndustry }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Gainer</CardTitle>
          <TrendingUp className="h-4 w-4 text-[#03b198]" />
        </CardHeader>
        <CardContent>
          {topGainer ? (
            <>
              <div className="text-2xl font-bold">{topGainer.symbol}</div>
              <p className="text-xs text-muted-foreground truncate">{topGainer.companyName}</p>
              <div className="mt-2 flex items-center">
                <span className="text-[#03b198] font-semibold">+{topGainer.changePercent}%</span>
                <span className="ml-2 text-sm text-muted-foreground">${topGainer.price}</span>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No data available</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Loser</CardTitle>
          <TrendingDown className="h-4 w-4 text-[#ff2f67]" />
        </CardHeader>
        <CardContent>
          {topLoser ? (
            <>
              <div className="text-2xl font-bold">{topLoser.symbol}</div>
              <p className="text-xs text-muted-foreground truncate">{topLoser.companyName}</p>
              <div className="mt-2 flex items-center">
                <span className="text-[#ff2f67] font-semibold">{topLoser.changePercent}%</span>
                <span className="ml-2 text-sm text-muted-foreground">${topLoser.price}</span>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No data available</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Industry</CardTitle>
          <Building2 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {topIndustry ? (
            <>
              <div className="text-2xl font-bold truncate">{topIndustry.name}</div>
              <p className="text-xs text-muted-foreground">{topIndustry.stockCount} stocks</p>
              <div className="mt-2 flex items-center">
                <span className="text-[#03b198] font-semibold">+{topIndustry.averageChange.toFixed(2)}%</span>
                <span className="ml-2 text-sm text-muted-foreground">avg. change</span>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No data available</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Worst Industry</CardTitle>
          <Factory className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          {worstIndustry ? (
            <>
              <div className="text-2xl font-bold truncate">{worstIndustry.name}</div>
              <p className="text-xs text-muted-foreground">{worstIndustry.stockCount} stocks</p>
              <div className="mt-2 flex items-center">
                <span className="text-[#ff2f67] font-semibold">{worstIndustry.averageChange.toFixed(2)}%</span>
                <span className="ml-2 text-sm text-muted-foreground">avg. change</span>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

