import { AddTradesButton } from "../components/add-trades-button"
import { JournalNavigation } from "../components/journal-navigation"
import { getTradingHistory } from "../reflect/actions/getTradingHistory"
import { getStrategiesAndSetups } from "../reflect/actions/getStrategiesAndSetups"
import { AnalyzePageClient } from "./components/AnalyzePageClient"

export default async function AnalyzePage() {
  const trades = await getTradingHistory()
  const { strategies, setups } = await getStrategiesAndSetups()

  return (
    <div className="flex flex-col h-screen">
      <div className="h-14 lg:h-[55px] border-b w-full bg-white dark:bg-black flex items-center gap-4 z-1">
        <div className="px-4 -z-1">
          <JournalNavigation />
        </div>
        <div className="justify-end px-2 ml-auto">
          <AddTradesButton />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <main>
            <AnalyzePageClient initialTrades={trades || []} strategies={strategies} setups={setups} />
          </main>
        </div>
      </div>
    </div>
  )
}

