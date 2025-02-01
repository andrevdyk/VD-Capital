import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { getProfile } from "../../actions/users"
import { EditProfileForm } from "../../components/EditProfileForm"
import { UserPosts } from "../../components/UserPosts"
import { CoverImage } from "../../components/CoverImage"
import { AvatarClient } from "../../components/AvatarClient"

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please sign in to access this page.</div>
  }

  const { data: profile, error } = await getProfile(params.id)

  if (error || !profile) {
    notFound()
  }

  const isOwnProfile = user.id === profile.id

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CoverImage url={profile.cover_image_url || undefined} isEditable={isOwnProfile} userId={profile.id} />
        <CardContent className="relative">
          <div className="flex items-center space-x-4 -mt-12">
            <AvatarClient avatarUrl={profile.avatar_url} username={profile.username} />
            <div>
              <h2 className="text-2xl font-semibold">{profile.display_name}</h2>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>
          </div>
          {isOwnProfile && (
            <div className="mt-4">
              <EditProfileForm profile={profile} />
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Posts</h3>
        <UserPosts userId={profile.id} />
      </div>
    </div>
  )
}

