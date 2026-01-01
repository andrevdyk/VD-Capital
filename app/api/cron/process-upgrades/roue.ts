// api/cron/process-upgrades/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Helper function to calculate period end based on plan
function calculatePeriodEnd(planCode: string, startDate: Date): Date {
  const date = new Date(startDate)
  
  switch (planCode) {
    case 'PLN_fjbbz7v33d9wus0': // Monthly
      return new Date(date.setMonth(date.getMonth() + 1))
    case 'PLN_0arepng99m7gwm9': // 6 Month
      return new Date(date.setMonth(date.getMonth() + 6))
    case 'PLN_bwbwt5rtd3o8s7s': // 12 Month
      return new Date(date.setFullYear(date.getFullYear() + 1))
    default:
      return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000)
  }
}

export async function GET(req: Request) {
  // ✅ Verify the request is from your cron service (optional but recommended)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🔄 Starting upgrade processing job...')

  // ✅ Get all pending upgrades where the scheduled date has passed
  const { data: pendingUpgrades, error: fetchError } = await supabase
    .from('pending_upgrades')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_start_date', new Date().toISOString())

  if (fetchError) {
    console.error('❌ Error fetching pending upgrades:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!pendingUpgrades || pendingUpgrades.length === 0) {
    console.log('✅ No pending upgrades to process')
    return NextResponse.json({ message: 'No upgrades to process', processed: 0 })
  }

  console.log(`📦 Found ${pendingUpgrades.length} upgrades to process`)

  let processedCount = 0
  let errorCount = 0

  // ✅ Process each upgrade
  for (const upgrade of pendingUpgrades) {
    try {
      const startDate = new Date(upgrade.scheduled_start_date)
      const endDate = calculatePeriodEnd(upgrade.new_plan_code, startDate)

      // Update the subscription to the new plan
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_name: upgrade.new_plan_name,
          plan_code: upgrade.new_plan_code,
          current_period_start: startDate.toISOString(),
          current_period_end: endDate.toISOString(),
          status: 'active',
        })
        .eq('user_id', upgrade.user_id)

      if (updateError) {
        console.error(`❌ Error updating subscription for user ${upgrade.user_id}:`, updateError)
        errorCount++
        continue
      }

      // Mark the upgrade as processed
      const { error: markError } = await supabase
        .from('pending_upgrades')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', upgrade.id)

      if (markError) {
        console.error(`❌ Error marking upgrade as processed:`, markError)
        errorCount++
        continue
      }

      processedCount++
      console.log(`✅ Processed upgrade for user ${upgrade.user_id} to ${upgrade.new_plan_name}`)

      // Optional: Send email notification to user
      // await sendUpgradeConfirmationEmail(upgrade.user_id, upgrade.new_plan_name)

    } catch (error) {
      console.error(`❌ Error processing upgrade ${upgrade.id}:`, error)
      errorCount++
    }
  }

  console.log(`✅ Upgrade processing complete. Processed: ${processedCount}, Errors: ${errorCount}`)

  return NextResponse.json({
    message: 'Upgrade processing complete',
    processed: processedCount,
    errors: errorCount,
    total: pendingUpgrades.length,
  })
}

// ✅ Also allow POST for flexibility
export async function POST(req: Request) {
  return GET(req)
}