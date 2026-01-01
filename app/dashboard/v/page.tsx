import { createClient } from "@/utils/supabase/server"
import { getProfile } from "./actions/users"
import ProfileCreationForm from "./components/ProfileCreationForm"
import { Feed } from "./components/Feed"
import PostForm from "./components/PostForm"


export default async function Dashboard() {
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
    <div className="container mx-auto px-4 py-4">
      <div className="mb-8 border rounded-lg p-5">
        <PostForm userId={user.id} userAvatar={profile.avatar_url || undefined} />
      </div>
      <Feed userId={user.id} />
    </div>
  )
}

