import { AddTradesButton } from "../components/add-trades-button"
import { JournalNavigation } from "../components/journal-navigation"
import { TradesTable } from "./components/tradestable"


export default function ReflectPage() {
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
          <main className="">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="col-span-1 lg:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Trading History</h2>
                <TradesTable />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

