import { AddTradesButton } from "../components/add-trades-button"
import { JournalNavigation } from "../components/journal-navigation"
import { getStrategiesAndSetups } from "./actions/getStrategiesAndSetups"
import { TradesTable } from "./components/tradestable"

export default async function ReflectPage() {
  const { strategies, setups } = await getStrategiesAndSetups()

  return (
    <div className="flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <main className="">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="col-span-1 lg:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Trading History</h2>
                <TradesTable initialStrategies={strategies} initialSetups={setups} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

