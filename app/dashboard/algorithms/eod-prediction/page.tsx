import { Suspense } from "react"
import EODPredictionDashboard from "./components/eod-prediction-dashboard"

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
          Loading...
        </div>
      }
    >
      <EODPredictionDashboard />
    </Suspense>
  )
}