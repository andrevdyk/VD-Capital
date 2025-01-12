import { ReactNode } from "react";
import { JournalNavigation } from "./components/journal-navigation";
import { AddTradesButton } from "./components/add-trades-button";

export default function JournalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid w-full ">
            <div className="flex border-b w-full h-fit-content items-center">
              <div className="">
                <JournalNavigation />
              </div>
              <div className="justify-end ml-auto">
                <AddTradesButton />
              </div>
            </div>
        <main className="pt-2 flex flex-col gap-4 px-4 lg:gap-6">
          {children}
        </main>
      
    </div>
  );
}
