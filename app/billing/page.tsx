'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CreditCard, Smartphone, Landmark, Wallet } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const paymentMethods = [
  { code: 'ef', name: 'EFT', icon: Landmark, color: 'bg-blue-500' },
  { code: 'cc', name: 'Credit Card', icon: CreditCard, color: 'bg-purple-500' },
  { code: 'dc', name: 'Debit Card', icon: CreditCard, color: 'bg-green-500' },
  { code: 'mp', name: 'Masterpass', icon: Wallet, color: 'bg-orange-500' },
  { code: 'mc', name: 'Mobicred', icon: Wallet, color: 'bg-red-500' },
  { code: 'sc', name: 'SCode', icon: Smartphone, color: 'bg-indigo-500' },
  { code: 'ss', name: 'SnapScan', icon: Smartphone, color: 'bg-teal-500' },
  { code: 'zp', name: 'Zapper', icon: Smartphone, color: 'bg-yellow-500' },
  { code: 'mt', name: 'MoreTyme', icon: Wallet, color: 'bg-pink-500' },
  { code: 'rc', name: 'Store Card', icon: CreditCard, color: 'bg-gray-500' },
  { code: 'mu', name: 'Mukuru', icon: Wallet, color: 'bg-cyan-500' },
  { code: 'ap', name: 'Apple Pay', icon: Smartphone, color: 'bg-black' },
  { code: 'sp', name: 'Samsung Pay', icon: Smartphone, color: 'bg-blue-600' },
  { code: 'cp', name: 'Capitec Pay', icon: Wallet, color: 'bg-red-600' },
]

export default function BillingPage() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string>('')

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('status, next_billing_date')
          .eq('user_id', data.user.id)
          .single()
        if (sub) setStatus(sub.status)
      }
    }
    getSession()
  }, [])

  const handleLogin = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else window.location.reload()
  }

  const handleSubscribe = async () => {
    if (!user) return alert('Please log in first.')
    setLoading(true)
    const res = await fetch('/api/payfast/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: user.id,
        paymentMethod: selectedMethod || undefined
      }),
    })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-black p-4">
      <Card className="w-full max-w-2xl p-6">
        <CardHeader>
          <h2 className="text-2xl font-semibold mb-2 text-center">Billing</h2>
        </CardHeader>
        <CardContent>
          {!user ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full">Login</Button>
            </form>
          ) : status === 'active' ? (
            <div className="text-center">
              <p className="mb-4 text-green-600 font-medium">
                ✅ Subscription Active
              </p>
              <p>Your next payment will automatically renew in 30 days.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="mb-4 text-gray-600">
                  Subscribe for <strong>R25/month</strong> to unlock full access.
                </p>
                <p className="text-sm text-gray-500">
                  Choose a payment method (or leave blank to see all options)
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedMethod('')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMethod === ''
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    <span className="text-sm font-medium">All Methods</span>
                  </div>
                </button>

                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.code}
                      onClick={() => setSelectedMethod(method.code)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedMethod === method.code
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`p-2 rounded-full ${method.color} text-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{method.name}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              <Button onClick={handleSubscribe} disabled={loading} className="w-full">
                {loading ? 'Redirecting…' : 'Subscribe with PayFast'}
              </Button>

              {selectedMethod && (
                <p className="text-center text-sm text-gray-500">
                  Selected: <strong>{paymentMethods.find(m => m.code === selectedMethod)?.name}</strong>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}