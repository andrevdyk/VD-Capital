import { ReactNode } from "react";
import DashboardSideBar from "./components/dashboard-side-bar";
import DashboardTopNav from "./components/dashbord-top-nav";

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
        <main className="flex flex-col gap-4 px-4 lg:gap-6">
          {children}
        </main>
      </DashboardTopNav>
    </div>
  );
}
