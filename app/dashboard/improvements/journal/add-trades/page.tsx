import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CSVUploader from "./components/upload";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default async function TradingUploadPage() {
  const supabase = createClient();

  const { data, error } =
    await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">
        Upload Trading History
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>
            CSV Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CSVUploader
            userId={data.user.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
