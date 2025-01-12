import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AddTradesButton } from "./components/add-trades-button"
import { JournalNavigation } from "./components/journal-navigation"
import { JournalContent } from "./components/JournalContent"

export default async function TradingUploadPage() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/login")
  }

  return (
    <div>
        <div className="justify-end px-2 ml-auto">
          <AddTradesButton />
        </div>

      <JournalContent />
    </div>
  )
}

