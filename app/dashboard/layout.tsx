import { ReactNode } from "react";
import DashboardSideBar from "./components/dashboard-side-bar";
import DashboardTopNav from "./components/dashbord-top-nav";
import { AssetFilterProvider } from "./components/asset-filter-context";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[40px_1fr] ">
      <div className="static z-20">
        <DashboardSideBar />
      </div>
      <DashboardTopNav>
        <main className="flex flex-col gap-4 pl-4 pr-2 h-full lg:gap-6">
        <AssetFilterProvider>{children}</AssetFilterProvider>
        </main>
      </DashboardTopNav>
    </div>
  );
}


