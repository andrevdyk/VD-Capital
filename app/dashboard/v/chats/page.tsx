import { createClient } from "@/utils/supabase/server"
import { getProfile } from "../actions/users"
import ProfileCreationForm from "../components/ProfileCreationForm"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ChatPageClient } from "../components/ChatPageClient"

export default async function ChatsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please sign in to access this page.</div>
  }

  const { data: profile, error } = await getProfile(user.id)

  if (error && error !== "Profile not found") {
    return <div>Error: {error}</div>
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create Your Profile</h1>
        <ProfileCreationForm userId={user.id} />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <ChatPageClient
        userId={user.id}
        userAvatar={profile.avatar_url || ""}
        userDisplayName={profile.display_name || user.email || ""}
      />
    </SidebarProvider>
  )
}

