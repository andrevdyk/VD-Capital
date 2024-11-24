import { ReactNode } from "react";
import FinancialAnalysisTabs from "./components/financialanalysistabs";

export default function FinancialAnalysisLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-rows-[40px_1fr] ">
      <div className="static z-8 gap-2 p-1">
      <FinancialAnalysisTabs/>
      
        <main className="p-4 flex">
          {children}
        </main>
        </div>
    </div>
  );
}
