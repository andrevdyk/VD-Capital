import MarketTrendsAllTable from "./components/Table"
import dynamic from "next/dynamic"
import { getPolygonData } from "./hooks/usePolygonData"

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
    <div className="p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-1/3">
          <MarketTrendsAllTable />
        </div>
        <div className="w-2/3">
          {data ? <Chart data={data} /> : <div className="flex items-center justify-center h-full">Loading...</div>}
        </div>
      </div>
    </div>
  )
}

