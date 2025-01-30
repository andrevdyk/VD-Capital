import { createClient } from "@/utils/supabase/server"
import ExploreGrid from "../components/ExploreGrid"

export default async function Explore() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please sign in to access this page.</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Explore</h1>
      <ExploreGrid />
    </div>
  )
}

