import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@radix-ui/react-accordion";
import Link from 'next/link';
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import {
    Banknote,
    Folder,
    HomeIcon,
    Settings,
    BrainCircuit,
    ChartCandlestick,
    Newspaper,
    University,
    Bitcoin,
    TrendingUpDown,
    CircleDollarSign,
    Wheat,
    HandCoins
  } from "lucide-react"

export default function DashboardAccordion() {
    const pathname = usePathname();

  return (
    <Accordion type="single" collapsible className="w-full" >
      <AccordionItem value="home" className="group flex flex-col">
        <AccordionTrigger className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
          "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white w-full": pathname === "/dashboard"
        })}>
          <div className="p-1 bg-transparent">
            <HomeIcon className="h-5 w-5" />
          </div>
          <span className="hidden lg:block">Home</span>
        </AccordionTrigger>
        <AccordionContent className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-screen">
          <ul>
            <li><Link className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/page1"
              })} href="/dashboard/page1"><div className="p-1 bg-transparent">
              <CircleDollarSign className="h-4 w-4" />
            </div>Currencies</Link></li>
            <li><Link className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/page2"
              })} href="/dashboard/page2"><div className="p-1 bg-transparent">
              <TrendingUpDown className="h-4 w-4" />
            </div>Stocks</Link></li>
            <li><Link className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/page3"
              })} href="/dashboard/page3"><div className="p-1 bg-transparent">
              <Wheat className="h-4 w-5" />
            </div>Commodities</Link></li>
            <li><Link className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/page4"
              })} href="/dashboard/page4"><div className="p-1 bg-transparent">
              <HandCoins className="h-4 w-4" />
            </div>Indices</Link></li>
            <li><Link className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/page5"
              })} href="/dashboard/page5"><div className="p-1 bg-transparent">
              <Bitcoin className="h-4 w-4" />
            </div>Crypto</Link></li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="technicals" className="group flex flex-col">
      <AccordionTrigger className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
          "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white w-full": pathname === "/dashboard/technicals"
        })}>
          <div className="p-1 bg-transparent">
            <ChartCandlestick className="h-5 w-5" />
          </div>
          <span className="hidden lg:block">Technicals</span>
        </AccordionTrigger>
        <AccordionContent className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-screen">
          <ul>
            <li><Link className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/technicals/page1"
              })} href="/dashboard/technicals/page1">Trends</Link></li>
            
            <li><Link className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/technicals/page2"
              })} href="/dashboard/technicals/page2">Supply & Demand</Link></li>
            
            <li><Link className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/technicals/page3"
              })} href="/dashboard/technicals/page3">Patterns</Link></li>
            
            <li><Link className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/technicals/page4"
              })} href="/dashboard/technicals/page4">Order Flow</Link></li>
            
            <li><Link className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
                "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white": pathname === "/dashboard/technicals/page5"
              })} href="/dashboard/technicals/page5">Profiles</Link></li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="fundamentals" className="group flex flex-col">
      <AccordionTrigger className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
          "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white w-full": pathname === "/fundamentals"
        })}>
          <div className="p-1 bg-transparent">
            <Newspaper className="h-5 w-5" />
          </div>
          <span className="hidden lg:block">Fundamentals</span>
        </AccordionTrigger>
        <AccordionContent>
          <ul>
            <li><Link href="/dashboard/fundamentals/page1">COT Data</Link></li>
            <li><Link href="/dashboard/fundamentals/page2">Market Indicators</Link></li>
            <li><Link href="/dashboard/fundamentals/page3">Bank Reports</Link></li>
            <li><Link href="/dashboard/fundamentals/page4">News Analysis</Link></li>
            <li><Link href="/dashboard/fundamentals/page5">Financial Analysis</Link></li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="algorithms" className="group flex flex-col">
      <AccordionTrigger className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50", {
          "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white w-full": pathname === "/algorithms"
        })}>
          <div className="p-1 bg-transparent">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <span className="hidden lg:block">Algorithms</span>
        </AccordionTrigger>
        <AccordionContent>
          <ul>
            <li><Link href="/dashboard/algorithms/page1">EoD ML AI</Link></li>
            <li><Link href="/dashboard/algorithms/page2">Seasonality</Link></li>
            <li><Link href="/dashboard/algorithms/page3">Trendy</Link></li>
            <li><Link href="/dashboard/algorithms/page4">Sentient AI</Link></li>
            <li><Link href="/dashboard/algorithms/page4">VDC Indicator</Link></li>
            <li><Link href="/dashboard/algorithms/page5">LIQ Sentiment</Link></li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      

      {/* Repeat for Fundamentals and Algorithms */}
    </Accordion>
  );
}
