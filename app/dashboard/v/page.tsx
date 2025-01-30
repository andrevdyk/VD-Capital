import { createClient } from "@/utils/supabase/server"
import { getProfile } from "./actions/users"
import ProfileCreationForm from "./components/ProfileCreationForm"
import { Feed } from "./components/Feed"
import PostForm from "./components/PostForm"

export default async function Dashboard() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return <div>Please sign in to access this page.</div>
  }

  const { data: profile, error } = await getProfile(session.user.id)

  if (error && error !== "Profile not found") {
    return <div>Error: {error}</div>
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create Your Profile</h1>
        <ProfileCreationForm userId={session.user.id} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create a Post</h2>
        <PostForm userId={session.user.id} />
      </div>
      <Feed userId={session.user.id} />
    </div>
  )
}

