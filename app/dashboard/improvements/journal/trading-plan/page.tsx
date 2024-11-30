import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { TraderTypeQuiz } from "./components/TraderTypeQuiz";
import { Toaster } from "@/components/ui/toaster";
import { AddTradesButton } from "../components/add-trades-button";
import { JournalNavigation } from "../components/journal-navigation";

export default async function TradingQuizPage() {
  const supabase = createClient();

  const { data, error } =
    await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div>
      <div className="h-14 lg:h-[55px] border-b w-full bg-white dark:bg-black flex items-center gap-4 z-1">
        <div className="px-4 -z-1">
          <JournalNavigation />
        </div>
        <div className="justify-end px-2 ml-auto">
          <AddTradesButton />
        </div>
      </div>

      <main className=" my-auto flex p-4">
        <TraderTypeQuiz />
        <Toaster />
      </main>
    </div>
  );
}
