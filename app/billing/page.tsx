"use client"

import { useState, useEffect } from "react"
import NumberFlow from "@number-flow/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowRight, BadgeCheck } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import NavBar from "@/components/homepage/navbar"

// Your Paystack plans
const paystackPlans = [
  {
    name: "Monthly VD Capital Subscription",
    amount: 45000,
    interval: "Monthly",
    planCode: "PLN_fjbbz7v33d9wus0",
    currency: "ZAR",
  },
  {
    name: "6 Month VD Capital Subscription",
    amount: 247500,
    interval: "Biannually",
    planCode: "PLN_0arepng99m7gwm9",
    currency: "ZAR",
  },
  {
    name: "12 Month VD Capital Subscription",
    amount: 450000,
    interval: "Annually",
    planCode: "PLN_bwbwt5rtd3o8s7s",
    currency: "ZAR",
  },
]

declare global {
  interface Window {
    PaystackPop?: any
  }
}

const BillingPage = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Load Paystack SDK script once
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email ?? null)
        setUserId(user.id)
      }
    }
    getUser()
  }, [])

  const handleSubscribe = async (planCode: string, name: string) => {
    if (!userEmail || !userId) {
      alert("Please log in before subscribing.")
      return
    }

    setLoading(true)

    const paystack = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email: userEmail,
      plan: planCode,
      metadata: {
        user_id: userId,
        plan_name: name,
        plan_code: planCode,
      },
      callback: (response: any) => {
        console.log("Payment complete:", response)
        setLoading(false)
        window.location.href = "/dashboard/payment-success"
      },
      onClose: () => {
        console.log("Payment cancelled by user")
        setLoading(false)
      },
    })

    paystack.openIframe()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <NavBar />
      <div className="flex flex-col gap-16 px-8 py-24 text-center">
        <div className="flex flex-col items-center justify-center gap-8">
          <h1 className="text-balance font-medium text-5xl tracking-tighter">Subscription Plans</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Choose your preferred VD Capital subscription plan below.
          </p>

          <div className="mt-8 grid w-full max-w-4xl gap-4 lg:grid-cols-3">
            {paystackPlans.map((plan) => (
              <Card
                key={plan.planCode}
                className={cn(
                  "relative w-full text-left hover:shadow-xl transition-all bg-gray-900/50 border-gray-800",
                )}
              >
                <CardHeader>
                  <CardTitle className="font-semibold text-xl text-white">{plan.name}</CardTitle>
                  <CardDescription>
                    <NumberFlow
                      className="font-medium text-foreground"
                      format={{
                        style: "currency",
                        currency: "ZAR",
                        minimumFractionDigits: 2,
                      }}
                      value={plan.amount / 100}
                    />
                    <p className="text-sm mt-1">{plan.interval}</p>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                    <BadgeCheck className="h-4 w-4" /> Secure payments with Paystack
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <BadgeCheck className="h-4 w-4" /> Auto-renews per interval
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-white text-black hover:bg-gray-200"
                    disabled={!userEmail || loading}
                    onClick={() => handleSubscribe(plan.planCode, plan.name)}
                  >
                    Subscribe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingPage
