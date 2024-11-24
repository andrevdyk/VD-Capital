"use client"

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FinancialAnalysisTabs() {
  const pathname = usePathname(); // Get the current path
  const basePath = "/dashboard/fundamentals/financial-analysis";

  const tabs = [
    { label: "Summary", value: "summary" },
    { label: "Financials", value: "financials" },
    { label: "Earnings", value: "earnings" },
    { label: "Dividends", value: "dividends" },
    { label: "Profitability", value: "profitability" },
    { label: "Solvency", value: "solvency" },
    { label: "Estimates", value: "estimates" },
    { label: "Discounted Cash Flow", value: "discounted-cash-flow" },
    { label: "Relative Evaluation", value: "relative-evaluation" },
    { label: "Discount Rate", value: "discount-rate" },
  ];

  return (
    <Tabs defaultValue="summary" className="w-[400px]">
      <TabsList>
        {tabs.map((tab) => {
          const isActive = pathname === `${basePath}/${tab.value}`; // Check if the tab is active

          return (
            <Link key={tab.value} href={`${basePath}/${tab.value}`} passHref>
              <TabsTrigger
                value={tab.value}
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-5 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      isActive,
                  }
                )}
              >
                {tab.label}
              </TabsTrigger>
            </Link>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
