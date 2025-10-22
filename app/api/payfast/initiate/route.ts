import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  const { userId, paymentMethod } = await req.json()

  const merchant_id = process.env.PAYFAST_MERCHANT_ID!
  const merchant_key = process.env.PAYFAST_MERCHANT_KEY!
  const passphrase = process.env.PAYFAST_PASSPHRASE!
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!
  const payfastUrl = process.env.NEXT_PUBLIC_PAYFAST_URL!

  // Build parameters object - DO NOT include empty values
  const params: Record<string, string> = {
    merchant_id,
    merchant_key,
    return_url: `${baseUrl}/billing?success=true`,
    cancel_url: `${baseUrl}/billing?cancelled=true`,
    notify_url: `${baseUrl}/api/payfast/notify`,
    amount: '430.00',
    item_name: 'Monthly Subscription',
    custom_str1: userId,
    subscription_type: '1',
    frequency: '3',
    cycles: '0',
  }

  // Add payment method if specified (optional - if not set, all methods shown)
  if (paymentMethod) {
    params.payment_method = paymentMethod
  }

  // Generate signature using PayFast's exact method
  const signature = generatePayFastSignature(params, passphrase)

  // Debug logging
  console.log('🧾 PayFast signature debug:')
  console.log('Generated signature:', signature)

  // Build final URL
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`)
    .join('&')
  
  const finalUrl = `${payfastUrl}?${queryString}&signature=${signature}`

  console.log('🔗 Final URL:', finalUrl)

  return NextResponse.json({ url: finalUrl })
}

/**
 * Generate PayFast signature using their official method
 * Based on: https://developers.payfast.co.za/docs#step_2_create_security_signature
 */
function generatePayFastSignature(
  data: Record<string, string>,
  passphrase: string | null = null
): string {
  // Create parameter string
  let pfOutput = ""
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      if (data[key] !== "") {
        // Encode value and replace %20 with +
        pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`
      }
    }
  }

  // Remove last ampersand
  let getString = pfOutput.slice(0, -1)
  
  // Add passphrase if provided
  if (passphrase !== null && passphrase !== "") {
    getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
  }

  console.log('🔑 String to sign:', getString)

  // Generate MD5 hash
  return crypto.createHash("md5").update(getString).digest("hex")
}