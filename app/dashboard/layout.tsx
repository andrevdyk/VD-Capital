import { ReactNode } from "react"
import DashboardSideBar from "./_components/dashboard-side-bar"
import DashboardTopNav from "./_components/dashbord-top-nav"

export default function DashboardLayout({ children }: { children: ReactNode }) {

  return (
    
    <div className="grid min-h-screen lg:grid-cols-[40px_1fr] ">
      <div className="static z-10">
      <DashboardSideBar /> 
      </div>
      <DashboardTopNav >
        <main className="flex flex-col gap-4 px-4 lg:gap-6">
          {children}
        </main>
      </DashboardTopNav>     
    </div>

  )
}
