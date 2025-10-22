import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

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

  // ✅ Create Supabase client using SERVICE ROLE key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (!metadata.user_id) {
    console.error('❌ Missing user_id in metadata')
    return NextResponse.json({ message: 'Missing user_id' }, { status: 400 })
  }

  // ✅ Support for "charge.success" events (which are for payments)
  if (event.event === 'charge.success') {
    const planName = metadata.plan_name || 'Unknown Plan'

    const { error } = await supabase.from('subscriptions').upsert({
      user_id: metadata.user_id,
      plan_name: planName,
      paystack_subscription_code: data.subscription || data.reference,
      paystack_customer_code: data.customer?.customer_code || data.customer?.id,
      plan_code: data.plan?.plan_code || 'manual',
      status: 'active',
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // default 30 days
    })

    if (error) {
      console.error('❌ Supabase insert error:', error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    console.log('✅ Subscription inserted successfully for user:', metadata.user_id)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
