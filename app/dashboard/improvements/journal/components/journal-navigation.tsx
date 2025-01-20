"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const configurations: { title: string; href: string; description: string }[] = [
  {
    title: "Mistakes",
    href: "/docs/primitives/alert-dialog",
    description: "Create and categorize common trading mistakes."
  },
  {
    title: "Setups",
    href: "/docs/primitives/hover-card",
    description: "Define and name setups to assign to trades."
  },
  {
    title: "Plans",
    href: "/docs/primitives/progress",
    description: "Create and manage names for trading plans."
  },
  {
    title: "Strategies",
    href: "/docs/primitives/scroll-area",
    description: "Build and configure trading strategies."
  },
  {
    title: "Targets and Stops",
    href: "/docs/primitives/tabs",
    description: "Set and save target and stop-loss configurations."
  },
  {
    title: "Risk",
    href: "/docs/primitives/tooltip",
    description: "Establish rules for risk parameters and management."
  }
]

const planning: { title: string; href: string; description: string }[] = [
  {
    title: "Objective",
    href: "/docs/primitives/alert-dialog",
    description:
      "Set clear financial goals, trading style, and time commitment.",
  },
  {
    title: "Markets",
    href: "/docs/primitives/hover-card",
    description:
      "Set clear financial goals, trading style, and time commitment.",
  },
  {
    title: "Develop Trade Setups",
    href: "/docs/primitives/progress",
    description:
      "Define entry and exit rules using indicators, patterns, and fundamentals.",
  },
  {
    title: "Trade Management",
    href: "/docs/primitives/scroll-area",
    description: "Plan actions after entering a trade, like adjusting stops or scaling positions.",
  },
  {
    title: "Risk Management",
    href: "/docs/primitives/tooltip",
    description:
      "Establish position sizing, stop-loss, and risk-to-reward ratios.",
  },
]

const testing: { title: string; href: string; description: string }[] = [
  {
    title: "Backtesting",
    href: "/docs/primitives/alert-dialog",
    description:
      "Test your strategy on historical data to gauge performance.",
  },
  {
    title: "Paper Trading",
    href: "/docs/primitives/hover-card",
    description:
      "Simulate trades in live market conditions without real money.",
  },
]

const analyze: { title: string; href: string; description: string }[] = [
  {
    title: "Performance Metrics",
    href: "/docs/primitives/alert-dialog",
    description:
      "Review win rate, average risk-to-reward ratio, and profitability.",
  },
  {
    title: "Refinement",
    href: "/docs/primitives/hover-card",
    description:
      "Adjust setups, risk management, or execution based on findings.",
  },
  {
    title: "Market Adaptation",
    href: "/docs/primitives/progress",
    description:
      "Evaluate if your strategy aligns with current market conditions.",
  },
]

export function JournalNavigation() {
  return (
    <NavigationMenu className="h-14 lg:h-[55px] flex items-center z-10">
      <div className="">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link href="/dashboard">Dashboard</Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Overview
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Overview of how you are doing towards your goals.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link href="/dashboard/improvements/journal/trading-plan">Trading Plan</Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {planning.map((plan) => (
                <ListItem
                  key={plan.title}
                  title={plan.title}
                  href={plan.href}
                >
                  {plan.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link href="/dashboard/improvements/journal/backtest">Testing</Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {testing.map((test) => (
                <ListItem
                  key={test.title}
                  title={test.title}
                  href={test.href}
                >
                  {test.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/dashboard/improvements/journal/reflect" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Reflect
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link href="/dashboard/improvements/journal/analyze">Analyze Trades</Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {analyze.map((item) => (
                <ListItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                >
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link href="/configurations">Configurations</Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {configurations.map((config) => (
                <ListItem
                  key={config.title}
                  title={config.title}
                  href={config.href}
                >
                  {config.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      </div>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

