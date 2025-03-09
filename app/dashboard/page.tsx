import MarketTrendsAllTable from "./components/Table"
import dynamic from "next/dynamic"
import { getPolygonData } from "./hooks/usePolygonData"
import { Seasonality } from "./components/SeasonalityChart"
import { CommitmentOfTraders } from "./components/commitment-of-traders"
import { EconomicIndicators } from "./components/economic-indicators"
import { EconomicNews } from "./components/economic-news"
import { AssetStrength } from "./components/asset-strength"

const Chart = dynamic(() => import("./components/Chart"), { ssr: false })

export default async function Dashboard() {
  let data, error

  try {
    data = await getPolygonData()
  } catch (err) {
    error = err instanceof Error ? err.message : "An error occurred"
  }

  if (error) return <div className="flex items-center justify-center h-screen">Error: {error}</div>
  return (
    <div className="p-2 space-y-4">
      {/* Row 1: First 3 components */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/3">
          <MarketTrendsAllTable />
        </div>
        <div className="w-full lg:w-1/3 min-w-fit">
          {data ? <Chart data={data} /> : <div className="flex items-center justify-center h-full">Loading...</div>}
        </div>
        <div className="w-full lg:w-1/3">
          <Seasonality />
          <AssetStrength />
        </div>
      </div>

      {/* Row 2: CommitmentOfTraders component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="w-full">
          <EconomicIndicators />
        </div>
        <div className="w-full">
          <CommitmentOfTraders />
        </div>
        <div className="w-[75%] ml-40">
          <EconomicNews />
        </div>
      </div>
    </div>
  )
}

