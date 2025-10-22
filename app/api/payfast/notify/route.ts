import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // PayFast sends data as URL-encoded form in the body
    const body = await req.text()
    const params = new URLSearchParams(body)
    const data: Record<string, string> = {}
    
    // Convert URLSearchParams to object
    params.forEach((value, key) => {
      data[key] = value
    })

    console.log('📬 PayFast ITN received:', data)

    // 1. Verify signature (CRITICAL for security)
    const receivedSignature = data.signature
    if (!receivedSignature) {
      console.error('❌ No signature provided')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Remove signature from data for validation
    const { signature, ...dataToVerify } = data
    
    const isValid = verifyPayFastSignature(dataToVerify, receivedSignature)
    
    if (!isValid) {
      console.error('❌ Invalid signature - possible fraud attempt')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('✅ Signature verified')

    // 2. Process the payment
    const payment_status = data.payment_status
    const userId = data.custom_str1
    const pf_payment_id = data.pf_payment_id

    if (!userId) {
      console.error('❌ No user ID provided')
      return NextResponse.json({ error: 'No user ID' }, { status: 400 })
    }

    if (payment_status === 'COMPLETE') {
      // Calculate next billing date (30 days)
      const nextBilling = new Date()
      nextBilling.setDate(nextBilling.getDate() + 30)

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          status: 'active',
          payfast_payment_id: pf_payment_id,
          payfast_token: data.token || null, // Store subscription token for cancellations
          next_billing_date: nextBilling.toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error('❌ Supabase error:', error)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      console.log('✅ Subscription activated for user:', userId)
    } else if (payment_status === 'CANCELLED') {
      // Handle subscription cancellation
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Supabase error:', error)
      } else {
        console.log('✅ Subscription cancelled for user:', userId)
      }
    }

    // Always return 200 OK to PayFast
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    // Still return 200 to prevent PayFast from retrying
    return NextResponse.json({ received: true })
  }
}

function verifyPayFastSignature(
  data: Record<string, string>,
  receivedSignature: string
): boolean {
  const passphrase = process.env.PAYFAST_PASSPHRASE!
  
  // Sort parameters alphabetically
  const sortedKeys = Object.keys(data).sort()
  
  // Build query string (no encoding)
  const queryString = sortedKeys
    .map((key) => `${key}=${data[key]}`)
    .join('&')
  
  // Append passphrase
  const stringToSign = passphrase
    ? `${queryString}&passphrase=${passphrase}`
    : queryString
  
  // Generate MD5 signature
  const calculatedSignature = crypto
    .createHash('md5')
    .update(stringToSign)
    .digest('hex')
  
  console.log('🔐 Signature verification:')
  console.log('String to sign:', stringToSign)
  console.log('Received:', receivedSignature)
  console.log('Calculated:', calculatedSignature)
  console.log('Match:', calculatedSignature === receivedSignature)
  
  return calculatedSignature === receivedSignature
}