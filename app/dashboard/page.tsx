import MarketTrendsAllTable from "./components/Table"
import dynamic from "next/dynamic"
import { getPolygonData } from "./hooks/usePolygonData"
import { Seasonality } from "./components/SeasonalityChart"
import { CommitmentOfTraders } from "./components/commitment-of-traders"
import { EconomicIndicators } from "./components/economic-indicators"
import { EconomicNews } from "./components/economic-news"
import { AssetStrength } from "./components/asset-strength"
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
const Chart = dynamic(() => import("./components/Chart"), { ssr: true })

// Remove the AssetFilter from the page since it's now in the top nav
export default async function Dashboard() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check for active subscription
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  // Log for debugging
  console.log('Subscription check:', { subscription, subError, userId: user.id })

  // If no active subscription found, redirect to billing
  if (!subscription) {
    console.log('No active subscription found, redirecting to billing')
    redirect('/billing')
  }

  // Check if subscription has expired
  const now = new Date()
  const periodEnd = new Date(subscription.current_period_end)
  
  if (periodEnd < now) {
    console.log('Subscription expired:', periodEnd, 'vs now:', now)
    
    // Update status to expired
    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('id', subscription.id)
    
    redirect('/billing')
  }
  
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

