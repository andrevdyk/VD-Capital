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
import Image from 'next/image'
import DashboardAccordionHome from './sidebar-accordion'; // Import the Accordion component

export default function DashboardSideBar() {
  const pathname = usePathname();

  return (
    <div className="lg:block hidden border-r h-full w-[60px] hover:w-[250px] transition-all duration-300 ease-in-out overflow-x-hidden">
      <div className="flex h-full max-h-screen flex-col gap-2 ">
        <div className="flex h-[55px] items-center justify-center lg:justify-between border-b px-0 w-full "> {/* VDC Area */}
          <Link className="flex items-center gap-1 font-semibold ml-1" href="/">
            {/* Light Mode Image */}
            <Image 
              src="https://github.com/andrevdyk/Photos/blob/main/Design%201%20(2).png?raw=true"
              alt="VD Capital Light Mode"
              width={30}
              height={30}
              className="dark:hidden block ml-3" // Show in light mode, hide in dark mode
            />
            {/* Dark Mode Image */}
            <Image
              src="https://github.com/andrevdyk/Photos/blob/main/Design%201%20(3).png?raw=true"
              alt="VD Capital Dark Mode"
              width={30}
              height={30}
              className="hidden dark:block ml-3" // Show in dark mode, hide in light mode
            />
          </Link>
        </div>

        <div className="flex-1 overflow-hidden py-2"> {/* Main Navigation Section */}
          <nav className="grid items-start px-4 text-sm font-medium">
            
            <DashboardAccordionHome /> {/* Add Accordion Component */}
            
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/projects"
              })}
              href="/dashboard/projects"
            >
              <div className="p-1 bg-transparent">
                <Folder className="h-5 w-5" />
              </div>
              <span className="hidden lg:block">Projects</span>
            </Link>

            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/finance"
              })}
              href="/dashboard/finance"
            >
              <div className="p-1 bg-transparent">
                <Banknote className="h-5 w-5" />
              </div>
              <span className="hidden lg:block">Finance</span>
            </Link>

            <Separator className="my-3" />

            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/university"
              })}
              href="/dashboard/university"
            >
              <div className="p-1 bg-transparent">
                <University className="h-5 w-5" />
              </div>
              <span className="hidden lg:block">University</span>
            </Link>
            
            <Separator className="my-3" />
          </nav>
        </div>

        {/* Settings Button */}
        <div className="mt-auto px-4 pb-4"> {/* Move this outside flex-1 */}
          <Link
            className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
              "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/settings"
            })}
            href="/dashboard/settings"
          >
            <div className="p-1 bg-transparent">
              <Settings className="h-5 w-5" />
            </div>
            <span className="hidden lg:block">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
