import { createClient } from "@/utils/supabase/server"
//import { ChatSection } from "../components/ChatSection"

export default async function ChatsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please sign in to access chats.</div>
  }
/*
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chats</h1>
      <ChatSection userId={user.id} />
    </div>
  )*/
}
