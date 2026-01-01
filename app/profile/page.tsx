"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight } from "lucide-react"
import NavBar from "@/components/homepage/navbar"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"

interface UserData {
  id: string
  name: string
  email: string
  avatar: string
  subscription: {
    active: boolean
    plan: string
    expiresAt: string
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data: subscriptionData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle()

        const userData = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
          email: authUser.email || "",
          avatar: authUser.user_metadata?.avatar_url || "",
          subscription: subscriptionData
            ? {
                active: subscriptionData.status === "active",
                plan: subscriptionData.plan_name || "Free",
                expiresAt: subscriptionData.current_period_end || "",
              }
            : {
                active: false,
                plan: "Free",
                expiresAt: "",
              },
        }

        setUser(userData)
        setFormData({
          name: userData.name,
          email: userData.email,
        })
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  const handleSave = async () => {
    if (!user) return

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: formData.name,
      },
    })

    if (!error) {
      setUser({ ...user, name: formData.name, email: formData.email })
      setIsEditing(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        <NavBar />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="h-64 bg-gray-900/50 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <NavBar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Section */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-gray-700">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-gray-800 text-white text-2xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl text-white mb-2">{user.name}</CardTitle>
                <CardDescription className="text-gray-400">{user.email}</CardDescription>
                <Badge variant={user.subscription.active ? "default" : "secondary"} className="mt-2">
                  {user.subscription.active ? `${user.subscription.plan} Plan` : "No Subscription"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator className="bg-gray-800" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                ) : (
                  <p className="text-white font-medium">{user.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <p className="text-white font-medium">{user.email}</p>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {isEditing ? (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-white text-black hover:bg-gray-200">
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Edit Profile
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Current Subscription Details */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-white">Subscription Details</CardTitle>
            <CardDescription className="text-gray-400">Manage your VD Capital subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.subscription.active ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-gray-400 text-sm">Current Plan</Label>
                    <p className="text-white font-semibold mt-1">{user.subscription.plan}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-sm">Renewal Date</Label>
                    <p className="text-white font-semibold mt-1">
                      {user.subscription.expiresAt ? new Date(user.subscription.expiresAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <Separator className="bg-gray-800" />
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <p className="text-gray-400 text-sm">
                    Your subscription will automatically renew on{" "}
                    {user.subscription.expiresAt ? new Date(user.subscription.expiresAt).toLocaleDateString() : "N/A"}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                  >
                    <Link href="/billing">Manage Subscription</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">You don't have an active subscription</p>
                <Button asChild className="bg-white text-black hover:bg-gray-200">
                  <Link href="/billing">
                    View Subscription Plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
