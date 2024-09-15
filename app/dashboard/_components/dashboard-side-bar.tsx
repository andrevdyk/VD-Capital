"use client"

import { Separator } from '@/components/ui/separator'
import clsx from 'clsx'
import {
  Banknote,
  Folder,
  HomeIcon,
  Settings,
  BrainCircuit,
  ChartCandlestick,
  Newspaper,
  University
} from "lucide-react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaTasks } from 'react-icons/fa'

export default function DashboardSideBar() {
  const pathname = usePathname();

  return (
    <div className="lg:block hidden border-r h-full w-min">
      <div className="flex h-full max-h-screen flex-col gap-2 "> 
        <div className="flex h-[55px] items-center justify-between border-b px-3 w-full"> {/* VDC Area */}
          <Link className="flex items-center gap-2 font-semibold ml-1" href="/">
            <span className="">VD Capital</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2 ">
          <nav className="grid items-start px-4 text-sm font-medium">
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:bg-gray-500/25 dark:text-white dark:hover:text-gray-50": pathname === "/dashboard"
              })}
              href="/dashboard"
            >
              <div className="dark:bg-transparent dark:border-gray-800 border-gray-400 p-1 bg-transparent">
                <HomeIcon className="h-4 w-4" />
              </div>
              Home
            </Link>
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:bg-gray-500/25 dark:text-white dark:hover:text-gray-50": pathname === "/dashboard/fundamentals"
              })}
              href="/dashboard/fundamentals"
            >
              <div className="dark:bg-transparent dark:border-gray-800 border-gray-400 p-1 bg-transparent">
                <Newspaper className="h-4 w-4" />
              </div>
              Fundamentals
            </Link>
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:bg-gray-500/25 dark:text-white dark:hover:text-gray-50": pathname === "/dashboard/technicals"
              })}
              href="/dashboard/technicals"
            >
              <div className="dark:bg-transparent dark:border-gray-800 border-gray-400 p-1 bg-transparent">
                <ChartCandlestick className="h-4 w-4" />
              </div>
              Technicals
            </Link>
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:bg-gray-500/25 dark:text-white dark:hover:text-gray-50": pathname === "/dashboard/algorithms"
              })}
              href="/dashboard/algorithms"
            >
              <div className="dark:bg-transparent dark:border-gray-800 border-gray-400 p-1 bg-transparent">
                <BrainCircuit className="h-4 w-4" />
              </div>
              Algorithms
            </Link>
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:bg-gray-500/25 dark:text-white dark:hover:text-gray-50": pathname === "/dashboard/projects"
              })}
              href="/dashboard/projects"
            >
              <div className="dark:bg-transparent dark:border-gray-800 border-gray-400 p-1 bg-transparent">
                <Folder className="h-4 w-4" />
              </div>
              Projects
            </Link>
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:bg-gray-500/25 dark:text-white dark:hover:text-gray-50": pathname === "/dashboard/finance"
              })}
              href="/dashboard/finance"
            >
              <div className="dark:bg-transparent dark:border-gray-800 border-gray-400 p-1 bg-transparent">
                <Banknote className="h-4 w-4" />
              </div>
              Finance
            </Link>
            <Separator className="my-3" />
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:bg-gray-500/25 dark:text-white dark:hover:text-gray-50": pathname === "/dashboard/settings"
              })}
              href="/dashboard/settings"
              id="onboarding"
            >
              <div className="dark:bg-transparent dark:border-gray-800 border-gray-400 p-1 bg-transparent">
                <University className="h-4 w-4" />
              </div>
              University
            </Link>
            <Separator className="my-3" />
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:bg-gray-500/25 dark:text-white dark:hover:text-gray-50": pathname === "/dashboard/settings"
              })}
              href="/dashboard/settings"
              id="onboarding"
            >
              <div className="dark:bg-transparent dark:border-gray-800 border-gray-400 p-1 bg-transparent">
                <Settings className="h-4 w-4" />
              </div>
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
