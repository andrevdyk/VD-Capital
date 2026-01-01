"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Settings, CreditCard, LogOut } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"

interface UserData {
  name: string
  email: string
  avatar: string
  subscription: {
    active: boolean
    plan: string
    expiresAt: string
  }
}

export default function NavBar() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

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

        setUser({
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
        })
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (loading) {
    return (
      <nav className="flex items-center justify-between px-8 py-6 flex-shrink-0">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2L4 28H28L16 2Z" fill="white" />
            </svg>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              VD CAPITAL
            </a>
            <a href="#" className="hover:text-white transition-colors">
              TRADING TERMINAL
            </a>
            <a href="#" className="hover:text-white transition-colors">
              COMPANY
            </a>
          </div>
        </div>
        <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse" />
      </nav>
    )
  }

  if (!user) {
    return (
      <nav className="flex items-center justify-between px-8 py-6 flex-shrink-0">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2L4 28H28L16 2Z" fill="white" />
            </svg>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              VD CAPITAL
            </a>
            <a href="#" className="hover:text-white transition-colors">
              TRADING TERMINAL
            </a>
            <a href="#" className="hover:text-white transition-colors">
              COMPANY
            </a>
          </div>
        </div>
        <Button asChild variant="default">
          <Link href="/login">Login</Link>
        </Button>
      </nav>
    )
  }

  return (
    <nav className="flex items-center justify-between px-8 py-6 flex-shrink-0">
      <div className="flex items-center gap-8">
        <div className="text-2xl font-bold">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2L4 28H28L16 2Z" fill="white" />
          </svg>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-white transition-colors">
            VD CAPITAL
          </a>
          <a href="#" className="hover:text-white transition-colors">
            TRADING TERMINAL
          </a>
          <a href="#" className="hover:text-white transition-colors">
            COMPANY
          </a>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-white group-hover:text-gray-300 transition-colors">
                  {user.name}
                </span>
                <Badge variant={user.subscription.active ? "default" : "secondary"} className="text-xs mt-1">
                  {user.subscription.active ? `${user.subscription.plan} Active` : "No Subscription"}
                </Badge>
              </div>
              <Avatar className="h-10 w-10 border-2 border-gray-700 group-hover:border-gray-500 transition-colors">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-gray-800 text-white">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
            <DropdownMenuLabel className="text-gray-300">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem asChild className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
              <Link href="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
              <Link href="/billing" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing & Subscription</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-400 hover:bg-gray-800 hover:text-red-300 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
