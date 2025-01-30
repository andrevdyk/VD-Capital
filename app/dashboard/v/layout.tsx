import { ReactNode } from "react";
import { Navbar } from "./components/Navbar";

export default function SocialLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="">
        
      <Navbar/>
        <main className="ml-2">
            
          {children}
        </main>
      
    </div>
  );
}