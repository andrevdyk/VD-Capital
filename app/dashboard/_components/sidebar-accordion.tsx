import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import {
  Banknote,
  Folder,
  HomeIcon,
  Settings,
  BrainCircuit,
  ChartCandlestick,
  Newspaper,
  Bitcoin,
  TrendingUpDown,
  CircleDollarSign,
  Wheat,
  HandCoins,
  ChartNoAxesCombined,
  AlignVerticalSpaceAround,
  Zap,
  ArrowLeftRight,
  AlignLeft,
  Torus,
  Sigma,
  Percent,
  PiggyBank,
  Rss,
  Target,
  SunSnow,
  Activity,
  BrainCog,
  Network,
  UserRoundX
} from "lucide-react";

export default function DashboardAccordion() {
  const pathname = usePathname();

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="home" className="group flex flex-col">
        <AccordionTrigger
          className={clsx(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
            {
              "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white w-full":
                pathname === "/dashboard",
            }
          )}
        >
          <div className="p-1 bg-transparent">
            <HomeIcon className="h-5 w-5" />
          </div>
          <span className="hidden lg:block">Home</span>
        </AccordionTrigger>
        <AccordionContent className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-screen bg-gray-500/25">
          <ul>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/page1",
                  }
                )}
                href="/dashboard/page1"
              >
                <div className="p-1 bg-transparent">
                  <CircleDollarSign className="h-4 w-4" />
                </div>
                Currencies
              </Link>
            </li>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/page2",
                  }
                )}
                href="/dashboard/page2"
              >
                <div className="p-1 bg-transparent">
                  <TrendingUpDown className="h-4 w-4" />
                </div>
                Stocks
              </Link>
            </li>
            <li>
              <Link
                className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {"bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":pathname === "/dashboard/page3",})}
                href="/dashboard/page3"
              >
                <div className="p-1 bg-transparent">
                  <Wheat className="h-4 w-5" />
                </div>
                Commodities
              </Link>
            </li>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/page4",
                  }
                )}
                href="/dashboard/page4"
              >
                <div className="p-1 bg-transparent">
                  <HandCoins className="h-4 w-4" />
                </div>
                Indices
              </Link>
            </li>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/page5",
                  }
                )}
                href="/dashboard/page5"
              >
                <div className="p-1 bg-transparent">
                  <Bitcoin className="h-4 w-4" />
                </div>
                Crypto
              </Link>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="technicals" className="group flex flex-col">
        <AccordionTrigger
          className={clsx(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
            {
              "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white w-full":
                pathname === "/dashboard/technicals",
            }
          )}
        >
          <div className="p-1 bg-transparent">
            <ChartCandlestick className="h-5 w-5" />
          </div>
          <span className="hidden lg:block">Technicals</span>
        </AccordionTrigger>
        <AccordionContent className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-screen bg-gray-500/25">
          <ul>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/technicals/page1",
                  }
                )}
                href="/dashboard/technicals/page1"
              >
                <div className="p-1 bg-transparent">
                  <ChartNoAxesCombined className="h-4 w-4" />
                </div>
                Trends
              </Link>
            </li>

            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/technicals/page2",
                  }
                )}
                href="/dashboard/technicals/page2"
              >
                <div className="p-1 bg-transparent">
                  <AlignVerticalSpaceAround className="h-4 w-4" />
                </div>
                Supply & Demand
              </Link>
            </li>

            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/technicals/page3",
                  }
                )}
                href="/dashboard/technicals/page3"
              >
                <div className="p-1 bg-transparent">
                  <Zap className="h-4 w-4" />
                </div>
                Patterns
              </Link>
            </li>

            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/technicals/page4",
                  }
                )}
                href="/dashboard/technicals/page4"
              >
                <div className="p-1 bg-transparent">
                  <ArrowLeftRight className="h-4 w-4" />
                </div>
                Order Flow
              </Link>
            </li>

            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/technicals/page5",
                  }
                )}
                href="/dashboard/technicals/page5"
              >
                <div className="p-1 bg-transparent">
                  <AlignLeft className="h-4 w-4" />
                </div>
                Profiles
              </Link>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="fundamentals" className="group flex flex-col">
        <AccordionTrigger
          className={clsx(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
            {
              "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white w-full":
                pathname === "/fundamentals",
            }
          )}
        >
          <div className="p-1 bg-transparent">
            <Newspaper className="h-5 w-5" />
          </div>
          <span className="hidden lg:block">Fundamentals</span>
        </AccordionTrigger>
        <AccordionContent className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-screen">
          <ul>
          <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/fundamentals/page1",
                  }
                )}
                href="/dashboard/fundamentals/page1"
              >
                <div className="p-1 bg-transparent">
                  <Torus className="h-4 w-4" />
                </div>
                COT Data
              </Link>
            </li>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/fundamentals/page2",
                  }
                )}
                href="/dashboard/fundamentals/page2"
              >
                <div className="p-1 bg-transparent">
                  <Sigma className="h-4 w-4" />
                </div>
                Market Indicators
              </Link>
            </li>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/fundamentals/page3",
                  }
                )}
                href="/dashboard/fundamentals/page3"
              >
                <div className="p-1 bg-transparent">
                  <PiggyBank className="h-4 w-4" />
                </div>
                Bank Reports
              </Link>
            </li>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/fundamentals/page4",
                  }
                )}
                href="/dashboard/fundamentals/page4"
              >
                <div className="p-1 bg-transparent">
                  <Rss className="h-4 w-4" />
                </div>
                News Analysis
              </Link>
            </li>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/fundamentals/page5",
                  }
                )}
                href="/dashboard/fundamentals/page5"
              >
                <div className="p-1 bg-transparent">
                  <Percent className="h-4 w-4" />
                </div>
                Financial Analysis
              </Link>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="algorithms" className="group flex flex-col">
        <AccordionTrigger
          className={clsx(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
            {
              "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white w-full":
                pathname === "/dashboard/algorithms",
            }
          )}
        >
          <div className="p-1 bg-transparent">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <span className="hidden lg:block">Algorithms</span>
        </AccordionTrigger>
        <AccordionContent className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-screen">
          <ul>
          <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/algorithms/page1",
                  }
                )}
                href="/dashboard/algorithms/page1"
              >
                <div className="p-1 bg-transparent">
                  <Target className="h-4 w-4" />
                </div>
                EOD Prediction
              </Link>
            </li>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/algorithms/page2",
                  }
                )}
                href="/dashboard/algorithms/page2"
              >
                <div className="p-1 bg-transparent">
                  <SunSnow className="h-4 w-4" />
                </div>
                Seasonality
              </Link>
            </li>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/algorithms/page3",
                  }
                )}
                href="/dashboard/algorithms/page3"
              >
                <div className="p-1 bg-transparent">
                  <Activity className="h-4 w-4" />
                </div>
                Trendy
              </Link>
            </li>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/algorithms/page4",
                  }
                )}
                href="/dashboard/algorithms/page4"
              >
                <div className="p-1 bg-transparent">
                  <BrainCog className="h-4 w-4" />
                </div>
                Sentient AI
              </Link>
            </li>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/algorithms/page5",
                  }
                )}
                href="/dashboard/algorithms/page5"
              >
                <div className="p-1 bg-transparent">
                  <Network className="h-4 w-4" />
                </div>
                VDC Decisions
              </Link>
            </li>
            <li>
              <Link
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-500/10 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-100 text-gray-900 dark:bg-gray-500/25 dark:text-white":
                      pathname === "/dashboard/algorithms/page6",
                  }
                )}
                href="/dashboard/algorithms/page6"
              >
                <div className="p-1 bg-transparent">
                  <UserRoundX className="h-4 w-4" />
                </div>
                LIQ Sentiment
              </Link>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* Repeat for Fundamentals and Algorithms */}
    </Accordion>
  );
}
