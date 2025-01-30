"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Search, Compass, User } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [supabase])

  const navItems = [
    { href: "/dashboard/v", icon: Home, label: "Home" },
    { href: "/dashboard/v/chats", icon: MessageSquare, label: "Chats" },
    { href: "/dashboard/v/search", icon: Search, label: "Search" },
    { href: "/dashboard/v/explore", icon: Compass, label: "Explore" },
    { href: "/dashboard/v/profile", icon: User, label: "Profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="container mx-auto px-4">
        <ul className="flex justify-between items-center h-16">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center h-full px-3 text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="mt-1 hidden md:inline">{item.label}</span>
              </Link>
            </li>
          ))}
          {user && (
            <li>
              <button onClick={() => supabase.auth.signOut()} className="text-sm font-medium">
                Sign Out
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}

