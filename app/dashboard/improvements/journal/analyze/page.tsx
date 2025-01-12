import { AddTradesButton } from "../components/add-trades-button"
import { JournalNavigation } from "../components/journal-navigation"
import { getTradingHistory } from "../reflect/actions/getTradingHistory"
import { getStrategiesAndSetups } from "../reflect/actions/getStrategiesAndSetups"
import { AnalyzePageClient } from "./components/AnalyzePageClient"

export default async function AnalyzePage() {
  const trades = await getTradingHistory()
  const { strategies, setups } = await getStrategiesAndSetups()

  return (
    <div className="flex flex-col h-auto">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <main>
            <AnalyzePageClient initialTrades={trades || []} strategies={strategies} setups={setups} />
          </main>
        </div>
      </div>
    </div>
  )
}

