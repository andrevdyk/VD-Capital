import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  const { userId } = await req.json()

  const merchant_id = process.env.PAYFAST_MERCHANT_ID!
  const merchant_key = process.env.PAYFAST_MERCHANT_KEY!
  const passphrase = process.env.PAYFAST_PASSPHRASE!
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!
  const payfastUrl = process.env.NEXT_PUBLIC_PAYFAST_URL!

  const data = {
    merchant_id,
    merchant_key,
    return_url: `${baseUrl}/billing?success=true`,
    cancel_url: `${baseUrl}/billing?cancelled=true`,
    notify_url: `${baseUrl}/api/payfast/notify`,
    amount: '25.00',
    item_name: 'Monthly Subscription',
    custom_str1: userId,
    subscription_type: '1', // recurring
    frequency: '3', // 3 = monthly
    cycles: '0', // infinite
  }

  const query = Object.entries(data)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')

  const signature = crypto
    .createHash('md5')
    .update(`${query}&passphrase=${encodeURIComponent(passphrase)}`)
    .digest('hex')

  const paymentUrl = `${payfastUrl}?${query}&signature=${signature}`

  return NextResponse.json({ url: paymentUrl })
}
