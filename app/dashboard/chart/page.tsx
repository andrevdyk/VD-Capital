
import React from "react";
import Tradingviewchart from "./components/tradingviewchart";

export default function ProjectsPage() {
  return (
    <main className="flex flex-col  h-full min-h-[90vh] w-full">
      <div className="flex flex-1 items-center justify-center rounded-lg">
        <Tradingviewchart />
      </div>
    </main>
  );
}
