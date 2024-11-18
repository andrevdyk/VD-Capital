"use client"

import ModeToggle from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { UserProfile } from '@/components/user-profile'
import config from '@/config'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import { Banknote, Folder, HomeIcon, Settings } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'
import Image from 'next/image'

export default function DashboardTopNav({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col ">
      <header className="flex h-14 lg:h-[55px] gap-4 border-b w-full bg-white dark:bg-black">
        <Dialog>
          <SheetTrigger className="min-[1024px]:hidden p-2 transition">
            <HamburgerMenuIcon />
            <Link href="/dashboard">
              <span className="sr-only">Dashboard</span>
            </Link>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
            <Link className="flex items-center gap-1 font-semibold ml-1" href="/">
            {/* Light Mode Image */}
            <Image 
              src="https://github.com/andrevdyk/Photos/blob/main/Design%201%20(2).png?raw=true"
              alt="VD Capital Light Mode"
              width={30}
              height={30}
              className="dark:hidden block ml-3 items-center" // Show in light mode, hide in dark mode
            />
            {/* Dark Mode Image */}
            <Image
              src="https://github.com/andrevdyk/Photos/blob/main/Design%201%20(3).png?raw=true"
              alt="VD Capital Dark Mode"
              width={30}
              height={30}
              className="hidden dark:block ml-3 flex flex-col" // Show in dark mode, hide in light mode
            />
          </Link>
            </SheetHeader>
            <div className="flex flex-col space-y-3 mt-[1rem]">
              <DialogClose asChild>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    <HomeIcon className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </Link>
              </DialogClose>
              <DialogClose asChild>
                <Link href="/dashboard/projects">
                  <Button variant="outline" className="w-full">
                    <Folder className="mr-2 h-4 w-4" />
                    Projects
                  </Button>
                </Link>
              </DialogClose>
              <DialogClose asChild>
                <Link href="/dashboard/finance">
                  <Button variant="outline" className="w-full">
                    <Banknote className="mr-2 h-4 w-4" />
                    Finance
                  </Button>
                </Link>
              </DialogClose>
              <Separator className="my-3" />
              <DialogClose asChild>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </DialogClose>
            </div>
          </SheetContent>
        </Dialog>
        <div className="flex justify-center items-center gap-2 ml-auto">
          {config?.auth?.enabled && <UserProfile />}
          <ModeToggle />
        </div>
      </header>
      {children}
    </div>
  )
}
