import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { AddTradesButton } from "./components/add-trades-button";
import { JournalNavigation } from "./components/journal-navigation";

export default async function TradingUploadPage() {
  const supabase = createClient();

  const { data, error } =
    await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div>
      <div className="h-14 lg:h-[55px] border-b w-full bg-white dark:bg-black flex items-center gap-4 z-1">
        <div className="px-4">
            <JournalNavigation/>
        </div>
        <div className="justify-end px-2 ml-auto">
            <AddTradesButton />
        </div>
        
      </div>
      <div className="container mx-auto p-4 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>
              Trade Journal
            </CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>
    </div>
  );
}
