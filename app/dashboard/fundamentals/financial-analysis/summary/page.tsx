import React from "react";
import { DollarCard } from "./components/cards";
import { RadialChart } from "./components/radialchart"; 
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import MiniChart  from "./components/mini-chart"
  import { InsiderTrading } from "./components/insider-trading";
  import { InvestorReturns } from "./components/investor-returns";

export default function FinancialAnalysisPage() {
  return (
    <div className="">
        <div className="flex flex-row gap-2 overflow-hidden">
        <DollarCard
            amount={245.89}
            label="Current Value"
            hasDrawer={false}
        />
        <DollarCard
            amount={212.24}
            label="Intrinsic Value"
            drawerContent={
            <>
                <h2 className="text-4xl font-bold mb-4">What is intrinsic value?</h2>
                <p className="mb-4 text-2xl">
                Stock intrinsic value is the real worth of a company's stock,
                based on its financial health and performance.
                </p>
                <p className="mb-4 text-2xl">
                Instead of looking at the stock's current market price, which can
                change due to people's opinions and emotions, intrinsic value helps
                us understand if a stock is truly a good deal or not.
                </p>
            </>
            }
        />
        <DollarCard
            amount={127.99}
            label="DCF Value"
            drawerContent={
            <>
                <h2 className="text-4xl font-bold mb-4">What is DCF Value?</h2>
                <p className="mb-4 text-2xl">
                The Discounted Cash Flow (DCF) value is a method used to estimate
                the value of an investment based on its expected future cash flows.
                </p>
                <p className="mb-4 text-2xl">
                By forecasting the company's future cash flows and discounting
                them back to present value, we can determine if the stock is
                undervalued or overvalued.
                </p>
            </>
            }
        />
        <DollarCard
            amount={84.25}
            label="Relative Value"
            drawerContent={
            <>
                <h2 className="text-4xl font-bold mb-4">What is Relative Value?</h2>
                <p className="mb-4 text-2xl">
                Relative value compares the price of an asset with other similar
                assets. It helps to determine whether an asset is under or over
                priced compared to its peers.
                </p>
            </>
            }
        />
        <DollarCard
            amount="87/100"
            label="Profitability"
            drawerContent={
            <>
                <h2 className="text-4xl font-bold mb-4">What is Profitability?</h2>
                <p className="mb-4 text-2xl">
                Profitability measures a company's ability to generate earnings as
                compared to its expenses over a certain period of time.
                </p>
            </>
            }
        />
        <DollarCard
            amount="52/100"
            label="Solvency"
            drawerContent={
            <>
                <h2 className="text-4xl font-bold mb-4">What is Solvency?</h2>
                <p className="mb-4 text-2xl">
                Solvency refers to a company's ability to meet its long-term
                financial obligations and remain financially stable.
                </p>
            </>
            }
        />
        <DollarCard
            amount="8.36%"
            label="Discount Rate"
            drawerContent={
            <>
                <h2 className="text-4xl font-bold mb-4">What is Discount Rate?</h2>
                <p className="mb-4 text-2xl">
                Profitability measures a company's ability to generate earnings as
                compared to its expenses over a certain period of time.
                </p>
            </>
            }
        />
        <DollarCard
            amount="7.21%"
            label="Wall St Estimates"
            drawerContent={
            <>
                <h2 className="text-4xl font-bold mb-4">What are Wall Street Estimates?</h2>
                <p className="mb-4 text-2xl">
                Profitability measures a company's ability to generate earnings as
                compared to its expenses over a certain period of time.
                </p>
            </>
            }
        />
        <DollarCard
            amount="0.43%"
            label="Dividend Yeild"
            drawerContent={
            <>
                <h2 className="text-4xl font-bold mb-4">What is Dividend Yield?</h2>
                <p className="mb-4 text-2xl">
                Profitability measures a company's ability to generate earnings as
                compared to its expenses over a certain period of time.
                </p>
            </>
            }
        />
        </div>

        <div>
        <Card className="grid h-max w-[60%] mt-2">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-2 sm:flex-row">
            <div className="grid flex-1 gap-1 text-left text-sm">
            <span>Fundamentals</span>
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-[60%,40%] gap-2">
            {/* Column 1: MiniChart */}
            <div className="border-r mt-2">
            <MiniChart />
            </div>
            {/* Column 2: RadialChart */}
            <div>
            <div className="mt-2 flex-row flex gap-2">
            <RadialChart />
            <InvestorReturns />
            </div>
            <InsiderTrading />
            </div>
        </CardContent>
    </Card>
        </div>
    </div>
  );
}
