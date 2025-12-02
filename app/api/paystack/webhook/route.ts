import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Helper function to calculate period end based on plan
function calculatePeriodEnd(planCode: string): Date {
  const now = new Date()
  
  switch (planCode) {
    case 'PLN_fjbbz7v33d9wus0': // Monthly
      return new Date(now.setMonth(now.getMonth() + 1))
    case 'PLN_0arepng99m7gwm9': // 6 Month
      return new Date(now.setMonth(now.getMonth() + 6))
    case 'PLN_bwbwt5rtd3o8s7s': // 12 Month
      return new Date(now.setFullYear(now.getFullYear() + 1))
    default:
      // Default to 30 days if plan not recognized
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const secret = process.env.PAYSTACK_SECRET_KEY!
  const signature = req.headers.get('x-paystack-signature')
  const computedHash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')

  if (computedHash !== signature) {
    console.error('❌ Invalid signature')
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(rawBody)
  const data = event.data
  const metadata = data.metadata || {}

  console.log('🔔 Paystack event:', event.event)
  console.log('🧠 Metadata:', metadata)
  console.log('📦 Full data:', JSON.stringify(data, null, 2))

  // ✅ Create Supabase client using SERVICE ROLE key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ✅ Handle charge.success (this is what fires with metadata!)
  if (event.event === 'charge.success') {
    if (!metadata.user_id) {
      console.error('❌ Missing user_id in metadata')
      return NextResponse.json({ message: 'Missing user_id' }, { status: 400 })
    }

    const planName = metadata.plan_name || 'Unknown Plan'
    const planCode = metadata.plan_code || data.plan?.plan_code || 'manual'
    
    // Calculate correct period end based on plan
    const periodEnd = calculatePeriodEnd(planCode)

    // ✅ First, check if user already has a subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', metadata.user_id)
      .single()

    let result
    if (existingSub) {
      // Update existing subscription
      result = await supabase
        .from('subscriptions')
        .update({
          plan_name: planName,
          paystack_subscription_code: data.subscription_code || data.reference,
          paystack_customer_code: data.customer?.customer_code || data.customer?.id,
          plan_code: planCode,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .eq('user_id', metadata.user_id)
    } else {
      // Insert new subscription
      result = await supabase
        .from('subscriptions')
        .insert({
          user_id: metadata.user_id,
          plan_name: planName,
          paystack_subscription_code: data.subscription_code || data.reference,
          paystack_customer_code: data.customer?.customer_code || data.customer?.id,
          plan_code: planCode,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
    }

    if (result.error) {
      console.error('❌ Supabase error:', result.error)
      return NextResponse.json({ message: result.error.message }, { status: 500 })
    }

    console.log('✅ Subscription saved successfully for user:', metadata.user_id)
    console.log('📅 Period end:', periodEnd)
  }

  // ✅ Handle subscription.create (no metadata, just acknowledge)
  if (event.event === 'subscription.create') {
    console.log('ℹ️ Subscription created on Paystack side, waiting for charge.success')
    // Don't do anything here - wait for charge.success which has metadata
  }

  // ✅ Handle invoice events (for renewals)
  if (event.event === 'invoice.payment_failed') {
    const subscriptionCode = data.subscription?.subscription_code
    if (subscriptionCode) {
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('paystack_subscription_code', subscriptionCode)
      
      console.log('⚠️ Subscription marked as past_due:', subscriptionCode)
    }
  }

  // ✅ Handle subscription cancellation
  if (event.event === 'subscription.disable') {
    const subscriptionCode = data.subscription_code
    if (subscriptionCode) {
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('paystack_subscription_code', subscriptionCode)

      console.log('✅ Subscription cancelled:', subscriptionCode)
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}