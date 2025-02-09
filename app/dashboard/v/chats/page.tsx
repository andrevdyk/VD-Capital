import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ChatPageClient } from "./components/ChatPage"

export default async function ChatsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return <ChatPageClient userId={user.id} />
}

