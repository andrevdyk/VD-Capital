import { Suspense } from "react"
import StockDashboard from "./components/stock-dashboard"

export default function Home() {
  return (
    <main className="mx-auto px-4 py-4">
      <Suspense fallback={null}>
        <StockDashboard />
      </Suspense>
    </main>
  )
}